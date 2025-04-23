<?php

namespace BugQuest\Framework\Models\Database;

use Illuminate\Database\Eloquent\Model;

class Meta extends Model
{
    protected $table = 'meta'; // nom de la table
    protected $fillable = ['key', 'value', 'type'];

    public function prepare()
    {
        if (is_bool($this->value))
            $this->type = 'boolean';
        elseif (is_int($this->value))
            $this->type = 'integer';
        elseif (is_float($this->value))
            $this->type = 'float';
        elseif (is_string($this->value))
            $this->type = 'string';
        elseif (is_array($this->valuealue))
            $this->type = 'array';
        else
            throw new \Exception("Invalid meta type");

        switch ($this->type) {
            case 'boolean':
                $this->value = $this->value ? 'true' : 'false';
                break;
            case 'array':
                $this->value = serialize($this->value);
                break;
            case 'float':
            case 'integer':
            case 'string':
            default:
                $this->value = (string)$this->value;
        }
    }

    public function parse()
    {
        switch ($this->type) {
            case 'boolean':
                $this->value = ($this->value === 'true' || $this->value === '1');
                break;
            case 'integer':
                $this->value = (int)$this->value;
                break;
            case 'float':
                $this->value = (float)$this->value;
                break;
            case 'string':
                $this->value = (string)$this->value;
                break;
            case 'array':
                $this->value = unserialize($this->value);
                break;
            default:
                return $this->value;
        }
    }
}