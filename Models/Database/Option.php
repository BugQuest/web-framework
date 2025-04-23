<?php

namespace BugQuest\Framework\Models\Database;

use Illuminate\Database\Eloquent\Model;

class Option extends Model
{
    protected $table = 'options';
    protected $fillable = ['group', 'key', 'value'];
    public $timestamps = true;

    protected $casts = [
        'value' => 'array',
    ];
}