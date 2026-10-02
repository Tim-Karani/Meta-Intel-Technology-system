<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ClientController;
use App\Http\Controllers\Api\V1\CampaignController;
use App\Http\Controllers\Api\V1\LocationController;
use App\Http\Controllers\Api\V1\AttendanceController;
use App\Http\Controllers\Api\V1\VisitController;
use App\Http\Controllers\Api\V1\SyncController;
use App\Http\Controllers\Api\V1\ReportController;

/*
|--------------------------------------------------------------------------
| Meta Intel Technologies - Field Operations Platform API v1
|--------------------------------------------------------------------------
| Base URL: /api/v1
| All endpoints return standardized JSON envelopes.
| Bearer token authentication required except for /auth/login.
*/

Route::prefix('v1')->group(function () {
    
    // 1. Authentication & IAM
    Route::prefix('auth')->group(function () {
        Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('/reset-password', [AuthController::class, 'resetPassword']);
        
        Route::middleware('auth:sanctum')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::post('/refresh', [AuthController::class, 'refresh']);
            Route::get('/me', [AuthController::class, 'me']);
            Route::post('/change-password', [AuthController::class, 'changePassword']);
        });
    });

    // 2. Protected Operational Routes
    Route::middleware(['auth:sanctum', 'active.user'])->group(function () {

        // Clients
        Route::apiResource('clients', ClientController::class);
        
        // Campaigns & Activities
        Route::apiResource('campaigns', CampaignController::class);
        Route::patch('campaigns/{id}/status', [CampaignController::class, 'updateStatus']);
        Route::get('campaigns/{id}/activities', [CampaignController::class, 'activities']);
        
        // Locations & Geofences
        Route::apiResource('locations', LocationController::class);
        Route::post('locations/{id}/geofence', [LocationController::class, 'updateGeofence']);
        
        // Attendance & Shift Telemetry
        Route::post('attendance/clock-in', [AttendanceController::class, 'clockIn']);
        Route::post('attendance/clock-out', [AttendanceController::class, 'clockOut']);
        Route::get('attendance/roster', [AttendanceController::class, 'dailyRoster']);
        Route::post('attendance/{id}/override', [AttendanceController::class, 'approveOverride']);
        
        // Visits & Quality Assurance
        Route::apiResource('visits', VisitController::class);
        Route::post('visits/{id}/verify', [VisitController::class, 'verify']);
        
        // Two-Way Offline Synchronization (Core Engine)
        Route::prefix('sync')->group(function () {
            Route::get('/downstream', [SyncController::class, 'downstreamHydration']);
            Route::post('/upstream', [SyncController::class, 'upstreamBatchIngest'])->middleware('throttle:60,1');
            Route::post('/media-upload', [SyncController::class, 'uploadMediaEvidence']);
        });

        // Reports & Data Streaming
        Route::post('reports/export', [ReportController::class, 'exportCSV']);
    });
});
