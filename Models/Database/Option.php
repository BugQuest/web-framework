<?php

namespace BugQuest\Framework\Models\Database;

use BugQuest\Framework\Services\MediaManager;
use Illuminate\Database\Eloquent\Model;

class Option extends Model
{
    protected $table = 'options';
    protected $fillable = ['group', 'key', 'value', 'type'];
    public $timestamps = true;

    public function parseValue(): self
    {
        switch ($this->type) {
            case 'json':
                $this->value = json_decode($this->value, true);
                break;
            case 'array':
                $this->value = unserialize($this->value);
                break;
            case 'object':
                $this->value = json_decode($this->value);
                break;
            case 'int':
                $this->value = (int)$this->value;
                break;
            case 'float':
                $this->value = (float)$this->value;
                break;
            case 'bool':
                $this->value = (bool)$this->value;
                break;
            case 'date':
                $this->value = date('Y-m-d', strtotime($this->value));
                break;
            case 'datetime':
            case 'timestamp':
                $this->value = date('Y-m-d H:i:s', strtotime($this->value));
                break;
            case 'time':
                $this->value = date('H:i:s', strtotime($this->value));
                break;
            case 'email':
                $this->value = filter_var($this->value, FILTER_VALIDATE_EMAIL);
                break;
            case 'url':
                $this->value = filter_var($this->value, FILTER_VALIDATE_URL);
                break;
            case 'ip':
                $this->value = filter_var($this->value, FILTER_VALIDATE_IP);
                break;
            case 'media':
                $this->value = MediaManager::getById((int)$this->value);
                break;
            case 'id':
                try {
                    $this->value = unserialize($this->value);
                } catch (\Exception $e) {
                    return $this;
                }

                $id = (int)$this->value['id'] ?? null;
                if (!$id)
                    return $this;

                $class = $this->value['class'] ?? null;

                if (!$class)
                    return $this;

                $class = '\\' . ltrim($class, '\\');
                if (!class_exists($class))
                    return $this;

                $this->value = $class::find($id);
                break;
            case 'string':
            default:
                $this->value = (string)$this->value;
        }

        return $this;
    }

    public function prepareValue(): self
    {
        switch ($this->type) {
            case 'object':
            case 'json':
                $this->value = json_encode($this->value);
                break;
            case 'array':
                $this->value = serialize($this->value);
                break;
            case 'int':
                $this->value = (int)$this->value;
                break;
            case 'media':
                if ($this->value instanceof Media)
                    $this->value = (int)$this->value->id;
                else if (is_array($this->value) && isset($this->value['id']))
                    $this->value = (int)$this->value['id'];
                else if (is_numeric($this->value))
                    $this->value = (int)$this->value;
                break;
            case 'float':
                $this->value = (float)$this->value;
                break;
            case 'bool':
                $this->value = (bool)$this->value;
                break;
            case 'id':
                if (!is_array($this->value)) {
                    $this->value = null;
                    return $this;
                }
                $id = (int)$this->value['id'] ?? null;

                if (!$id) {
                    $this->value = null;
                    return $this;
                }

                $class = $this->value['class'] ?? null;
                if (!$class) {
                    $this->value = null;
                    return $this;
                }

                $class = '\\' . ltrim($class, '\\');
                if (!class_exists($class)) {
                    $this->value = null;
                    return $this;
                }
                $this->value = serialize([
                    'id' => $id,
                    'class' => $class
                ]);
                break;
            case 'string':
            default:
                $this->value = (string)$this->value;
                break;
        }

        return $this;
    }
}