<?php

namespace App\Services;

use App\Models\Location;
use App\Models\Visit;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AntiFraudService
{
    /**
     * Evaluates multi-signal GPS & device telemetry to calculate fraud risk (0 - 100).
     */
    public function evaluateTelemetry(
        Location $targetLocation,
        float $agentLat,
        float $agentLng,
        float $gpsAccuracyMeters,
        bool $isMockProvider,
        string $agentId,
        Carbon $checkInTime
    ): array {
        $fraudScore = 0;
        $flags = [];

        // 1. PostGIS Spherical Distance calculation
        $distanceMeters = DB::selectOne("
            SELECT ST_DistanceSphere(
                ST_MakePoint(?, ?),
                ST_MakePoint(?, ?)
            ) as distance
        ", [$agentLng, $agentLat, $targetLocation->longitude, $targetLocation->latitude])->distance;

        $distanceMeters = round($distanceMeters, 2);

        // 2. Geofence evaluation
        $allowedRadius = $targetLocation->geofence_radius_meters;
        if ($distanceMeters <= $allowedRadius) {
            $geofenceStatus = 'inside_geofence';
        } elseif ($distanceMeters <= ($allowedRadius * 2.5)) {
            $geofenceStatus = 'outside_warning';
            $fraudScore += 25;
            $flags[] = "GEOFENCE_PROXIMITY_WARNING_{$distanceMeters}M";
        } else {
            $geofenceStatus = 'outside_rejected';
            $fraudScore += 45;
            $flags[] = "GEOFENCE_BREACH_{$distanceMeters}M";
        }

        // 3. Android Mock Location Provider check
        if ($isMockProvider) {
            $fraudScore += 50;
            $flags[] = "MOCK_LOCATION_HARDWARE_FLAG_DETECTED";
        }

        // 4. Degraded GPS accuracy radius check
        if ($gpsAccuracyMeters > 35) {
            $fraudScore += 20;
            $flags[] = "DEGRADED_GPS_ACCURACY_{$gpsAccuracyMeters}M";
        }

        // 5. Velocity & Impossible Travel Check against Agent's Last Visit
        $lastVisit = Visit::where('agent_id', $agentId)
            ->where('id', '!=', null)
            ->orderBy('check_in_time', 'desc')
            ->first();

        if ($lastVisit && $lastVisit->check_out_time) {
            $lastTime = Carbon::parse($lastVisit->check_out_time);
            $diffHours = $checkInTime->diffInMinutes($lastTime) / 60.0;

            if ($diffHours > 0 && $diffHours < 2.0) {
                $lastDistanceKm = DB::selectOne("
                    SELECT ST_DistanceSphere(
                        ST_MakePoint(?, ?),
                        ST_MakePoint(?, ?)
                    ) / 1000.0 as dist_km
                ", [$agentLng, $agentLat, $lastVisit->check_in_lng, $lastVisit->check_in_lat])->dist_km;

                $speedKmh = $lastDistanceKm / $diffHours;
                if ($speedKmh > 120.0) { // Unrealistic in Kenyan road conditions
                    $fraudScore += 40;
                    $flags[] = "IMPOSSIBLE_TRAVEL_SPEED_" . round($speedKmh) . "_KMH";
                }
            }
        }

        return [
            'distance_meters' => $distanceMeters,
            'geofence_status' => $geofenceStatus,
            'fraud_score' => min(100, $fraudScore),
            'fraud_flags' => $flags
        ];
    }
}
