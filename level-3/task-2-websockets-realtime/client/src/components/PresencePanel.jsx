const formatTimestamp = (value) => new Intl.DateTimeFormat(undefined, {
  hour: '2-digit', minute: '2-digit', second: '2-digit',
}).format(new Date(value));

export default function PresencePanel({ users, updatedAt, currentUserId }) {
  return (
    <section className="dashboard-panel presence-panel" aria-labelledby="presence-title">
      <div className="presence-heading">
        <div><p className="section-kicker">Live presence</p><h2 id="presence-title">Online users</h2></div>
        <span className="presence-count"><strong>{users.length}</strong> online</span>
      </div>
      <div className="presence-live-region visually-hidden" aria-live="polite">{users.length === 1 ? '1 temporary user online' : `${users.length} temporary users online`}</div>
      {users.length === 0 ? (
        <div className="empty-state presence-empty"><strong>No users online</strong><p>Connect to view temporary identities in this session.</p></div>
      ) : (
        <ul className="presence-list">{users.map((user) => (
          <li key={user.userId} className={user.userId === currentUserId ? 'current-user' : ''}>
            <span className="online-dot" aria-hidden="true" />
            <div><strong>{user.displayName}</strong><span>{user.userId}</span></div>
            <span className="online-label">Online</span>
            {user.userId === currentUserId && <small>Current identity</small>}
          </li>
        ))}</ul>
      )}
      {updatedAt && <time className="presence-updated" dateTime={updatedAt}>Updated {formatTimestamp(updatedAt)}</time>}
    </section>
  );
}
