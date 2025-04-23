<?php

namespace BugQuest\Framework\Services;

use BugQuest\Framework\Helpers\StringHelper;
use BugQuest\Framework\Models\Database\Media;
use BugQuest\Framework\Models\Database\Tag;

class MediaManager
{
    private static array $allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'text/plain',
        'image/svg+xml',
        'video/mp4',
    ];

    public static function upload(array $file, array $meta = []): ?Media
    {
        if (!in_array($file['type'], self::$allowedMimeTypes)) {
            throw new \Exception("MIME type {$file['type']} non autorisé.");
        }

        $name = uniqid('media_') . '.' . pathinfo($file['name'], PATHINFO_EXTENSION);
        $folder = BQ_PUBLIC_DIR . DS . 'medias' . DS;
        if (!is_dir($folder))
            mkdir($folder, 0777, true);

        $targetPath = $folder . $name;

        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            throw new \Exception("Échec du téléchargement.");
        }

        $exif = null;
        if (str_starts_with($file['type'], 'image/') && function_exists('exif_read_data')) {
            $exif = @exif_read_data($targetPath);
        }

        return Media::create([
            'filename' => $name,
            'original_name' => $file['name'],
            'mime_type' => $file['type'],
            'extension' => pathinfo($file['name'], PATHINFO_EXTENSION),
            'size' => filesize($targetPath),
            'path' => "medias/$name",
            'exif' => $exif ? json_encode($exif) : null,
            'meta' => json_encode([]), // ou autre contenu structuré
        ]);
    }

    public static function delete(Media $media): bool
    {
        $fullPath = BQ_PUBLIC_DIR . DS . $media->path;
        if (file_exists($fullPath))
            unlink($fullPath);

        return $media->delete();
    }

    public static function getAll(): \Illuminate\Database\Eloquent\Collection
    {
        return Media::all();
    }

    public static function getById(int $id): ?Media
    {
        return Media::find($id);
    }

    public static function getMimeTypes(): array
    {
        return self::$allowedMimeTypes;
    }

    public static function setTags(Media $media, array $tags): void
    {
        $tags = array_filter($tags, fn($t) => is_numeric($t)); // nettoyage simple
        $tags = array_map(fn($t) => (int)$t, $tags); // cast to int

        $existingTags = Tag::whereIn('id', $tags)->pluck('id')->toArray();

        //sync tags
        $media->tags()->sync($existingTags);
    }

    public static function updateMeta(Media $media, array $meta): void
    {
        $media->meta = array_merge($media->meta ?? [], $meta);
        $media->save();
    }

    public static function getPaginated(int $perPage = 24, int $page = 1, array $tags = [], array $mimes = []): array
    {
        $query = Media::query()->with('tags');

        if (!empty($tags)) {
            $query->whereHas('tags', fn($q) => $q->whereIn('id', $tags));
        }

        if (!empty($mimes)) {
            $query->whereIn('mime_type', $mimes);
        }

        $total = $query->count();

        $medias = $query->orderByDesc('created_at')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get()->toArray();

        foreach ($medias as &$media) {
            $media['exif'] = json_decode($media['exif'], true);
            $media['meta'] = json_decode($media['meta'], true);
        }

        return [
            'items' => $medias,
            'total' => $total,
            'per_page' => $perPage,
            'current_page' => $page,
            'last_page' => (int)ceil($total / $perPage),
        ];
    }

    public static function addTag(string $name): Tag
    {
        $slug = StringHelper::sanitize_title($name);
        return Tag::firstOrCreate([
            'slug' => $slug,
        ], [
            'name' => $name,
        ]);
    }

    public static function deleteTag(int $id): bool
    {
        $tag = Tag::find($id);
        if ($tag) {
            $tag->delete();
            return true;
        }
        return false;
    }

    public static function getTags(): \Illuminate\Database\Eloquent\Collection
    {
        return Tag::all();
    }
}
