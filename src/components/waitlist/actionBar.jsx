import { Icon } from "./icons";
import { ICONS } from "./iconPaths";

/* Floats above the app's sticky bottom nav on mobile (h-16 = 64px + a little air). */
const POSITION = "bottom-[72px] sm:bottom-4";

const ActionBar = ({ count, onClear, onConfirm }) => (
  <div className={`fixed inset-x-0 z-[90] px-3 ${POSITION}`}>
    <div className="mx-auto flex max-w-2xl items-center gap-2 rounded-2xl bg-slate-900 p-2 shadow-xl">
      <button
        onClick={onClear}
        className="shrink-0 rounded-xl p-3 text-slate-300"
        aria-label="Clear selection"
      >
        <Icon d={ICONS.close} className="h-4 w-4" w={2} />
      </button>
      <button
        onClick={onConfirm}
        className="min-w-0 flex-1 truncate rounded-xl bg-[#2CD377] px-2 py-3 text-sm font-bold text-white active:bg-[#25B366]"
      >
        Give access to {count}
      </button>
    </div>
  </div>
);

export default ActionBar;
