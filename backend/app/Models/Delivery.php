<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Delivery extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'rider_id',
        'pickup_time',
        'delivery_time',
        'status',
        'notes',
        'assignment_status',
        'accepted_at',
    ];

    protected $casts = [
        'pickup_time' => 'datetime',
        'delivery_time' => 'datetime',
        'accepted_at' => 'datetime',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function rider(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rider_id');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeAssigned($query)
    {
        return $query->where('status', 'assigned');
    }

    public function scopePickedUp($query)
    {
        return $query->where('status', 'picked_up');
    }

    public function scopeDelivered($query)
    {
        return $query->where('status', 'delivered');
    }

    public function assignToRider(int $riderId): void
    {
        $this->update([
            'rider_id' => $riderId,
            'status' => 'assigned',
            'assignment_status' => 'accepted',
            'accepted_at' => now(),
        ]);
    }

    public function markAsPickedUp(): void
    {
        $this->update([
            'status' => 'picked_up',
            'pickup_time' => now(),
        ]);
    }

    public function markAsDelivered(): void
    {
        $this->update([
            'status' => 'delivered',
            'delivery_time' => now(),
        ]);
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isAssigned(): bool
    {
        return $this->status === 'assigned';
    }

    public function isPickedUp(): bool
    {
        return $this->status === 'picked_up';
    }

    public function isDelivered(): bool
    {
        return $this->status === 'delivered';
    }
}