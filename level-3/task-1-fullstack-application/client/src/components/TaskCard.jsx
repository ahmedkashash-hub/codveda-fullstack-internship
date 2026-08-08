const formatDate = (value) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

export default function TaskCard({ task, onEdit, onDelete, isDeleting }) {
  return (
    <article className="task-card">
      <div className="task-card-heading">
        <div>
          <span className={`task-badge status-${task.status.toLowerCase()}`}>
            {task.status.replace('_', ' ')}
          </span>
          <span className={`task-badge priority-${task.priority.toLowerCase()}`}>
            {task.priority}
          </span>
        </div>
        <div className="task-actions">
          <button className="text-button" type="button" onClick={() => onEdit(task)}>Edit</button>
          <button className="text-button danger" type="button" disabled={isDeleting} onClick={() => onDelete(task)}>
            {isDeleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
      <h2>{task.title}</h2>
      <p className={task.description ? 'task-description' : 'task-description muted'}>
        {task.description || 'No description provided.'}
      </p>
      <dl className="task-dates">
        <div><dt>Due</dt><dd>{task.dueDate ? formatDate(task.dueDate) : 'No due date'}</dd></div>
        <div><dt>Created</dt><dd>{formatDate(task.createdAt)}</dd></div>
      </dl>
    </article>
  );
}
