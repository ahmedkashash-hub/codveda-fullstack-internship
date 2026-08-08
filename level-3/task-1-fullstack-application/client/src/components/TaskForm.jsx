import { useState } from 'react';
import getApiErrorMessage from '../utils/getApiErrorMessage.js';

const toLocalDateTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return offsetDate.toISOString().slice(0, 16);
};

export default function TaskForm({ task, onSubmit, onCancel }) {
  const isEditing = Boolean(task);
  const [form, setForm] = useState({
    title: task?.title ?? '',
    description: task?.description ?? '',
    status: task?.status ?? 'TODO',
    priority: task?.priority ?? 'MEDIUM',
    dueDate: toLocalDateTime(task?.dueDate),
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = ({ target }) => {
    setForm((current) => ({ ...current, [target.name]: target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const title = form.title.trim();
    if (title.length < 2) {
      setError('Title must contain at least 2 characters.');
      return;
    }

    const payload = {
      title,
      description: form.description.trim(),
      status: form.status,
      priority: form.priority,
    };
    if (form.dueDate) payload.dueDate = new Date(form.dueDate).toISOString();
    else if (isEditing) payload.dueDate = null;

    setError('');
    setIsSubmitting(true);
    try {
      await onSubmit(payload);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="task-form-panel" aria-labelledby="task-form-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{isEditing ? 'Update task' : 'New task'}</p>
          <h2 id="task-form-title">{isEditing ? 'Edit task' : 'Create task'}</h2>
        </div>
        <button className="text-button" type="button" onClick={onCancel}>Close</button>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <form className="task-form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="task-title">Title</label>
        <input id="task-title" name="title" value={form.title} onChange={handleChange} required maxLength="200" />
        <label htmlFor="task-description">Description</label>
        <textarea id="task-description" name="description" value={form.description} onChange={handleChange} maxLength="2000" rows="4" />
        <div className="form-row">
          <div><label htmlFor="task-status">Status</label><select id="task-status" name="status" value={form.status} onChange={handleChange}><option value="TODO">To do</option><option value="IN_PROGRESS">In progress</option><option value="DONE">Done</option></select></div>
          <div><label htmlFor="task-priority">Priority</label><select id="task-priority" name="priority" value={form.priority} onChange={handleChange}><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></select></div>
        </div>
        <label htmlFor="task-due-date">Due date</label>
        <input id="task-due-date" name="dueDate" type="datetime-local" value={form.dueDate} onChange={handleChange} />
        <div className="actions"><button className="button button-primary" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : isEditing ? 'Save changes' : 'Create task'}</button><button className="button button-secondary" type="button" onClick={onCancel}>Cancel</button></div>
      </form>
    </section>
  );
}
