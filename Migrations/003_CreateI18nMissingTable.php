<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Capsule\Manager;

class CreateI18nMissingTable extends Migration
{
    public function up(): void
    {
        Manager::schema()->create('i18n_missing', function (Blueprint $table) {
            $table->id();
            $table->string('domain', 64);
            $table->string('locale', 8);
            $table->string('keyname', 255);
            $table->timestamps();
            $table->unique(['domain', 'locale', 'keyname'], 'i18n_missing_unique');
        });
    }

    public function down(): void
    {
        Manager::schema()->dropIfExists('i18n_missing');
    }
}