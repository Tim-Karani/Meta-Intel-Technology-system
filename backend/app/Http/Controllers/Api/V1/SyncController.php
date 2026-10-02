<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Visit;
use App\Models\Location;
use App\Services\AntiFraudService;
use Carbon\Carbon;

class SyncController extends Controller
{
    protected AntiFraudService $antiFraud;

    public function __construct(AntiFraudService $antiFraud)
    {
        $this->antiFraud = $antiFraud;
    }

    /**
     * Ingest batch of offline SQLite transactions with idempotent client_uuid deduplication.
     */
    public function upstreamBatchIngest(Request $request)
    {
        $request->validate([
            'batch_id' => 'required|string',
            'transactions' => 'required|array',
            'transactions.*.client_uuid' => 'required|string',
            'transactions.*.location_id' => 'required|string',
            'transactions.*.check_in_lat' => 'required|numeric',
            'transactions.*.check_in_lng' => 'required|numeric'
        ]);

        $processedUuids = [];
        $errors = [];

        DB::beginTransaction();
        try {
            foreach ($request->transactions as $tx) {
                $clientUuid = $tx['client_uuid'];

                // 1. Idempotency Check: Return existing if already inserted
                $existing = Visit::where('client_uuid', $clientUuid)->first();
                if ($existing) {
                    $processedUuids[] = $clientUuid;
                    continue;
                }

                // 2. Resolve target location
                $location = Location::findOrFail($tx['location_id']);

                // 3. Evaluate Anti-Fraud Telemetry
                $eval = $this->antiFraud->evaluateTelemetry(
                    $location,
                    (float) $tx['check_in_lat'],
                    (float) $tx['check_in_lng'],
                    (float) ($tx['check_in_accuracy_meters'] ?? 10.0),
                    (bool) ($tx['is_mock_provider'] ?? false),
                    $request->user()->id,
                    Carbon::parse($tx['check_in_time'])
                );

                // 4. Atomic Visit Persistence
                $visit = Visit::create([
                    'client_uuid' => $clientUuid,
                    'assignment_id' => $tx['assignment_id'] ?? null,
                    'campaign_id' => $tx['campaign_id'],
                    'activity_id' => $tx['activity_id'],
                    'location_id' => $location->id,
                    'agent_id' => $request->user()->id,
                    'visit_date' => Carbon::parse($tx['check_in_time'])->toDateString(),
                    'check_in_time' => $tx['check_in_time'],
                    'check_out_time' => $tx['check_out_time'] ?? null,
                    'check_in_lat' => $tx['check_in_lat'],
                    'check_in_lng' => $tx['check_in_lng'],
                    'check_in_accuracy_meters' => $tx['check_in_accuracy_meters'] ?? 10.0,
                    'check_in_distance_meters' => $eval['distance_meters'],
                    'check_in_geofence_status' => $eval['geofence_status'],
                    'fraud_risk_score' => $eval['fraud_score'],
                    'fraud_flags' => json_encode($eval['fraud_flags']),
                    'status' => $eval['fraud_score'] >= 50 ? 'under_review' : 'submitted'
                ]);

                $processedUuids[] = $clientUuid;
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Batch sync completed successfully.',
                'data' => [
                    'confirmed_uuids' => $processedUuids,
                    'synced_count' => count($processedUuids)
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Sync failed: ' . $e->getMessage()
            ], 500);
        }
    }
}
