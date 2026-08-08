import NotificationBadge from './NotificationBadge.jsx';
import NotificationItem from './NotificationItem.jsx';

export default function NotificationCenter({ notifications, unreadCount, onMarkRead, onMarkAllRead, onClear }) {
  return (
    <section className="notification-center" aria-labelledby="notification-title">
      <div className="notification-center-heading">
        <div><p className="section-kicker">Inbox</p><div className="title-with-badge"><h3 id="notification-title">Notification Center</h3><NotificationBadge count={unreadCount} /></div></div>
        <div className="notification-actions"><button className="text-button" type="button" disabled={unreadCount === 0} onClick={onMarkAllRead}>Mark all read</button><button className="text-button danger" type="button" disabled={notifications.length === 0} onClick={onClear}>Clear</button></div>
      </div>
      <div className="notification-live-region visually-hidden" aria-live="polite" aria-atomic="true">{unreadCount > 0 ? `${unreadCount} unread notifications` : 'No unread notifications'}</div>
      {notifications.length === 0 ? (
        <div className="empty-state notification-empty"><strong>No notifications yet</strong><p>Notifications sent to this temporary identity will appear here.</p></div>
      ) : <ol className="notification-list">{notifications.map((notification) => <NotificationItem key={notification.id} notification={notification} onMarkRead={onMarkRead} />)}</ol>}
    </section>
  );
}
