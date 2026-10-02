import { GeofenceStatus } from '../types';

export interface TelemetryCheckResult {
  distanceMeters: number;
  geofenceStatus: GeofenceStatus;
  fraudRiskScore: number;
  fraudFlags: string[];
  isCheckInAllowed: boolean;
}

export class GeoService {
  /**
   * Calculates the great-circle distance between two points on the Earth's surface
   * using the Haversine formula (matches PostGIS ST_DistanceSphere).
   */
  public static calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371000; // Earth radius in meters
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Evaluates location check-in against assigned target and anti-fraud criteria
   */
  public static evaluateCheckIn(
    agentLat: number,
    agentLon: number,
    targetLat: number,
    targetLon: number,
    geofenceRadiusMeters: number,
    gpsAccuracyMeters: number,
    isMockLocationActive: boolean = false
  ): TelemetryCheckResult {
    const distanceMeters = Math.round(
      this.calculateHaversineDistance(agentLat, agentLon, targetLat, targetLon)
    );

    let geofenceStatus: GeofenceStatus = 'inside_geofence';
    let fraudRiskScore = 0;
    const fraudFlags: string[] = [];

    // 1. Geofence evaluation
    if (distanceMeters <= geofenceRadiusMeters) {
      geofenceStatus = 'inside_geofence';
    } else if (distanceMeters <= geofenceRadiusMeters * 2.5) {
      geofenceStatus = 'outside_warning';
      fraudRiskScore += 25;
      fraudFlags.push(`GEOFENCE_PROXIMITY_WARNING_${distanceMeters}M`);
    } else {
      geofenceStatus = 'outside_rejected';
      fraudRiskScore += 45;
      fraudFlags.push(`GEOFENCE_BREACH_${distanceMeters}M`);
    }

    // 2. Mock location telemetry
    if (isMockLocationActive) {
      fraudRiskScore += 50;
      fraudFlags.push('HARDWARE_MOCK_LOCATION_PROVIDER_DETECTED');
    }

    // 3. GPS Accuracy radius
    if (gpsAccuracyMeters > 35) {
      fraudRiskScore += 20;
      fraudFlags.push(`DEGRADED_GPS_ACCURACY_${Math.round(gpsAccuracyMeters)}M`);
    }

    // Cap score at 100
    fraudRiskScore = Math.min(100, fraudRiskScore);

    // Rule: Allow if score < 70 (outside_rejected visits still recorded for disciplinary auditing)
    const isCheckInAllowed = fraudRiskScore < 70;

    return {
      distanceMeters,
      geofenceStatus,
      fraudRiskScore,
      fraudFlags,
      isCheckInAllowed
    };
  }
}
