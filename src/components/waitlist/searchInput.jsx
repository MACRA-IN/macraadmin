import { Icon } from "./icons";
import { ICONS } from "./iconPaths";

const SearchInput = ({ value, onChange, placeholder = "Name, phone or area" }) => (
  <div className="relative mt-4">
    <Icon
      d={ICONS.search}
      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
    />
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 outline-none focus:border-[#2CD377] focus:ring-2 focus:ring-[#2CD377]/20"
    />
  </div>
);

export default SearchInput;
