import { useState } from 'react';
import NotificationCenter from '../components/NotificationCenter.jsx';
import NotificationDemoForm from '../components/NotificationDemoForm.jsx';
import PresencePanel from '../components/PresencePanel.jsx';
import useNotifications from '../hooks/useNotifications.js';
import usePresence from '../hooks/usePresence.js';
import useSocket from '../hooks/useSocket.js';

const EventHistory = ({ title, events, emptyMessage }) => (
  <div className="event-history">
    <h3>{title}</h3>
    {events.length === 0 ? <p className="response-placeholder">{emptyMessage}</p> : (
      <ol>{events.map((event, index) => (
        <li key={`${event.timestamp}-${index}`}>
          <strong>{event.from.displayName}</strong> <span>({event.from.userId})</span>
          <p>{event.message}</p><time dateTime={event.timestamp}>{event.timestamp}</time>
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
  const [actionError, setActionError] = useState('');
  const isConnected = status === 'Connected';
  const { notifications, unreadCount, markRead, markAllRead, clearNotifications, sendNotification } = useNotifications();
  const { users: onlineUsers, updatedAt: presenceUpdatedAt } = usePresence();

  const changeIdentity = ({ target }) => setIdentity((value) => ({ ...value, [target.name]: target.value }));
  const changePrivate = ({ target }) => setPrivateMessage((value) => ({ ...value, [target.name]: target.value }));
  const handleConnect = (event) => {
    event.preventDefault(); setActionError('');
    if (!identity.userId.trim() || !identity.displayName.trim()) {
      setActionError('User ID and display name are required.'); return;
    }
    connect(identity);
  };
  const submitBroadcast = async (event) => {
    event.preventDefault(); const result = await sendBroadcast(broadcastMessage);
    setActionError(result.ok ? '' : result.error); if (result.ok) setBroadcastMessage('');
  };
  const submitPrivate = async (event) => {
    event.preventDefault(); const result = await sendUserMessage(privateMessage.targetUserId, privateMessage.message);
    setActionError(result.ok ? '' : result.error); if (result.ok) setPrivateMessage((value) => ({ ...value, message: '' }));
  };

  return (
    <main className="page-shell">
      <section className="diagnostics-card" aria-labelledby="page-title">
        <p className="eyebrow">Codveda Level 3</p><h1 id="page-title">WebSocket Communication</h1>
        <p className="task-label">Task 2 · Room and delivery diagnostics</p>
        <div className="warning-note"><strong>Temporary identity is not authentication.</strong> Any client can spoof these values in this training step.</div>
        <div className="status-panel" role="status" aria-live="polite"><span className={`status-dot ${status.toLowerCase()}`} aria-hidden="true" /><div><p className="status-label">Connection status</p><p className="status-value">{status}</p></div></div>
        {(error || actionError) && <p className="error-message" role="alert">{error || actionError}</p>}

        <form className="diagnostic-form identity-form" onSubmit={handleConnect}>
          <label htmlFor="user-id">User ID</label><input id="user-id" name="userId" value={identity.userId} onChange={changeIdentity} disabled={isConnected} placeholder="user-a" />
          <label htmlFor="display-name">Display Name</label><input id="display-name" name="displayName" value={identity.displayName} onChange={changeIdentity} disabled={isConnected} placeholder="Ahmed" />
          <div className="button-row"><button className="primary-button" type="submit" disabled={isConnected || status === 'Connecting'}>Connect</button><button className="secondary-button" type="button" onClick={disconnect} disabled={!isConnected}>Disconnect</button></div>
        </form>

        <PresencePanel users={onlineUsers} updatedAt={presenceUpdatedAt} currentUserId={isConnected ? identity.userId.trim() : ''} />
        <section className="diagnostic-section"><h2>Ping / Pong</h2><button className="primary-button" type="button" disabled={!canSendPing} onClick={sendPing}>Send Ping</button><div className="response-panel" aria-live="polite">{pong ? <dl><div><dt>Message</dt><dd>{pong.message}</dd></div><div><dt>Timestamp</dt><dd>{pong.timestamp}</dd></div></dl> : <p className="response-placeholder">No pong received yet.</p>}</div></section>

        <section className="diagnostic-section"><h2>Global Broadcast</h2><form className="diagnostic-form" onSubmit={submitBroadcast}><label htmlFor="broadcast-message">Message</label><textarea id="broadcast-message" value={broadcastMessage} onChange={(event) => setBroadcastMessage(event.target.value)} maxLength="300" rows="3" /><button className="primary-button" type="submit" disabled={!isConnected}>Send Broadcast</button></form><EventHistory title="Received broadcasts" events={broadcastEvents} emptyMessage="No broadcasts received." /></section>

        <section className="diagnostic-section"><h2>User-Specific Message</h2><form className="diagnostic-form" onSubmit={submitPrivate}><label htmlFor="target-user">Target User ID</label><input id="target-user" name="targetUserId" value={privateMessage.targetUserId} onChange={changePrivate} placeholder="user-b" /><label htmlFor="private-message">Message</label><textarea id="private-message" name="message" value={privateMessage.message} onChange={changePrivate} maxLength="300" rows="3" /><button className="primary-button" type="submit" disabled={!isConnected}>Send Private Message</button></form><EventHistory title="Received user-specific messages" events={userMessageEvents} emptyMessage="No user-specific messages received." /></section>
        <NotificationDemoForm disabled={!isConnected} onSend={sendNotification} />
        <NotificationCenter notifications={notifications} unreadCount={unreadCount} onMarkRead={markRead} onMarkAllRead={markAllRead} onClear={clearNotifications} />
      </section>
    </main>
  );
}
