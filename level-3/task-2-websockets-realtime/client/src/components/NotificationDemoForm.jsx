import { useState } from 'react';

export default function NotificationDemoForm({ disabled, onSend }) {
  const [form, setForm] = useState({ targetUserId: '', type: 'INFO', title: '', message: '' });
  const [feedback, setFeedback] = useState('');
  const [isSending, setIsSending] = useState(false);
  const handleChange = ({ target }) => setForm((value) => ({ ...value, [target.name]: target.value }));
  const handleSubmit = async (event) => {
    event.preventDefault(); setIsSending(true);
    const result = await onSend(form);
    setFeedback(result.ok ? `Notification accepted: ${result.notificationId}` : result.error);
    if (result.ok) setForm((value) => ({ ...value, title: '', message: '' }));
    setIsSending(false);
  };

  return (
    <section className="diagnostic-section" aria-labelledby="notification-demo-title">
      <h2 id="notification-demo-title">Send Notification Demo</h2><p className="section-note">Requests immediate, non-persistent delivery to a temporary user room.</p>
      <form className="diagnostic-form" onSubmit={handleSubmit}>
        <label htmlFor="notification-target">Target User ID</label><input id="notification-target" name="targetUserId" value={form.targetUserId} onChange={handleChange} placeholder="user-b" />
        <label htmlFor="notification-type">Type</label><select id="notification-type" name="type" value={form.type} onChange={handleChange}><option value="INFO">Info</option><option value="SUCCESS">Success</option><option value="WARNING">Warning</option><option value="ERROR">Error</option></select>
        <label htmlFor="notification-title-input">Title</label><input id="notification-title-input" name="title" value={form.title} onChange={handleChange} maxLength="100" />
        <label htmlFor="notification-message">Message</label><textarea id="notification-message" name="message" value={form.message} onChange={handleChange} maxLength="500" rows="4" />
        <button className="primary-button" type="submit" disabled={disabled || isSending}>{isSending ? 'Sending…' : 'Send Notification'}</button>
      </form>
      {feedback && <p className="ack-feedback" role="status">{feedback}</p>}
    </section>
  );
}
