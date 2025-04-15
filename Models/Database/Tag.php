<?php

namespace BugQuest\Framework\Models\Database;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Tag extends Model
{
    protected $table = 'media_tags';

    protected $fillable = ['name'];

    /**
     * Relation avec les médias
     */
    public function medias(): BelongsToMany
    {
        return $this->belongsToMany(Media::class, 'media_tag_media', 'tag_id', 'media_id');
    }
}