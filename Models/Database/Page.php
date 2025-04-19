<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Page extends Model
{
    protected $table = 'pages';

    protected $fillable = [
        'title',
        'slug',
        'html',
        'builder_data',
    ];

    protected $casts = [
        'builder_data' => 'array',
    ];
}