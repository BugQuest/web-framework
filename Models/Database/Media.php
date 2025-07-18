<?php

namespace BugQuest\Framework\Models\Database;

use BugQuest\Framework\Services\Image;
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

    public function hash(): string
    {
        return pathinfo($this->filename, PATHINFO_FILENAME);
    }

    public function absolutePath(): string
    {
        return BQ_ROOT . DS . 'htdocs' . DS . $this->path;
    }

    public function imageUrl(string $size = 'original', bool $absolute = false, string $compression_method = 'auto'): ?string
    {
        if (!in_array($this->mime_type, ['image/jpeg', 'image/png', 'image/gif']))
            throw new \Exception('⚠️ Le fichier n\'est pas une image.');

        return Image::getImageUrl($this, $size, $absolute, $compression_method);
    }

    public function imageHtml(string $size = 'original', ?string $alt = '', array $attributes = [], string $compression_method = 'auto'): ?string
    {
        if (!in_array($this->mime_type, ['image/jpeg', 'image/png', 'image/gif']))
            throw new \Exception('⚠️ Le fichier n\'est pas une image.');

        return Image::getImageHtml($this, $size, $alt, $attributes, $compression_method);
    }

    /**
     * Relation avec les tags
     */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'media_tag_media', 'media_id', 'tag_id');
    }
}