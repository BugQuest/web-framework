<?php

namespace BugQuest\Framework\Models\Database;

use Illuminate\Database\Eloquent\Model;

class I18nMissing extends Model
{
    protected $table = 'i18n_missing'; // nom de la table
    protected $fillable = [
        'domain',
        'locale',
        'keyname',
    ];
}