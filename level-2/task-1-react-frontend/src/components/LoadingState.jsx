function LoadingState() {
  return (
    <div className="loading-grid" role="status">
      <span className="visually-hidden">Loading products...</span>
      {Array.from({ length: 6 }, (_, index) => (
        <div className="loading-card" key={index} aria-hidden="true">
          <div className="loading-card__image" />
          <div className="loading-card__line loading-card__line--short" />
          <div className="loading-card__line" />
          <div className="loading-card__line" />
        </div>
      ))}
    </div>
  )
}

export default LoadingState
