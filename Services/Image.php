<?php

namespace BugQuest\Framework\Services;

use BugQuest\Framework\Models\Database\Media;

class Image
{
    private static array $_sizes = [];

    /**
     * @throws \Exception
     */
    public static function getImageUrl(Media|string|int|null $media, string $size = 'original', bool $absolute = false): ?string
    {
        if (!extension_loaded('imagick'))
            throw new \Exception('⚠️ L’extension Imagick est requise pour le traitement des images.');

        $placeholder = OptionService::get('images', 'placeholder');

        if (!$placeholder)
            throw new \Exception('⚠️ Aucune image de remplacement définie dans les options.');

        self::loadSizes();

        if ($size !== 'original')
            if (!isset(self::$_sizes[$size]))
                throw new \Exception("Taille d'image inconnue : $size");


        try {
            $media = self::resolveMedia($media);
            $originalPath = BQ_ROOT . DS . 'htdocs' . DS . $media->path;
            if (!file_exists($originalPath))
                throw new \Exception("Fichier non trouvé : $originalPath");


            $final = self::applyCompression($size, $media, self::generateImage($media, $size, $originalPath));

            return $absolute
                ? $final
                : str_replace(BQ_ROOT . DS . 'htdocs', '', $final);

        } catch (\Exception $e) {
            if ($placeholder instanceof Media && $placeholder->path !== $media->path)
                return self::getImageUrl($placeholder, $size, $absolute);

            return null;
        }
    }

    public static function getImageHtml(Media|string|int|null $media, string $size = 'original', ?string $alt = '', array $attributes = []): ?string
    {
        try {
            $url = self::getImageUrl($media, $size);
            $attrString = '';
            foreach ($attributes as $k => $v)
                $attrString .= " $k=\"" . htmlspecialchars($v, ENT_QUOTES) . "\"";

            return sprintf('<img src="%s" alt="%s"%s>', htmlspecialchars($url, ENT_QUOTES), htmlspecialchars($alt ?? '', ENT_QUOTES), $attrString);
        } catch (\Exception $e) {
            return null;
        }
    }

    public static function getSizes(): array
    {
        self::loadSizes();
        return self::$_sizes;
    }

    private static function resolveMedia(int|string|Media $media): Media
    {
        if ($media instanceof Media)
            return $media;

        if (is_int($media)) {
            $found = Media::find($media);
            if (!$found)
                throw new \Exception("Media ID $media not found");

            return $found;
        }

        if (is_string($media)) {
            // ✅ Si c'est une URL valide
            if (filter_var($media, FILTER_VALIDATE_URL)) {
                $uid = md5($media);
                $extension = pathinfo(parse_url($media, PHP_URL_PATH), PATHINFO_EXTENSION) ?: 'jpg';
                $filename = 'media_' . $uid . '.' . $extension;
                $cachePath = 'cache/images/' . $uid . '/original.' . $extension;
                $fullPath = BQ_ROOT . DS . 'htdocs' . DS . $cachePath;

                // ✅ Vérifie si déjà téléchargé
                if (!file_exists($fullPath)) {
                    @mkdir(dirname($fullPath), 0755, true);
                    $downloaded = self::downloadFile($media, $fullPath);

                    if (!$downloaded)
                        throw new \Exception("Impossible de télécharger le média : $media");
                }

                $mime = mime_content_type($fullPath);
                $size = filesize($fullPath);

                return new Media([
                    'filename' => $filename,
                    'original_name' => basename($media),
                    'mime_type' => $mime,
                    'extension' => $extension,
                    'size' => $size,
                    'path' => $cachePath,
                    'slug' => $uid,
                ]);
            }

            // ✅ Sinon, on tente de retrouver un média par son chemin
            $media = Media::where('path', $media)->first();
            if ($media) return $media;

            throw new \Exception("Impossible de résoudre le média : $media");
        }

        throw new \InvalidArgumentException("Type de média non supporté");
    }

    private static function generateImage(Media $media, string $size, string $original): string
    {
        $hash = $media->hash();
        $hash = preg_replace('/\.[^.]+$/', '', $hash);
        $ext = pathinfo($original, PATHINFO_EXTENSION);
        $dir = self::cacheDir() . $hash;

        if (!is_dir($dir)) mkdir($dir, 0755, true);

        $target = $dir . DS . "$size.$ext";

        if (file_exists($target)) return $target;

        // Si taille originale demandée, on renvoie le fichier original
        if ($size === 'original')
            return $original;

        $sizeDef = self::$_sizes[$size];
        $w = $sizeDef['width'] ?? 0;
        $h = $sizeDef['height'] ?? 0;
        $crop = $sizeDef['crop'] ?? false;

        $image = new \Imagick($original);
        self::autoRotate($image);

        $iw = $image->getImageWidth();
        $ih = $image->getImageHeight();

        if (!$crop) {
            // Resize proportionnel (preserve aspect ratio)
            $image->resizeImage($w, $h, \Imagick::FILTER_LANCZOS, 1, true);
        } else {
            // Resize + crop centré
            $scale = max($w / $iw, $h / $ih);
            $resizeW = (int)ceil($iw * $scale);
            $resizeH = (int)ceil($ih * $scale);

            $image->resizeImage($resizeW, $resizeH, \Imagick::FILTER_LANCZOS, 1);

            $x = (int)(($resizeW - $w) / 2);
            $y = (int)(($resizeH - $h) / 2);
            $image->cropImage($w, $h, $x, $y);
            $image->setImagePage(0, 0, 0, 0);
        }

        $image->writeImage($target);
        $image->clear();;

        return $target;
    }

    private static function applyCompression(string $size, Media $media, string $path): string
    {
        $dir = pathinfo($path, PATHINFO_DIRNAME);
        $name = pathinfo($path, PATHINFO_FILENAME);

        $formatMap = [
            'webp' => 'webp',
            'avif' => 'avif'
        ];

        $method = OptionService::get('images', 'compression_method');

        if (!isset($formatMap[$method])) return $path;

        if ($size == 'original')
            $target = self::cacheDir() . $media->hash() . DS . "$size." . $formatMap[$method];
        else
            $target = $dir . DS . $name . '.' . $formatMap[$method];

        if (file_exists($target)) return $target;

        $img = new \Imagick($path);
        $img->setImageFormat($formatMap[$method]);
        $img->setImageCompressionQuality(80);
        $img->writeImage($target);
        $img->clear();

        if ($size !== 'original') {
            if (file_exists($path)) {
                try {
                    // On s'assure que le fichier est bien libéré avant de le supprimer
                    clearstatcache(true, $path);
                    unlink($path);
                } catch (\Throwable $e) {

                }
            }
        }

        return $target;
    }

    private static function cacheDir(): string
    {
        $path = BQ_ROOT . DS . 'htdocs' . DS . 'cache' . DS . 'images' . DS;
        if (!is_dir($path)) mkdir($path, 0755, true);
        return $path;
    }

    private static function loadSizes(): void
    {
        if (!self::$_sizes) {
            self::$_sizes = Hooks::runFilter('images:sizes', [
                'thumbnail' => ['width' => 150, 'height' => 150, 'crop' => true],
                'medium' => ['width' => 300, 'height' => 300, 'crop' => false],
                'large' => ['width' => 1024, 'height' => 1024, 'crop' => false],
            ]);
        }
    }

    private static function autoRotate(\Imagick &$image): void
    {
        $orientation = $image->getImageOrientation();

        switch ($orientation) {
            case \Imagick::ORIENTATION_TOPRIGHT:
                $image->flopImage();
                break;
            case \Imagick::ORIENTATION_BOTTOMRIGHT:
                $image->rotateImage("#000", 180);
                break;
            case \Imagick::ORIENTATION_BOTTOMLEFT:
                $image->flopImage();
                $image->rotateImage("#000", 180);
                break;
            case \Imagick::ORIENTATION_LEFTTOP:
                $image->flopImage();
                $image->rotateImage("#000", -90);
                break;
            case \Imagick::ORIENTATION_RIGHTTOP:
                $image->rotateImage("#000", 90);
                break;
            case \Imagick::ORIENTATION_RIGHTBOTTOM:
                $image->flopImage();
                $image->rotateImage("#000", 90);
                break;
            case \Imagick::ORIENTATION_LEFTBOTTOM:
                $image->rotateImage("#000", -90);
                break;
        }

        $image->setImageOrientation(\Imagick::ORIENTATION_TOPLEFT);
    }

    private static function downloadFile(string $url, string $destination): bool
    {
        $ch = curl_init($url);
        $fp = fopen($destination, 'wb');

        if (!$fp) return false;

        curl_setopt($ch, CURLOPT_FILE, $fp);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_FAILONERROR, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

        $success = curl_exec($ch);

        curl_close($ch);
        fclose($fp);

        if (!$success || !file_exists($destination)) {
            @unlink($destination);
            return false;
        }

        return true;
    }
}
