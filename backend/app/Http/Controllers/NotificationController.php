<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\NotificationService;

class NotificationController extends Controller
{
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Get all notifications for authenticated user
     */
    public function index(Request $request)
    {
        $userId = $request->user()->id;
        $notifications = $this->notificationService->getUserNotifications($userId);
        $unreadCount = $this->notificationService->getUnreadCount($userId);

        return response()->json([
            'success' => true,
            'data' => $notifications,
            'unread_count' => $unreadCount
        ]);
    }

    /**
     * Get unread notifications count
     */
    public function unreadCount(Request $request)
    {
        $userId = $request->user()->id;
        $count = $this->notificationService->getUnreadCount($userId);

        return response()->json([
            'success' => true,
            'count' => $count
        ]);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(Request $request, $id)
    {
        $result = $this->notificationService->markAsRead($id);

        return response()->json([
            'success' => $result,
            'message' => $result ? 'Notification marked as read' : 'Notification not found'
        ]);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request)
    {
        $userId = $request->user()->id;
        $count = $this->notificationService->markAllAsRead($userId);

        return response()->json([
            'success' => true,
            'message' => "{$count} notifications marked as read"
        ]);
    }

    /**
     * Delete a notification
     */
    public function destroy(Request $request, $id)
    {
        $result = $this->notificationService->deleteNotification($id, $request->user()->id);

        return response()->json([
            'success' => $result,
            'message' => $result ? 'Notification deleted successfully' : 'Notification not found or unauthorized'
        ]);
    }

    /**
     * Delete multiple notifications
     */
    public function destroyMultiple(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer'
        ]);

        $count = $this->notificationService->deleteMultipleNotifications($request->ids, $request->user()->id);

        return response()->json([
            'success' => true,
            'message' => "{$count} notification(s) deleted successfully"
        ]);
    }
}
