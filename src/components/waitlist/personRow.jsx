import { Icon } from "./icons";
import { ICONS } from "./iconPaths";
import { fmtDate } from "../../utils/waitlistUtils";

const Tick = ({ on }) => (
  <span
    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
      on ? "border-[#2CD377] bg-[#2CD377] text-white" : "border-slate-300 bg-white text-transparent"
    }`}
  >
    <Icon d={ICONS.check} className="h-3 w-3" w={3} />
  </span>
);

const StatusPill = ({ approved }) => (
  <span
    className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
      approved ? "bg-[#2CD377]/15 text-[#12864A]" : "bg-slate-100 text-slate-500"
    }`}
  >
    {approved && <Icon d={ICONS.check} className="h-2.5 w-2.5" w={4} />}
    {approved ? "Has access" : "Waiting"}
  </span>
);

const PersonRow = ({ person, selected, onToggle, rank }) => {
  const locked = person.approved;

  return (
    <div
      className={`flex items-center gap-2.5 rounded-xl border px-3 py-3 sm:gap-3 ${
        locked
          ? "border-[#2CD377]/30 bg-[#2CD377]/[0.05]"
          : selected
            ? "border-[#2CD377] bg-[#2CD377]/[0.08]"
            : "border-slate-200 bg-white"
      }`}
    >
      <button
        onClick={() => !locked && onToggle(person.id)}
        disabled={locked}
        className="flex min-w-0 flex-1 items-center gap-2.5 text-left disabled:cursor-default sm:gap-3"
      >
        {locked ? (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#2CD377] text-white">
            <Icon d={ICONS.check} className="h-3 w-3" w={3} />
          </span>
        ) : (
          <Tick on={selected} />
        )}

        {rank != null && (
          <span className="w-4 shrink-0 text-center text-xs font-bold tabular-nums text-slate-400">
            {rank}
          </span>
        )}

        <span className="min-w-0 flex-1">
          <span className="flex min-w-0 items-center gap-2">
            <span className="min-w-0 truncate text-sm font-semibold text-slate-800">
              {person.name}
            </span>
            <StatusPill approved={locked} />
          </span>
          <span className="mt-0.5 block truncate text-xs text-slate-500">
            {person.area}
            {person.located ? ` · ${person.kitchenKm.toFixed(1)} km` : " · no pin"}
            {person.joined && ` · joined ${fmtDate(person.joined)}`}
          </span>
        </span>
      </button>

      {person.phone && (
        <a
          href={`tel:${person.phone}`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500"
          aria-label={`Call ${person.name}`}
        >
          <Icon d={ICONS.phone} className="h-4 w-4" />
        </a>
      )}
    </div>
  );
};

export default PersonRow;
