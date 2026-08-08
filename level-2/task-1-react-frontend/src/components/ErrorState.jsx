function ErrorState({ message, onRetry }) {
  return (
    <section className="error-state" role="alert">
      <h2>Unable to load products</h2>
      <p>{message}</p>
      <button type="button" onClick={onRetry}>
        Try again
      </button>
    </section>
  )
}

export default ErrorState
