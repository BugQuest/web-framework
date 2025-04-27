<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Capsule\Manager;

class CreateMetaTable extends Migration
{
    public function up(): void
    {
        Manager::schema()->create('meta', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->text('value')->nullable();
            $table->string('type', 16);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Manager::schema()->dropIfExists('meta');
    }
}