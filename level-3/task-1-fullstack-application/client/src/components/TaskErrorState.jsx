export default function TaskErrorState({ message, onRetry }) {
  return (
    <div className="task-state error-state" role="alert">
      <h2>Tasks could not be loaded</h2>
      <p>{message}</p>
      <button className="button button-secondary" type="button" onClick={onRetry}>Retry</button>
    </div>
  );
}
