<?php

namespace BugQuest\Framework\Models\Database;

use Illuminate\Database\Eloquent\Model;

class PageSeo extends Model
{
    protected $table = 'page_seo';

    protected $fillable = [
        'page_id',
        'redirect_to',
        'canonical_url',
        'no_index',
        'no_follow',
        'meta',
        'open_graph',
        'twitter',
        'structured_data',
        'sitemap_priority'
    ];

    protected $casts = [
        'meta' => 'array',
        'open_graph' => 'array',
        'twitter' => 'array',
        'structured_data' => 'array',
        'no_index' => 'boolean',
        'no_follow' => 'boolean',
        'sitemap_priority' => 'float',
    ];

    public function page()
    {
        return $this->belongsTo(Page::class);
    }

    public function checkRedirect()
    {
        if ($this->redirect_to) {
            header('Location: ' . $this->redirect_to, true, 301);
            exit();
        }
    }

    public function generateMetaTags(): string
    {
        $tags = [];

        $tags[] = '<!-- Page SEO -->';

        if ($this->no_index || $this->no_follow) {
            $robots = [];
            if ($this->no_index) $robots[] = 'noindex';
            if ($this->no_follow) $robots[] = 'nofollow';
            $tags[] = '<meta name="robots" content="' . implode(', ', $robots) . '">';
        }

        if ($this->redirect_to) {
            $tags[] = '<meta http-equiv="refresh" content="0; url=' . htmlspecialchars($this->redirect_to) . '">';
        }

        if ($this->canonical_url) {
            $tags[] = '<link rel="canonical" href="' . htmlspecialchars($this->canonical_url) . '">';
        }

        if (!empty($this->meta) && is_array($this->meta)) {
            foreach ($this->meta as $name => $content) {
                if ($name !== '' && $content !== '') {
                    $tags[] = '<meta name="' . htmlspecialchars($name) . '" content="' . htmlspecialchars($content) . '">';
                }
            }
        }

        if (!empty($this->open_graph) && is_array($this->open_graph)) {
            foreach ($this->open_graph as $property => $content) {
                if ($property !== '' && $content !== '') {
                    $tags[] = '<meta property="og:' . htmlspecialchars($property) . '" content="' . htmlspecialchars($content) . '">';
                }
            }
        }

        if (!empty($this->twitter) && is_array($this->twitter)) {
            foreach ($this->twitter as $name => $content) {
                if ($name !== '' && $content !== '') {
                    $tags[] = '<meta name="twitter:' . htmlspecialchars($name) . '" content="' . htmlspecialchars($content) . '">';
                }
            }
        }

        if (!empty($this->structured_data)) {
            $tags[] = '<script type="application/ld+json">' . json_encode(
                    $this->structured_data,
                    JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE
                ) . '</script>';
        }

        $tags[] = '<!-- Page SEO -->';

        return implode("\n  ", $tags);
    }

    public function autoFillSeoData(array $pageData): void
    {
        $title = $pageData['title'] ?? null;
        $description = $pageData['description'] ?? null;
        $url = $pageData['url'] ?? null;
        $image = $pageData['image'] ?? null;
        $siteName = $pageData['site_name'] ?? $_SERVER['HTTP_HOST'] ?? null;

        // Métadonnées classiques
        $this->meta = [
            'description' => $description,
        ];

        // Open Graph
        $this->open_graph = [
            'title' => $title,
            'description' => $description,
            'url' => $url,
            'image' => $image,
            'type' => 'website',
            'site_name' => $siteName,
        ];

        // Twitter
        $this->twitter = [
            'card' => $image ? 'summary_large_image' : 'summary', // Si image, carte large
            'title' => $title,
            'description' => $description,
            'image' => $image,
        ];

        // Structured Data (JSON-LD basique)
        $this->structured_data = [
            '@context' => 'https://schema.org',
            '@type' => 'WebPage',
            'name' => $title,
            'description' => $description,
            'url' => $url,
            'image' => $image,
        ];

        // Par défaut, pas de restrictions SEO
        $this->no_index = false;
        $this->no_follow = false;
    }

    public function calculateSeoScoreWithDetails(): array
    {
        $score = 0;
        $errors = [];

        // --- Vérifications principales ---

        if (!empty($this->meta['description'] ?? null)) {
            $length = strlen($this->meta['description']);
            if ($length >= 100 && $length <= 160) {
                $score += 15;
            } else {
                $score += 10;
                $errors[] = 'La meta description existe mais sa longueur n’est pas optimale (100-160 caractères).';
            }
        } else {
            $errors[] = 'Meta description manquante.';
        }

        if (!empty($this->open_graph['title'] ?? null)) {
            $length = strlen($this->open_graph['title']);
            if ($length >= 30 && $length <= 70) {
                $score += 20;
            } else {
                $score += 15;
                $errors[] = 'Le titre Open Graph existe mais sa longueur n’est pas idéale (30-70 caractères).';
            }
        } else {
            $errors[] = 'Titre Open Graph manquant.';
        }

        if (!empty($this->canonical_url)) {
            $score += 10;
        } else {
            $errors[] = 'URL canonique manquante.';
        }

        if (!empty($this->open_graph['image'] ?? null)) {
            $score += 10;

            // Bonus : vérifier taille minimum de l’image (600x315) si stocké dans structured_data
            if (!empty($this->structured_data['image'])) {
                $image = $this->structured_data['image'];
                // Simulation : Si tu stockes dimensions dans structured_data, tu pourrais vérifier ici
                // Pour l'instant on part du principe que si l'image existe, c'est OK
            }
        } else {
            $errors[] = 'Image Open Graph manquante.';
        }

        if (!empty($this->structured_data)) {
            if (!empty($this->structured_data['@type'])) {
                $score += 15;
            } else {
                $score += 10;
                $errors[] = 'Structured Data présent mais "@type" manquant.';
            }
        } else {
            $errors[] = 'Structured Data (JSON-LD) manquant.';
        }

        if (!($this->no_index ?? false) && !($this->no_follow ?? false)) {
            $score += 10;
        } else {
            $errors[] = 'Page marquée comme noindex ou nofollow.';
        }

        if (!empty($this->twitter['card'] ?? null)) {
            $score += 5;
        } else {
            $errors[] = 'Twitter Card manquante.';
        }

        if (!empty($this->redirect_to)) {
            $score -= 20;
            $errors[] = 'Page redirige vers une autre URL.';
        }

        // --- Vérifications bonus ---

        if (!empty($this->canonical_url) && strlen($this->canonical_url) <= 100) {
            $score += 5;
        } else {
            if (!empty($this->canonical_url)) {
                $errors[] = 'L\'URL canonique est trop longue (> 100 caractères).';
            }
        }

        if (!empty($this->structured_data['image'])) {
            $score += 5;
        }

        // --- Finaliser le score ---

        $score = max(0, min(100, $score));

        return [
            'score' => $score,
            'errors' => $errors
        ];
    }
}