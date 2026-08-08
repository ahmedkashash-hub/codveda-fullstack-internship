const formatTimestamp = (value) => new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium', timeStyle: 'short',
}).format(new Date(value));

export default function NotificationItem({ notification, onMarkRead }) {
  return (
    <li className={`notification-item ${notification.read ? 'read' : 'unread'}`}>
      <div className="notification-item-heading"><span className={`notification-type type-${notification.type.toLowerCase()}`}>{notification.type}</span><time dateTime={notification.createdAt}>{formatTimestamp(notification.createdAt)}</time></div>
      <h3>{notification.title}</h3><p>{notification.message}</p>
      {!notification.read && <button className="text-button" type="button" onClick={() => onMarkRead(notification.id)}>Mark as read</button>}
    </li>
  );
}
