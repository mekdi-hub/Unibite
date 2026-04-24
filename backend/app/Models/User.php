<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Auth\Passwords\CanResetPassword;
use App\Notifications\ResetPasswordNotification;

use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, HasApiTokens, CanResetPassword;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'address',
        'role',
        'status',
        'google_id',
        'avatar',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // Relationships
    public function restaurant()
    {
        return $this->hasOne(Restaurant::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function studentOrders()
    {
        return $this->hasMany(Order::class, 'student_id');
    }

    public function restaurantOrders()
    {
        return $this->hasMany(Order::class, 'restaurant_id');
    }

    public function deliveries()
    {
        return $this->hasMany(Delivery::class, 'rider_id');
    }

    public function menuItems()
    {
        return $this->hasMany(MenuItem::class, 'restaurant_id');
    }

    // Role checking methods
    public function isStudent(): bool
    {
        return $this->role === 'student';
    }

    public function isRestaurant(): bool
    {
        return $this->role === 'restaurant';
    }

    public function isRider(): bool
    {
        return $this->role === 'rider';
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    // Scopes
    public function scopeByRole($query, string $role)
    {
        return $query->where('role', $role);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Send the password reset notification.
     *
     * @param  string  $token
     * @return void
     */
    public function sendPasswordResetNotification($token)
    {
        $this->notify(new ResetPasswordNotification($token));
    }
}
