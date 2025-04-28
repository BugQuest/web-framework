<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Capsule\Manager;

class CreatePageSeoTable extends Migration
{
    public function up(): void
    {
        Manager::schema()->create('page_seo', function (Blueprint $table) {
            $table->id();
            $table->foreignId('page_id')->constrained('pages')->onDelete('cascade');
            $table->string('redirect_to', 512)->nullable();
            $table->boolean('no_index')->default(false);
            $table->boolean('no_follow')->default(false);
            $table->json('meta')->nullable();
            $table->json('open_graph')->nullable();
            $table->json('twitter')->nullable();
            $table->json('structured_data')->nullable();
            $table->string('canonical_url', 512)->nullable();
            $table->float('sitemap_priority')->default(0.5);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Manager::schema()->dropIfExists('page_seo');
    }
}