/** One place for the loading, error and empty states every list needs. */
export function Status({ loading, error, empty, emptyText, onRetry, children }) {
  if (loading) return <p className="muted">Loading…</p>;
  if (error)
    return (
      <div className="alert" role="alert">
        <p>{error}</p>
        {onRetry && <button onClick={onRetry}>Try again</button>}
      </div>
    );
  if (empty) return <p className="muted">{emptyText}</p>;
  return children;
}
