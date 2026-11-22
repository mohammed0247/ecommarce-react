export function Loading({
  label = "Loading your FreshCart...",
}: {
  label?: string;
}) {
  return (
    <div className="loading-state">
      <span className="spinner" />
      <p>{label}</p>
    </div>
  );
}
