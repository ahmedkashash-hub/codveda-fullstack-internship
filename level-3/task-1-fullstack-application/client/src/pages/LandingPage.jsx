import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <section className="hero">
      <p className="eyebrow">Codveda Level 3 — Task 1</p>
      <h1>Task Management Application</h1>
      <p className="lead">
        A secure full-stack workspace foundation for organizing focused work.
      </p>
      <div className="actions">
        <Link className="button button-primary" to="/login">Sign in</Link>
        <Link className="button button-secondary" to="/register">Create account</Link>
      </div>
    </section>
  );
}
