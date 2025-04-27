<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Capsule\Manager;

class CreateMediaTagMediaPivotTable extends Migration
{
    public function up(): void
    {
        Manager::schema()->create('media_tag_media', function (Blueprint $table) {
            $table->unsignedBigInteger('media_id');
            $table->unsignedBigInteger('tag_id');

            $table->foreign('media_id')->references('id')->on('medias')->onDelete('cascade');
            $table->foreign('tag_id')->references('id')->on('media_tags')->onDelete('cascade');

            $table->primary(['media_id', 'tag_id']);
        });
    }

    public function down(): void
    {
        Manager::schema()->dropIfExists('media_tag_media');
    }
}