/**
 * Notifications Dropdown Component
 */

import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NotificationsDropdownProps } from './HeaderTypes';

export function NotificationsDropdown({ 
  notifications, 
  showNotifications, 
  onToggleNotifications, 
  notificationRef 
}: NotificationsDropdownProps) {
  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="relative" ref={notificationRef}>
      <button
        onClick={onToggleNotifications}
        className="relative p-2 text-text-secondary hover:text-text-primary hover:bg-surface-secondary rounded-lg transition-colors"
        title="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-error-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-surface-elevated rounded-lg shadow-xl border border-border-primary py-2 z-50">
          <div className="px-4 py-2 border-b border-border-secondary">
            <h3 className="font-medium text-text-primary">Notifications</h3>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-4 py-3 border-l-4 hover:bg-surface-secondary ${
                  notification.unread ? 'border-l-primary-500 bg-primary-50' : 'border-l-transparent'
                }`}
              >
                <p className="text-sm font-medium text-text-primary">{notification.title}</p>
                <p className="text-xs text-text-tertiary mt-1">{notification.time}</p>
              </div>
            ))}
          </div>
          <div className="px-4 py-2 border-t border-border-secondary">
            <Link to="/app/notifications" className="text-sm text-primary-600 hover:text-primary-700">
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}