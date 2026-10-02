<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations for the Meta Intel Technologies Platform.
     * Uses PostgreSQL 16 with PostGIS spatial geography point types.
     */
    public function up(): void
    {
        // 1. Enable PostGIS extension for spatial queries & spherical geofences
        DB::statement('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
        DB::statement('CREATE EXTENSION IF NOT EXISTS "postgis";');

        // 2. Roles & Permissions (RBAC)
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('display_name');
            $table->timestamps();
        });

        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // e.g. 'clients.create'
            $table->string('module');
            $table->string('description')->nullable();
            $table->timestamps();
        });

        Schema::create('role_permissions', function (Blueprint $table) {
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->foreignId('permission_id')->constrained()->cascadeOnDelete();
            $table->primary(['role_id', 'permission_id']);
        });

        // 3. Clients
        Schema::create('clients', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->string('code')->unique();
            $table->string('name');
            $table->string('industry')->nullable();
            $table->string('primary_contact_name')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->string('county')->default('Nairobi');
            $table->decimal('total_budget_kes', 15, 2)->default(0);
            $table->string('status')->default('active');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // 4. Users (IAM)
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->string('employee_code')->unique();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->string('password');
            $table->foreignId('role_id')->constrained('roles');
            $table->string('agent_subtype')->nullable();
            $table->uuid('supervisor_id')->nullable()->references('id')->on('users');
            $table->uuid('client_id')->nullable()->references('id')->on('clients');
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_login_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();
        });

        // 5. Locations (PostGIS)
        Schema::create('locations', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->string('code')->unique();
            $table->string('name');
            $table->string('category')->default('modern_trade');
            $table->string('county')->default('Nairobi');
            $table->string('sub_county')->nullable();
            $table->string('town')->nullable();
            $table->text('address')->nullable();
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->integer('geofence_radius_meters')->default(100);
            $table->string('channel_type')->nullable();
            $table->string('contact_person')->nullable();
            $table->string('contact_phone')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        // Add PostGIS spatial geometry column
        DB::statement("SELECT AddGeometryColumn('locations', 'coordinates', 4326, 'POINT', 2);");
        DB::statement("CREATE INDEX idx_locations_coordinates ON locations USING GIST(coordinates);");

        // 6. Campaigns & Activities
        Schema::create('campaigns', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->foreignUuid('client_id')->constrained('clients');
            $table->string('code')->unique();
            $table->string('name');
            $table->string('type')->default('Brand Activation');
            $table->text('description')->nullable();
            $table->date('start_date');
            $table->date('end_date');
            $table->string('status')->default('draft');
            $table->uuid('manager_id')->references('id')->on('users');
            $table->decimal('budget_kes', 15, 2)->default(0);
            $table->integer('target_visits')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('activities', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->foreignUuid('campaign_id')->constrained('campaigns')->cascadeOnDelete();
            $table->string('name');
            $table->string('type');
            $table->text('description')->nullable();
            $table->date('start_date');
            $table->date('end_date');
            $table->integer('target_visits_count')->default(0);
            $table->string('status')->default('pending');
            $table->timestamps();
        });

        // 7. Field Visits (Core Transaction Table)
        Schema::create('visits', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->string('client_uuid')->unique(); // Idempotent deduplication token
            $table->uuid('assignment_id')->nullable();
            $table->foreignUuid('campaign_id')->constrained('campaigns');
            $table->foreignUuid('activity_id')->constrained('activities');
            $table->foreignUuid('location_id')->constrained('locations');
            $table->foreignUuid('agent_id')->constrained('users');
            $table->date('visit_date');
            $table->timestamp('check_in_time');
            $table->timestamp('check_out_time')->nullable();
            $table->decimal('check_in_lat', 10, 7);
            $table->decimal('check_in_lng', 10, 7);
            $table->decimal('check_in_accuracy_meters', 6, 2)->default(10.0);
            $table->decimal('check_in_distance_meters', 10, 2);
            $table->string('check_in_geofence_status');
            $table->integer('fraud_risk_score')->default(0);
            $table->jsonb('fraud_flags')->default('[]');
            $table->string('status')->default('submitted');
            $table->uuid('verified_by')->nullable()->references('id')->on('users');
            $table->timestamp('verified_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['campaign_id', 'visit_date']);
            $table->index(['agent_id', 'status']);
        });

        // 8. Field Sales Transactions
        Schema::create('sales_transactions', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->foreignUuid('visit_id')->constrained('visits')->cascadeOnDelete();
            $table->foreignUuid('agent_id')->constrained('users');
            $table->foreignUuid('location_id')->constrained('locations');
            $table->decimal('total_amount_kes', 12, 2);
            $table->string('payment_method')->default('cash');
            $table->string('payment_reference')->nullable();
            $table->timestamp('transaction_time');
            $table->timestamps();
        });

        // 9. Audit Logs (Immutable)
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->foreignUuid('user_id')->nullable()->constrained('users');
            $table->string('action');
            $table->string('module');
            $table->string('entity_id')->nullable();
            $table->string('entity_title')->nullable();
            $table->text('diff_summary');
            $table->string('ip_address')->nullable();
            $table->timestamp('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('sales_transactions');
        Schema::dropIfExists('visits');
        Schema::dropIfExists('activities');
        Schema::dropIfExists('campaigns');
        Schema::dropIfExists('locations');
        Schema::dropIfExists('users');
        Schema::dropIfExists('clients');
        Schema::dropIfExists('role_permissions');
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('roles');
    }
};
