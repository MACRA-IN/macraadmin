const Tabs = ({ value, onChange, options }) => (
  <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
    {options.map((o) => (
      <button
        key={o.id}
        onClick={() => onChange(o.id)}
        className={`min-w-0 flex-1 rounded-lg px-1.5 py-2 text-center transition-colors sm:px-2 ${
          value === o.id ? "bg-white shadow-sm" : ""
        }`}
      >
        <span
          className={`block text-base font-bold tabular-nums ${
            value === o.id ? "text-slate-900" : "text-slate-400"
          }`}
        >
          {o.count}
        </span>
        <span
          className={`block truncate text-[11px] font-semibold ${
            value === o.id ? "text-slate-600" : "text-slate-400"
          }`}
        >
          {o.label}
        </span>
      </button>
    ))}
  </div>
);

export default Tabs;
