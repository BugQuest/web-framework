<?php

namespace BugQuest\Framework\Models\Database;

use Illuminate\Database\Eloquent\Model;

class Meta extends Model
{
    protected $table = 'meta'; // nom de la table
    protected $fillable = ['key', 'value'];
}