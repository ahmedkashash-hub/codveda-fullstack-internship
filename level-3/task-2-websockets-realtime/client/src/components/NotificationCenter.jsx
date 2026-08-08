import NotificationBadge from './NotificationBadge.jsx';
import NotificationItem from './NotificationItem.jsx';

export default function NotificationCenter({ notifications, unreadCount, onMarkRead, onMarkAllRead, onClear }) {
  return (
    <section className="notification-center" aria-labelledby="notification-title">
      <div className="notification-center-heading"><div className="title-with-badge"><h2 id="notification-title">Notification Center</h2><NotificationBadge count={unreadCount} /></div><div className="notification-actions"><button className="text-button" type="button" disabled={unreadCount === 0} onClick={onMarkAllRead}>Mark all as read</button><button className="text-button danger" type="button" disabled={notifications.length === 0} onClick={onClear}>Clear notifications</button></div></div>
      <div className="notification-live-region" aria-live="polite" aria-atomic="true">{unreadCount > 0 ? `${unreadCount} unread notifications` : 'No unread notifications'}</div>
      {notifications.length === 0 ? <p className="response-placeholder">No notifications received in this browser session.</p> : <ol className="notification-list">{notifications.map((notification) => <NotificationItem key={notification.id} notification={notification} onMarkRead={onMarkRead} />)}</ol>}
    </section>
  );
}
