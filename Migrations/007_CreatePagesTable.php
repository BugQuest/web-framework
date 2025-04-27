<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Capsule\Manager;

class CreatePagesTable extends Migration
{
    public function up(): void
    {
        Manager::schema()->create('pages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('html')->nullable();
            $table->text('css')->nullable();
            $table->json('builder_data')->nullable();
            $table->enum('status', ['draft', 'private', 'published', 'archived'])->default('draft');
            $table->integer('order')->default(0);
            $table->timestamps();

            $table->foreign('parent_id')->references('id')->on('pages')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Manager::schema()->dropIfExists('pages');
    }
}