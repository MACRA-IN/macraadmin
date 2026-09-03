import { Icon } from "./icons";
import { ICONS } from "./iconPaths";
import PersonRow from "./personRow";

const BatchCard = ({ batch, index, open, onOpen, selectedIds, onToggleOne, onSelectBatch }) => {
  const pending = batch.route.filter((p) => !p.approved);
  const done = batch.route.length - pending.length;
  const allPicked = pending.length > 0 && pending.every((p) => selectedIds.has(p.id));
  const areas = [...new Set(batch.route.map((p) => p.area))].slice(0, 3).join(", ");
  const tooLong = batch.minutes > 120;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-start gap-3 p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2CD377]/10 text-[#1A9E58]">
          <Icon d={ICONS.scooter} className="h-5 w-5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="text-sm font-bold text-slate-900">Trip {index + 1}</p>
            {done > 0 && (
              <span className="rounded-full bg-[#2CD377]/15 px-2 py-0.5 text-[10px] font-bold text-[#12864A]">
                {done} of {batch.route.length} have access
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-xs text-slate-500">{areas}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <span className="font-semibold text-slate-700">{batch.route.length} stops</span>
            <span className="text-slate-400">{batch.km.toFixed(1)} km</span>
            <span className={tooLong ? "font-semibold text-amber-600" : "text-slate-400"}>
              {Math.round(batch.minutes)} min
            </span>
          </div>
          {tooLong && (
            <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-snug text-amber-700">
              <Icon d={ICONS.warn} className="mt-0.5 h-3 w-3 shrink-0" />
              Over a 2-hour window. The last bowl arrives cold.
            </p>
          )}
        </div>
      </div>

      <div className="flex items-stretch gap-2 border-t border-slate-100 px-4 py-3">
        <button
          onClick={() => onSelectBatch(batch, !allPicked)}
          disabled={pending.length === 0}
          className={`min-w-0 flex-1 truncate rounded-xl px-2 py-2.5 text-sm font-semibold transition-colors disabled:opacity-40 ${
            allPicked ? "bg-slate-100 text-slate-600" : "bg-[#2CD377] text-white active:bg-[#25B366]"
          }`}
        >
          {pending.length === 0
            ? "Whole trip has access"
            : allPicked
              ? "Clear trip"
              : `Select ${pending.length}`}
        </button>
        <button
          onClick={onOpen}
          className="flex shrink-0 items-center gap-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-600"
        >
          Stops
          <Icon
            d={ICONS.chevron}
            className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {open && (
        <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/60 p-3">
          {batch.route.map((p, i) => (
            <PersonRow
              key={p.id}
              person={p}
              rank={i + 1}
              selected={selectedIds.has(p.id)}
              onToggle={onToggleOne}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BatchCard;
