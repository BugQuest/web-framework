<?php

namespace BugQuest\Framework\Models\Database;

use Illuminate\Database\Eloquent\Model;

class PageSeo extends Model
{
    protected $table = 'page_seo';

    protected $fillable = [
        'page_id',
        'meta_description',
        'meta_keywords',
        'og_title',
        'og_description',
        'og_image',
        'og_type',
        'twitter_card',
        'twitter_title',
        'twitter_description',
        'twitter_image',
        'robots_index',
        'robots_follow',
        'canonical_url',
        'structured_data',
        'hreflang',
        'pagination_rel',
        'custom_head_tags',
        'sitemap_priority',
        'sitemap_changefreq',
        'redirect_to',
    ];

    protected $casts = [
        'pagination_rel' => 'array',
        'custom_head_tags' => 'array',
    ];

    public function page()
    {
        return $this->belongsTo(Page::class);
    }

    public function generateMetaTags(): string
    {
        $tags = [];

        if ($this->meta_description) {
            $tags[] = '<meta name="description" content="' . e($this->meta_description) . '">';
        }

        if ($this->meta_keywords) {
            $tags[] = '<meta name="keywords" content="' . e($this->meta_keywords) . '">';
        }

        $tags[] = '<meta name="robots" content="' . e($this->robots_index . ',' . $this->robots_follow) . '">';

        if ($this->canonical_url) {
            $tags[] = '<link rel="canonical" href="' . e($this->canonical_url) . '">';
        }

        if ($this->og_title) {
            $tags[] = '<meta property="og:title" content="' . e($this->og_title) . '">';
        }
        if ($this->og_description) {
            $tags[] = '<meta property="og:description" content="' . e($this->og_description) . '">';
        }
        if ($this->og_image) {
            $tags[] = '<meta property="og:image" content="' . e($this->og_image) . '">';
        }
        if ($this->og_type) {
            $tags[] = '<meta property="og:type" content="' . e($this->og_type) . '">';
        }

        if ($this->twitter_card) {
            $tags[] = '<meta name="twitter:card" content="' . e($this->twitter_card) . '">';
        }
        if ($this->twitter_title) {
            $tags[] = '<meta name="twitter:title" content="' . e($this->twitter_title) . '">';
        }
        if ($this->twitter_description) {
            $tags[] = '<meta name="twitter:description" content="' . e($this->twitter_description) . '">';
        }
        if ($this->twitter_image) {
            $tags[] = '<meta name="twitter:image" content="' . e($this->twitter_image) . '">';
        }

        if ($this->structured_data) {
            $tags[] = '<script type="application/ld+json">' . e($this->structured_data) . '</script>';
        }

        if (!empty($this->custom_head_tags)) {
            foreach ($this->custom_head_tags as $tag) {
                $tags[] = $tag;
            }
        }

        return implode("\n", $tags);
    }
}