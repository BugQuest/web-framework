<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Capsule\Manager;

class CreateMediasTable extends Migration
{
    public function up(): void
    {
        Manager::schema()->create('medias', function (Blueprint $table) {
            $table->id();
            $table->string('filename');
            $table->string('original_name');
            $table->string('mime_type');
            $table->string('extension', 10)->nullable();
            $table->bigInteger('size')->nullable();
            $table->string('path')->nullable();
            $table->string('url')->nullable();
            $table->string('slug')->nullable();
            $table->json('exif')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Manager::schema()->dropIfExists('medias');
    }
}