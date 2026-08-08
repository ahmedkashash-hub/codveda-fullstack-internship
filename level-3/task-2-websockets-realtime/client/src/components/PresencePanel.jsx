const formatTimestamp = (value) => new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium', timeStyle: 'medium',
}).format(new Date(value));

export default function PresencePanel({ users, updatedAt, currentUserId }) {
  return (
    <section className="presence-panel" aria-labelledby="presence-title">
      <div className="presence-heading"><div><p className="eyebrow">Live presence</p><h2 id="presence-title">Online users <span>{users.length}</span></h2></div>{updatedAt && <time dateTime={updatedAt}>Updated {formatTimestamp(updatedAt)}</time>}</div>
      <div className="presence-live-region" aria-live="polite">{users.length === 1 ? '1 temporary user online' : `${users.length} temporary users online`}</div>
      {users.length === 0 ? <p className="response-placeholder">Connect to view online temporary users.</p> : (
        <ul className="presence-list">{users.map((user) => (
          <li key={user.userId} className={user.userId === currentUserId ? 'current-user' : ''}><span className="online-dot" aria-hidden="true" /><div><strong>{user.displayName}</strong><span>{user.userId}</span></div>{user.userId === currentUserId && <small>Current identity</small>}</li>
        ))}</ul>
      )}
    </section>
  );
}
