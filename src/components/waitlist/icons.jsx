export const Icon = ({ d, className = "h-4 w-4", w = 1.75 }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={w}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {d.map((path, i) => (
      <path key={i} d={path} />
    ))}
  </svg>
);
