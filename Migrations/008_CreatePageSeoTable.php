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
            $table->string('meta_title', 255)->nullable();
            $table->string('meta_description', 512)->nullable();
            $table->string('meta_keywords', 512)->nullable();
            $table->string('og_title', 255)->nullable();
            $table->string('og_description', 512)->nullable();
            $table->string('og_image', 512)->nullable();
            $table->string('og_type', 50)->nullable()->default('website');
            $table->string('twitter_card', 50)->nullable()->default('summary');
            $table->string('twitter_title', 255)->nullable();
            $table->string('twitter_description', 512)->nullable();
            $table->string('twitter_image', 512)->nullable();
            $table->string('robots_index', 10)->default('index');
            $table->string('robots_follow', 10)->default('follow');
            $table->string('canonical_url', 512)->nullable();
            $table->text('structured_data')->nullable();
            $table->string('hreflang', 10)->nullable();
            $table->json('pagination_rel')->nullable();
            $table->json('custom_head_tags')->nullable();
            $table->float('sitemap_priority')->nullable();
            $table->string('sitemap_changefreq', 20)->nullable();
            $table->string('redirect_to', 512)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Manager::schema()->dropIfExists('page_seo');
    }
}