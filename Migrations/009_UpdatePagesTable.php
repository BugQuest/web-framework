<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Capsule\Manager;

class UpdatePagesTable extends Migration
{
    public function up(): void
    {
        Manager::schema()->table('pages', function (Blueprint $table) {
            $table->string('language')->nullable();
            $table->foreignId('translation_of')->nullable()->constrained('pages')->onDelete('set null');
            $table->string('type')->default('page');
            $table->string('template')->nullable();
        });
    }
}