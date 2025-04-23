<?php

namespace BugQuest\Framework\Models\Database;

use BugQuest\Framework\Helpers\StringHelper;
use Illuminate\Database\Eloquent\Model;

class Page extends Model
{
    protected $table = 'pages';

    protected $fillable = [
        'id',
        'parent_id',
        'title',
        'slug',
        'html',
        'builder_data',
        'order',
    ];

    protected $casts = [
        'builder_data' => 'array',
    ];

    public function parent(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Page::class, 'parent_id');
    }

    public function children(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Page::class, 'parent_id');
    }

    /**
     * Recalculates slug from parent recursively: /parent-slug/child-slug
     *
     * @return void
     */
    public function resolveUrl(): void
    {
        $segments = [];

        $page = $this;
        while ($page) {
            $slug = StringHelper::sanitize_title($page->title);
            array_unshift($segments, $slug);
            $page = $page->parent;
        }

        $resolved = implode('/', $segments);

        // Ne met à jour le slug que si différent (évite la boucle infinie)
        if ($this->slug !== $resolved) {
            $this->slug = $resolved;
            $this->save();
        }
    }
}