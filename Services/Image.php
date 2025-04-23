<?php

namespace BugQuest\Framework\Services;

//@todo: clean this class and adapt to new framework
abstract class Image
{
    private static array $_sizes = [];
    private static array $_options = [];

    public static function getImageWithFallback(null|string $url, string $size_name = "original", bool &$is_placeholder = false, bool $absolute_path = false)
    {
        $placeholder = self::_getOptions()['placeholder'] ?? null;

        self::_setSizes();

        $cache_directory = self::_cacheDirectory();

        if (!$url) {
            $is_placeholder = true;
            $url = $placeholder;
        }

        //if wordpress dont give us the original full size image
        //check with regex if end of url is *-scaled* .extention, if it, remove it
        if (preg_match('/-scaled\.(jpe?g|jpe|gif|png)\b/i', $url, $matches))
            $url = preg_replace('/-scaled\.(jpe?g|jpe|gif|png)\b/i', ".$1", $url);

        //si la taille n'existe pas on ne retourne pas d'image
        if (!array_key_exists($size_name, self::$_sizes))
            throw new \Exception("Altimax Image: " . $size_name . ' size not found');


        $url = trim($url);
        $path_info = pathinfo($url);
        $image_uid = $is_placeholder ? 'placeholder' : md5($path_info['filename']);
        $image_extention = $path_info['extension'];
        $image_file = $image_uid . DS . $size_name . ".{$image_extention}";
        $image_path = $cache_directory . $image_file;

        if ($comp = self::getCompressed($image_path, $absolute_path))
            return $comp;

        $image_url = '/cache/images/' . $image_file;

        $image_size = self::$_sizes[$size_name];

        //check if is svg, return if is
        if ($image_extention == 'svg')
            return $absolute_path ? $url : str_replace(BQ_PUBLIC_DIR, '', $url);


        if (!file_exists($image_path)) {
            $image_file_original = $image_uid . DS . "original.{$image_extention}";
            $image_path_original = $cache_directory . $image_file_original;

            if (!file_exists($image_path_original)) {
                preg_match('/[^\?]+\.(jpe?g|jpe|gif|png)\b/i', $url, $matches);

                if (!$matches)
                    //le format de l'image n'est pas reconnu, (jpg, jpeg, gif, png)
                    throw new \Exception('Altimax Image: Image format not recognized, only jpg, jpeg, gif, png');


                $directory = pathinfo($image_path_original, PATHINFO_DIRNAME);
                if (!is_dir($directory))
                    mkdir($directory, 0755, true);

                $site_url = get_site_url();
                $site_url = str_replace('https://', '', $site_url);
                $site_url = str_replace('http://', '', $site_url);
                $site_url = str_replace('www.', '', $site_url);
                $site_url = str_replace('/cms', '', $site_url);

                //check if image is on same server, if not download it


                if (str_contains($url, $site_url)) {
                    $original_path = $url;
                    $original_path = str_replace('https://', '', $original_path);
                    $original_path = str_replace('http://', '', $original_path);
                    $original_path = str_replace($site_url, '', $original_path);
                    $original_path = BQ_ROOT . DS . 'htdocs' . $original_path;
                    copy($original_path, $image_path_original);

                } else {
                    $file_array = [
                        'name' => basename($image_uid),
                        'tmp_name' => download_url($url)
                    ];;

                    // If error storing temporarily, log the error and continue loop
                    if (is_wp_error($file_array['tmp_name'])) {
                        rmdir($directory);
                        return false;
                    }

                    copy($file_array['tmp_name'], $image_path_original);
                    //remove downloaded temp file
                    unlink($file_array['tmp_name']);
                }
            }

            if (!extension_loaded('imagick')) {
                rmdir($directory);
                throw new \Exception('Imagick not installed');
            }


            try {
                $image = new \imagick($image_path_original);
                $rotation = $image->getImageOrientation();
                self::_autorotate($image, $rotation);

                $w = $image->getImageWidth();
                $h = $image->getImageHeight();
                $new_h = $image_size[1];
                $new_w = $image_size[0];
                $crop = $image_size[2] ?? false;

                //if width superior to height
                if ($w > $h) {
                    $resize_w = $w * $new_h / $h;
                    $resize_h = $new_h;
                } else {
                    $resize_w = $new_w;
                    $resize_h = $h * $new_w / $w;
                }


                // Si on doit recadrer
                if ($crop) {
                    // Vérifie si l'image redimensionnée est assez grande pour le crop demandé
                    if ($resize_w < $new_w || $resize_h < $new_h) {
                        // Adapter les dimensions pour s'assurer que le crop est possible
                        // ici on donne la priorité au plus contraignant
                        $scale = max($new_w / $w, $new_h / $h);
                        $resize_w = ceil($w * $scale);
                        $resize_h = ceil($h * $scale);
                    }
                }

                // Redimensionnement de l'image (proportionnel)
                $image->resizeImage($resize_w, $resize_h, \Imagick::FILTER_LANCZOS, 0.9, true);

                // Recadrage centré si demandé
                if ($crop) {
                    $x = (int)(($resize_w - $new_w) / 2);
                    $y = (int)(($resize_h - $new_h) / 2);
                    $image->cropImage($new_w, $new_h, $x, $y);
                    $image->setImagePage(0, 0, 0, 0); // Réinitialise la page pour éviter des décalages
                }

                $image->writeImage($image_path);
                $image->clear();
                $image->destroy();
            } catch (\Exception $e) {
                if (isset($directory))
                    rmdir($directory);

                return self::getImageWithFallback($placeholder, $size_name, $is_placeholder, $absolute_path);
            }
        }

        return self::getCompressed($image_path, $absolute_path);
    }

    public static function getCompressed(string $path, bool $absolute_path = false)
    {
        switch (self::_getOptions()['method']) {
            case 'webp':
                return self::getWebp($path, $absolute_path);
            case 'avif':
                return self::getAvif($path, $absolute_path);
            default:
                return false;
        }
    }

    public static function getWebp(string $path, bool $absolute_path = false)
    {
        if (!\function_exists("imagewebp"))
            return false;

        $path_dir = \pathinfo($path);
        $path_webp = $path_dir['dirname'] . DS . $path_dir['filename'] . '.webp';
        $extension = \pathinfo($path, PATHINFO_EXTENSION);

        if ($extension == 'webp')
            return $path;

        if (\file_exists($path_webp))
            return $absolute_path ? $path_webp : str_replace(BQ_ROOT . DS . 'htdocs', '', $path_webp);

        if (!\file_exists($path))
            return false;

        if (!\file_exists($path_webp)) {
            $image = \imagecreatefromstring(file_get_contents($path));

            //if is png use imagesavealpha
            if ($extension == 'png') {
                \imagepalettetotruecolor($image);
                \imagealphablending($image, true);
                \imagesavealpha($image, true);
            }
            \imagewebp($image, $path_webp, 80);
            \imagedestroy($image);

            //if path name do not contain original remove it
            if (strpos($path, 'original') === false)
                unlink($path); //remove original image
        }

        return $absolute_path ? $path_webp : str_replace(BQ_ROOT . DS . 'htdocs', '', $path_webp);
    }

    public static function getAvif(string $path, bool $absolute_path = false)
    {
        if (!\function_exists("imageavif"))
            return false;

        $path_dir = \pathinfo($path);
        $path_avif = $path_dir['dirname'] . DS . $path_dir['filename'] . '.avif';
        $extension = \pathinfo($path, PATHINFO_EXTENSION);

        if ($extension == 'avif')
            return $path;

        if (\file_exists($path_avif))
            return $absolute_path ? $path_avif : str_replace(BQ_ROOT . DS . 'htdocs', '', $path_avif);

        if (!\file_exists($path))
            return false;

        if (!\file_exists($path_avif)) {
            $image = \imagecreatefromstring(file_get_contents($path));

            //if is png use imagesavealpha
            if ($extension == 'png') {
                \imagepalettetotruecolor($image);
                \imagealphablending($image, true);
                \imagesavealpha($image, true);
            }
            \imageavif($image, $path_avif, 80);
            \imagedestroy($image);

            //if path name do not contain original remove it
            if (strpos($path, 'original') === false)
                unlink($path); //remove original image
        }

        return $absolute_path ? $path_avif : str_replace(BQ_ROOT . DS . 'htdocs', '', $path_avif);
    }

    private static function _setSizes()
    {
        if (!self::$_sizes) {
            //@todo get from config, add hook system
            $config_image = Hooks::runFilter('config_image_sizes', [
                ['width' => 150, 'height' => 150, 'crop' => true],
                ['width' => 300, 'height' => 300, 'crop' => true],
                ['width' => 768, 'height' => 768, 'crop' => true],
                ['width' => 1024, 'height' => 1024, 'crop' => true],
                ['width' => 1200, 'height' => 1200, 'crop' => true],
                ['width' => 1600, 'height' => 1600, 'crop' => true],
                ['width' => 2000, 'height' => 2000, 'crop' => true],
            ]);
            self::$_sizes = array_map(function ($size) {
                return [$size['width'], $size['height'], $size['crop']];
            }, $config_image);
            self::$_sizes['original'] = [0, 0, false];
            self::$_sizes['_original'] = [0, 0, false];
        }
    }

    private static function _cacheDirectory()
    {
        $cache_directory = BQ_ROOT . DS . 'htdocs' . DS . 'cache' . DS . 'images' . DS;
        if (!is_dir($cache_directory))
            mkdir($cache_directory, 0755, true);

        return $cache_directory;
    }

    private static function _autorotate(\imagick &$image, $rotation)
    {
        switch ($rotation) {
            case \imagick::ORIENTATION_TOPLEFT:
                break;
            case \imagick::ORIENTATION_TOPRIGHT:
                $image->flopImage();
                break;
            case \imagick::ORIENTATION_BOTTOMRIGHT:
                $image->rotateImage("#000", 180);
                break;
            case \imagick::ORIENTATION_BOTTOMLEFT:
                $image->flopImage();
                $image->rotateImage("#000", 180);
                break;
            case \imagick::ORIENTATION_LEFTTOP:
                $image->flopImage();
                $image->rotateImage("#000", -90);
                break;
            case \imagick::ORIENTATION_RIGHTTOP:
                $image->rotateImage("#000", 90);
                break;
            case \imagick::ORIENTATION_RIGHTBOTTOM:
                $image->flopImage();
                $image->rotateImage("#000", 90);
                break;
            case \imagick::ORIENTATION_LEFTBOTTOM:
                $image->rotateImage("#000", -90);
                break;
            default: // Invalid orientation
                break;
        }
        $image->setImageOrientation(\Imagick::ORIENTATION_TOPLEFT);
    }

    //============================== Options ==============================

    private static function _getOptions(): array
    {
        //@todo get from config, add hook system
        return [];
    }

}