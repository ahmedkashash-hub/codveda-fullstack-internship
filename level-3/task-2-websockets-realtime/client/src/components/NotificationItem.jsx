const formatTimestamp = (value) => new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium', timeStyle: 'short',
}).format(new Date(value));

export default function NotificationItem({ notification, onMarkRead }) {
  return (
    <li className={`notification-item ${notification.read ? 'read' : 'unread'}`}>
      <div className="notification-item-heading"><span className={`notification-type type-${notification.type.toLowerCase()}`}>{notification.type}</span><time dateTime={notification.createdAt}>{formatTimestamp(notification.createdAt)}</time></div>
      <div className="notification-content"><h4>{notification.title}</h4><p>{notification.message}</p></div>
      <div className="notification-item-footer"><span className="read-state">{notification.read ? 'Read' : 'Unread'}</span>{!notification.read && <button className="text-button" type="button" onClick={() => onMarkRead(notification.id)}>Mark as read</button>}</div>
    </li>
  );
}
