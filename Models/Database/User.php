<?php

namespace BugQuest\Framework\Models\Database;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    protected $table = 'users'; // nom de la table
    protected $fillable = ['username', 'email', 'password', 'role'];
    protected $hidden = ['password'];

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isUser(): bool
    {
        return $this->role === 'user';
    }
}