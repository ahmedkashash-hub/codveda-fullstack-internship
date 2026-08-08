export default function NotificationBadge({ count }) {
  return <span className="notification-badge" aria-label={`${count} unread notifications`}>{count > 99 ? '99+' : count}</span>;
}
