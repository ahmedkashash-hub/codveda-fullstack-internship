export default function TaskLoadingState() {
  return (
    <div className="task-state" role="status">
      <span className="spinner" aria-hidden="true" />
      <p>Loading your tasks…</p>
    </div>
  );
}
