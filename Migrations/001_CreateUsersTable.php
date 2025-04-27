<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Capsule\Manager;

class CreateUsersTable extends Migration
{
    public function up(): void
    {
        Manager::schema()->create('users', function (Blueprint $table) {
            $table->id();
            $table->string('username')->unique();
            $table->string('email')->unique();
            $table->string('password');
            $table->string('role');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Manager::schema()->dropIfExists('users');
    }
}