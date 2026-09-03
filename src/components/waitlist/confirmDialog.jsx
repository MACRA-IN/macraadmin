const ConfirmDialog = ({ people, busy, onCancel, onConfirm }) => {
  const located = people.filter((p) => p.located);
  const furthest = located.length ? Math.max(...located.map((p) => p.kitchenKm)) : null;
  const noPin = people.length - located.length;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4"
      onClick={onCancel}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-1 overflow-y-auto p-5">
          <p className="text-lg font-bold text-slate-900">
            Give access to {people.length} {people.length === 1 ? "person" : "people"}?
          </p>
          <p className="mt-1 text-sm text-slate-500">
            They can order straight away, even though they sit outside your delivery radius.
          </p>

          <dl className="mt-4 flex gap-3">
            <div className="min-w-0 flex-1 rounded-xl bg-slate-50 p-3">
              <dt className="text-xs text-slate-500">Furthest</dt>
              <dd className="mt-0.5 text-lg font-bold tabular-nums text-slate-900">
                {furthest != null ? `${furthest.toFixed(1)} km` : "—"}
              </dd>
            </div>
            <div className="min-w-0 flex-1 rounded-xl bg-slate-50 p-3">
              <dt className="text-xs text-slate-500">Missing a pin</dt>
              <dd className="mt-0.5 text-lg font-bold tabular-nums text-slate-900">{noPin}</dd>
            </div>
          </dl>

          {noPin > 0 && (
            <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-800">
              {noPin} of them have no map pin. Call before your rider leaves, or he will be standing
              at a road junction with a bowl and no door.
            </p>
          )}

          <ul className="mt-4 flex flex-col gap-1.5">
            {people.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="min-w-0 flex-1 truncate text-slate-700">{p.name}</span>
                <span className="shrink-0 text-xs tabular-nums text-slate-400">
                  {p.located ? `${p.kitchenKm.toFixed(1)} km` : "no pin"}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex shrink-0 gap-2 border-t border-slate-100 bg-white p-4">
          <button
            onClick={onCancel}
            disabled={busy}
            className="min-w-0 flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="min-w-0 flex-1 rounded-xl bg-[#2CD377] py-3 text-sm font-bold text-white active:bg-[#25B366] disabled:opacity-50"
          >
            {busy ? "Granting…" : "Give access"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
