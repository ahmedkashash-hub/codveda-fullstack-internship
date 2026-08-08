import { useState } from 'react';
import NotificationCenter from '../components/NotificationCenter.jsx';
import NotificationDemoForm from '../components/NotificationDemoForm.jsx';
import PresencePanel from '../components/PresencePanel.jsx';
import useNotifications from '../hooks/useNotifications.js';
import usePresence from '../hooks/usePresence.js';
import useSocket from '../hooks/useSocket.js';

const formatEventTime = (value) => new Intl.DateTimeFormat(undefined, {
  hour: '2-digit', minute: '2-digit', second: '2-digit',
}).format(new Date(value));

const EventHistory = ({ title, events, emptyTitle, emptyDescription }) => (
  <div className="event-history">
    <div className="subsection-heading">
      <h3>{title}</h3>
      <span>{events.length} / 20</span>
    </div>
    {events.length === 0 ? (
      <div className="empty-state">
        <strong>{emptyTitle}</strong>
        <p>{emptyDescription}</p>
      </div>
    ) : (
      <ol>{events.map((event, index) => (
        <li key={`${event.timestamp}-${index}`}>
          <div className="event-meta">
            <span><strong>{event.from.displayName}</strong> <small>{event.from.userId}</small></span>
            <time dateTime={event.timestamp}>{formatEventTime(event.timestamp)}</time>
          </div>
          <p>{event.message}</p>
        </li>
      ))}</ol>
    )}
  </div>
);

export default function DiagnosticsPage() {
  const {
    status, error, pong, canSendPing, broadcastEvents, userMessageEvents,
    connect, disconnect, sendPing, sendBroadcast, sendUserMessage,
  } = useSocket();
  const [identity, setIdentity] = useState({ userId: '', displayName: '' });
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [privateMessage, setPrivateMessage] = useState({ targetUserId: '', message: '' });
  const [actionFeedback, setActionFeedback] = useState(null);
  const isConnected = status === 'Connected';
  const { notifications, unreadCount, markRead, markAllRead, clearNotifications, sendNotification } = useNotifications();
  const { users: onlineUsers, updatedAt: presenceUpdatedAt } = usePresence();

  const changeIdentity = ({ target }) => setIdentity((value) => ({ ...value, [target.name]: target.value }));
  const changePrivate = ({ target }) => setPrivateMessage((value) => ({ ...value, [target.name]: target.value }));
  const showFeedback = (type, message) => setActionFeedback({ type, message });
  const handleConnect = (event) => {
    event.preventDefault();
    setActionFeedback(null);
    if (!identity.userId.trim() || !identity.displayName.trim()) {
      showFeedback('error', 'User ID and display name are required.');
      return;
    }
    connect(identity);
  };
  const handleDisconnect = () => {
    disconnect();
    showFeedback('neutral', 'Disconnected from the realtime server.');
  };
  const handlePing = () => {
    sendPing();
    showFeedback('success', 'Ping sent. Waiting for the server response.');
  };
  const submitBroadcast = async (event) => {
    event.preventDefault();
    const result = await sendBroadcast(broadcastMessage);
    showFeedback(result.ok ? 'success' : 'error', result.ok ? 'Broadcast sent.' : result.error);
    if (result.ok) setBroadcastMessage('');
  };
  const submitPrivate = async (event) => {
    event.preventDefault();
    const result = await sendUserMessage(privateMessage.targetUserId, privateMessage.message);
    showFeedback(result.ok ? 'success' : 'error', result.ok ? 'Message delivered to the temporary user room.' : result.error);
    if (result.ok) setPrivateMessage((value) => ({ ...value, message: '' }));
  };

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">C</span>
          <div><p>Codveda</p><h1 id="page-title">Realtime Diagnostics</h1></div>
        </div>
        <div className={`header-status ${status.toLowerCase()}`} role="status" aria-live="polite">
          <span className="status-dot" aria-hidden="true" />
          <span>{status}</span>
        </div>
      </header>

      <div className="security-banner" role="note">
        <span className="banner-icon" aria-hidden="true">i</span>
        <p><strong>Training environment.</strong> Temporary identity is spoofable and is not authentication or secure private messaging.</p>
      </div>

      {(error || actionFeedback) && (
        <div className={`action-feedback ${error || actionFeedback?.type === 'error' ? 'error' : actionFeedback?.type}`} role={error || actionFeedback?.type === 'error' ? 'alert' : 'status'} aria-live="polite">
          {error || actionFeedback?.message}
        </div>
      )}

      <div className="dashboard-grid" aria-labelledby="page-title">
        <section className="dashboard-panel connection-panel" aria-labelledby="connection-title">
          <div className="panel-heading">
            <div><p className="section-kicker">Connection</p><h2 id="connection-title">Socket identity</h2></div>
            <span className={`compact-status ${status.toLowerCase()}`}>{status}</span>
          </div>
          <form className="diagnostic-form identity-form" onSubmit={handleConnect}>
            <div className="field-group"><label htmlFor="user-id">User ID</label><input id="user-id" name="userId" value={identity.userId} onChange={changeIdentity} disabled={isConnected} placeholder="user-a" autoComplete="off" /></div>
            <div className="field-group"><label htmlFor="display-name">Display Name</label><input id="display-name" name="displayName" value={identity.displayName} onChange={changeIdentity} disabled={isConnected} placeholder="Ahmed" autoComplete="off" /></div>
            {isConnected && <p className="active-identity"><span aria-hidden="true">●</span> Active as <strong>{identity.displayName.trim()}</strong> <small>{identity.userId.trim()}</small></p>}
            <div className="button-row"><button className="primary-button" type="submit" disabled={isConnected || status === 'Connecting'}>Connect</button><button className="secondary-button danger-button" type="button" onClick={handleDisconnect} disabled={!isConnected}>Disconnect</button></div>
          </form>
        </section>

        <PresencePanel users={onlineUsers} updatedAt={presenceUpdatedAt} currentUserId={isConnected ? identity.userId.trim() : ''} />

        <section className="dashboard-panel ping-panel" aria-labelledby="ping-title">
          <div className="panel-heading"><div><p className="section-kicker">Diagnostic</p><h2 id="ping-title">Ping / Pong</h2></div></div>
          <p className="section-description">Confirm the current socket can reach the server.</p>
          <button className="secondary-button ping-button" type="button" disabled={!canSendPing} onClick={handlePing}>Send Ping</button>
          <div className="ping-response" aria-live="polite">
            {pong ? <><span className="success-indicator" aria-hidden="true">✓</span><div><strong>{pong.message}</strong><time dateTime={pong.timestamp}>{formatEventTime(pong.timestamp)}</time></div></> : <><span className="idle-indicator" aria-hidden="true">—</span><p>No response yet</p></>}
          </div>
        </section>

        <section className="dashboard-panel broadcast-panel" aria-labelledby="broadcast-title">
          <div className="panel-heading"><div><p className="section-kicker">All users</p><h2 id="broadcast-title">Global Broadcast</h2></div></div>
          <form className="diagnostic-form composer-form" onSubmit={submitBroadcast}>
            <div className="field-group"><label htmlFor="broadcast-message">Message</label><textarea id="broadcast-message" value={broadcastMessage} onChange={(event) => setBroadcastMessage(event.target.value)} maxLength="300" rows="2" placeholder="Send a message to every connected user" /></div>
            <button className="primary-button" type="submit" disabled={!isConnected}>Send Broadcast</button>
          </form>
          <EventHistory title="Recent broadcasts" events={broadcastEvents} emptyTitle="No broadcasts yet" emptyDescription="Messages received during this session will appear here." />
        </section>

        <section className="dashboard-panel user-message-panel" aria-labelledby="user-message-title">
          <div className="panel-heading"><div><p className="section-kicker">Targeted delivery</p><h2 id="user-message-title">User-Specific Message</h2></div></div>
          <p className="section-description">Delivered to the selected temporary user room. This is not secure private messaging.</p>
          <form className="diagnostic-form inline-composer" onSubmit={submitPrivate}>
            <div className="field-group target-field"><label htmlFor="target-user">Target User ID</label><input id="target-user" name="targetUserId" value={privateMessage.targetUserId} onChange={changePrivate} placeholder="user-b" autoComplete="off" /></div>
            <div className="field-group message-field"><label htmlFor="private-message">Message</label><textarea id="private-message" name="message" value={privateMessage.message} onChange={changePrivate} maxLength="300" rows="2" placeholder="Message for the selected user room" /></div>
            <button className="primary-button" type="submit" disabled={!isConnected}>Send Message</button>
          </form>
          <EventHistory title="Received messages" events={userMessageEvents} emptyTitle="No user-specific messages yet" emptyDescription="Messages delivered to this temporary identity will appear here." />
        </section>

        <section className="dashboard-panel notification-workspace" aria-labelledby="notification-workspace-title">
          <div className="workspace-heading"><div><p className="section-kicker">Room notifications</p><h2 id="notification-workspace-title">Notification Workspace</h2></div><p>Compose and inspect non-persistent notifications in one place.</p></div>
          <div className="notification-grid">
            <NotificationDemoForm disabled={!isConnected} onSend={sendNotification} />
            <NotificationCenter notifications={notifications} unreadCount={unreadCount} onMarkRead={markRead} onMarkAllRead={markAllRead} onClear={clearNotifications} />
          </div>
        </section>
      </div>
    </main>
  );
}
