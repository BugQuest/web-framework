<?php

namespace BugQuest\Framework\Models\Database;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Media extends Model
{
    protected $table = 'medias';

    protected $fillable = [
        'filename',
        'original_name',
        'mime_type',
        'extension',
        'size',
        'path',
        'exif',
        'meta'
    ];

    protected $casts = [
        'exif' => 'array',
        'meta' => 'array',
    ];

    /**
     * Relation avec les tags
     */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'media_tag_media', 'media_id', 'tag_id');
    }
}