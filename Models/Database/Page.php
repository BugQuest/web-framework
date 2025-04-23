<?php

namespace BugQuest\Framework\Models\Database;

use BugQuest\Framework\Helpers\StringHelper;
use BugQuest\Framework\PageBuilder\BlockRegistry;
use DOMDocument;
use DOMXPath;
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
        'css',
        'builder_data',
        'status',
        'order',
    ];

    protected $casts = [
        'builder_data' => 'array',
    ];

    public static function __set_state(array $array): static
    {
        $page = new self();
        $page->id = $array['id'];
        $page->parent_id = $array['parent_id'];
        $page->title = $array['title'];
        $page->slug = $array['slug'];
        $page->html = $array['html'];
        $page->builder_data = $array['builder_data'];
        $page->status = $array['status'];
        $page->css = $array['css'];
        $page->order = $array['order'];
        return $page;
    }

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
    public function resolveUrl(): bool
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
            return true;
        }

        return false;
    }

    public function setStatus(string $status): void
    {
        if (!in_array($status, ['draft', 'private', 'published', 'archived']))
            throw new \InvalidArgumentException('Invalid status: ' . $status);

        $this->status = $status;
        $this->save();
    }

    /**
     * Récupère le breadcrumbs de la page
     *
     * @return string
     */
    public function breadcrumbs(): array
    {
        $breadcrumbs = [];
        $page = $this;

        while ($page) {
            $breadcrumbs[] = [
                'title' => $page->title,
                'slug' => $page->slug,
            ];
            $page = $page->parent;
        }

        return array_reverse($breadcrumbs);

    }

    public function parseBlocks(): string
    {
        $doc = new DOMDocument();
        @$doc->loadHTML(mb_convert_encoding($this->html, 'HTML-ENTITIES', 'UTF-8'));
        $xpath = new DOMXPath($doc);

        foreach ($xpath->query('//*[@data-block-type]') as $node) {
            $type = $node->getAttribute('data-block-type');
            $block = BlockRegistry::get($type);

            if (!$block) continue;

            // Collecte data-* => $data[]
            $data = [];
            foreach ($node->attributes as $attr)
                $data[$attr->name] = $attr->value;

            // Typage + valeurs par défaut
            $customData = $block->getCustomData();
            foreach ($customData as $key => $conf) {
                if (!isset($data[$key]) && isset($conf['default'])) {
                    $data[$key] = $conf['default'];
                }

                if (isset($data[$key]) && isset($conf['type'])) {
                    switch ($conf['type']) {
                        case 'string':
                            $data[$key] = (string)$data[$key];
                            break;
                        case 'int':
                            $data[$key] = (int)$data[$key];
                            break;
                        case 'float':
                            $data[$key] = (float)$data[$key];
                            break;
                        case 'bool':
                            $data[$key] = filter_var($data[$key], FILTER_VALIDATE_BOOLEAN);
                            break;
                        case 'array':
                            $data[$key] = json_decode($data[$key], true) ?? [];
                            break;
                    }
                }
            }

            //keep only keys in data that are in customData keys
            $data = array_intersect_key($data, $customData);

            // Rendu HTML du bloc
            try {
                $htmlOutput = $block->renderCallback($data);

                // Remplacement du nœud
                $fragment = $doc->createDocumentFragment();
                $fragment->appendXML($htmlOutput);
                $node->parentNode->replaceChild($fragment, $node);
            } catch (\Throwable $e) {
                $node->nodeValue = '[Erreur bloc ' . htmlspecialchars($type) . ']';
            }
        }

        // Nettoyage des balises inutiles <html><body>...
        $output = $doc->saveHTML();
        return preg_replace('~<(?:!DOCTYPE|/?(?:html|head|body))[^>]*>~i', '', $output);
    }
}