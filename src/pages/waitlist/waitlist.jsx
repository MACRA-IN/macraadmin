import { useEffect, useMemo, useRef, useState } from "react";
import { approveWaitlistBatch, getWaitlistAreas } from "../../services/waitlistServices";

/* ------------------------------------------------------------------ */
/*  Config                                                             */
/* ------------------------------------------------------------------ */
const KITCHEN = { lat: 17.4875, lng: 78.3575 };
const BATCH_SIZE = 10;        // bowls a rider carries in one trip
const ROAD_FACTOR = 1.35;     // straight line -> real road distance
const AVG_SPEED_KMH = 19;     // two-wheeler, Hyderabad traffic
const HANDOVER_MIN = 2.5;     // minutes per drop
const AUTO_REFRESH_MS = 30000;

/* The action bar floats above your app's sticky bottom nav on mobile.
   If your nav is taller or shorter, change the 72px here. */
const ACTION_BAR_POSITION = "bottom-[72px] sm:bottom-4";

/* ------------------------------------------------------------------ */
/*  Geo                                                                */
/* ------------------------------------------------------------------ */
const toRad = (d) => (d * Math.PI) / 180;

const distanceKm = (a, b) => {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
};

const orderRoute = (people) => {
  const remaining = [...people];
  const route = [];
  let cursor = KITCHEN;
  while (remaining.length) {
    let best = 0;
    for (let i = 1; i < remaining.length; i++) {
      if (distanceKm(cursor, remaining[i].pos) < distanceKm(cursor, remaining[best].pos)) best = i;
    }
    const next = remaining.splice(best, 1)[0];
    route.push(next);
    cursor = next.pos;
  }
  return route;
};

const routeStats = (route) => {
  if (!route.length) return { km: 0, minutes: 0 };
  let straight = distanceKm(KITCHEN, route[0].pos);
  for (let i = 0; i < route.length - 1; i++) straight += distanceKm(route[i].pos, route[i + 1].pos);
  straight += distanceKm(route[route.length - 1].pos, KITCHEN);
  const km = straight * ROAD_FACTOR;
  return { km, minutes: (km / AVG_SPEED_KMH) * 60 + route.length * HANDOVER_MIN };
};

const buildBatches = (people) => {
  const pool = [...people];
  const batches = [];

  while (pool.length) {
    let seed = 0;
    for (let i = 1; i < pool.length; i++) {
      if (pool[i].kitchenKm < pool[seed].kitchenKm) seed = i;
    }
    const batch = [pool.splice(seed, 1)[0]];

    while (batch.length < BATCH_SIZE && pool.length) {
      const centre = {
        lat: batch.reduce((s, p) => s + p.pos.lat, 0) / batch.length,
        lng: batch.reduce((s, p) => s + p.pos.lng, 0) / batch.length,
      };
      let near = 0;
      for (let i = 1; i < pool.length; i++) {
        if (distanceKm(centre, pool[i].pos) < distanceKm(centre, pool[near].pos)) near = i;
      }
      batch.push(pool.splice(near, 1)[0]);
    }

    const route = orderRoute(batch);
    batches.push({ id: route[0].id, route, ...routeStats(route) });
  }

  return batches.sort((a, b) => a.km - b.km);
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */
const extractAreas = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const flatten = (areas) => {
  const seen = new Set();
  const people = [];

  areas.forEach((area) => {
    (area.people || []).forEach((p) => {
      if (p.id == null || seen.has(p.id)) return;
      seen.add(p.id);

      // Number(null) is 0, which would put a pin in the Atlantic. Guard it.
      const lat = p.latitude == null ? NaN : Number(p.latitude);
      const lng = p.longitude == null ? NaN : Number(p.longitude);
      const located = Number.isFinite(lat) && Number.isFinite(lng);
      const pos = located ? { lat, lng } : null;

      people.push({
        id: p.id,
        name: (p.name || "").trim() || `Person #${p.id}`,
        phone: p.phone || "",
        area: area.area_name || "Unknown area",
        approved: Boolean(p.is_approved),
        joined: p.created_at || null,
        located,
        pos,
        kitchenKm: located ? distanceKm(KITCHEN, pos) : Infinity,
      });
    });
  });

  return people.sort((a, b) => a.kitchenKm - b.kitchenKm);
};

const fmtDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

/* ------------------------------------------------------------------ */
/*  Icons                                                              */
/* ------------------------------------------------------------------ */
const Icon = ({ d, className = "h-4 w-4", w = 1.75 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={w}
       strokeLinecap="round" strokeLinejoin="round" className={className}>
    {d.map((path, i) => <path key={i} d={path} />)}
  </svg>
);

const ICONS = {
  refresh: ["M4 4v5h.582m15.836 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"],
  search: ["M21 21l-4.35-4.35", "M11 18a7 7 0 100-14 7 7 0 000 14z"],
  close: ["M6 18L18 6M6 6l12 12"],
  check: ["M4.5 12.5l5 5 10-11"],
  chevron: ["M6 9l6 6 6-6"],
  scooter: ["M5 18a2 2 0 100-4 2 2 0 000 4z", "M19 18a2 2 0 100-4 2 2 0 000 4z", "M7 16h8l3-8h2", "M13 8H9"],
  warn: ["M12 9v4", "M12 17h.01", "M10.3 3.9L2.4 17a2 2 0 001.7 3h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"],
  phone: ["M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.4 1.8.7 2.7a2 2 0 01-.5 2.1L8.1 9.7a16 16 0 006 6l1.2-1.2a2 2 0 012.1-.5c.9.3 1.8.6 2.7.7a2 2 0 011.7 2z"],
};

/* ------------------------------------------------------------------ */
/*  Pieces                                                             */
/* ------------------------------------------------------------------ */
const Tabs = ({ value, onChange, options }) => (
  <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
    {options.map((o) => (
      <button
        key={o.id}
        onClick={() => onChange(o.id)}
        className={`flex-1 rounded-lg px-2 py-2 text-center transition-colors ${
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
          className={`block text-[11px] font-semibold ${
            value === o.id ? "text-slate-600" : "text-slate-400"
          }`}
        >
          {o.label}
        </span>
      </button>
    ))}
  </div>
);

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
      className={`flex items-center gap-3 rounded-xl border px-3 py-3 ${
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
        className="flex min-w-0 flex-1 items-center gap-3 text-left disabled:cursor-default"
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
          <span className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-slate-800">{person.name}</span>
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
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-bold text-slate-900">Trip {index + 1}</p>
            {done > 0 && (
              <span className="rounded-full bg-[#2CD377]/15 px-2 py-0.5 text-[10px] font-bold text-[#12864A]">
                {done} of {batch.route.length} have access
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-xs text-slate-500">{areas}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 text-xs">
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

      <div className="flex gap-2 border-t border-slate-100 px-4 py-3">
        <button
          onClick={() => onSelectBatch(batch, !allPicked)}
          disabled={pending.length === 0}
          className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors disabled:opacity-40 ${
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
          className="flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-600"
        >
          Stops
          <Icon d={ICONS.chevron} className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
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
            <div className="flex-1 rounded-xl bg-slate-50 p-3">
              <dt className="text-xs text-slate-500">Furthest</dt>
              <dd className="mt-0.5 text-lg font-bold tabular-nums text-slate-900">
                {furthest != null ? `${furthest.toFixed(1)} km` : "—"}
              </dd>
            </div>
            <div className="flex-1 rounded-xl bg-slate-50 p-3">
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
                <span className="truncate text-slate-700">{p.name}</span>
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
            className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="flex-1 rounded-xl bg-[#2CD377] py-3 text-sm font-bold text-white active:bg-[#25B366] disabled:opacity-50"
          >
            {busy ? "Granting…" : "Give access"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
const Waitlist = () => {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [view, setView] = useState("trips");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [openBatch, setOpenBatch] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const loadedOnce = useRef(false);

  const load = async () => {
    if (loadedOnce.current) setRefreshing(true);
    try {
      const data = await getWaitlistAreas();
      setPeople(flatten(extractAreas(data)));
      setError("");
    } catch (err) {
      setError(err.message || "Could not load the waitlist");
    } finally {
      setLoading(false);
      setRefreshing(false);
      loadedOnce.current = true;
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, AUTO_REFRESH_MS);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const waiting = useMemo(() => people.filter((p) => !p.approved), [people]);
  const hasAccess = useMemo(() => people.filter((p) => p.approved), [people]);

  const batches = useMemo(() => buildBatches(waiting.filter((p) => p.located)), [waiting]);
  const unlocated = useMemo(() => waiting.filter((p) => !p.located), [waiting]);

  const match = (p) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.area.toLowerCase().includes(q)
    );
  };

  const toggleOne = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const selectBatch = (batch, on) =>
    setSelected((prev) => {
      const next = new Set(prev);
      batch.route.forEach((p) => {
        if (p.approved) return;
        on ? next.add(p.id) : next.delete(p.id);
      });
      return next;
    });

  const chosen = people.filter((p) => selected.has(p.id));

  const grant = async () => {
    setSaving(true);
    try {
      const ids = [...selected];
      await approveWaitlistBatch(ids);
      setPeople((prev) => prev.map((p) => (selected.has(p.id) ? { ...p, approved: true } : p)));
      setSelected(new Set());
      setConfirming(false);
      setToast(`${ids.length} ${ids.length === 1 ? "person" : "people"} can now order`);
    } catch (err) {
      setToast(err.message || "Could not grant access. Try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-100" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 px-6 py-12 text-center">
        <p className="text-sm font-semibold text-red-600">{error}</p>
        <button
          onClick={load}
          className="mt-3 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  const searchBox = (
    <div className="relative mt-4">
      <Icon
        d={ICONS.search}
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
      />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Name, phone or area"
        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 outline-none focus:border-[#2CD377] focus:ring-2 focus:ring-[#2CD377]/20"
      />
    </div>
  );

  return (
    <div className="pb-44">
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Waitlist</h1>
        <button
          onClick={load}
          disabled={refreshing}
          className="shrink-0 rounded-xl border border-slate-200 p-2.5 text-slate-500 disabled:opacity-50"
          aria-label="Refresh"
        >
          <Icon d={ICONS.refresh} className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="mt-4">
        <Tabs
          value={view}
          onChange={setView}
          options={[
            { id: "trips", label: "Rider trips", count: batches.length },
            { id: "waiting", label: "Waiting", count: waiting.length },
            { id: "access", label: "Has access", count: hasAccess.length },
          ]}
        />
      </div>

      {/* Rider trips */}
      {view === "trips" && (
        <div className="mt-4 flex flex-col gap-3">
          {batches.length === 0 && unlocated.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center">
              <p className="text-sm font-semibold text-slate-700">Nobody is waiting</p>
              <p className="mt-1 text-sm text-slate-500">New signups will show up here.</p>
            </div>
          )}

          {batches.map((batch, i) => (
            <BatchCard
              key={batch.id}
              batch={batch}
              index={i}
              open={openBatch === batch.id}
              onOpen={() => setOpenBatch(openBatch === batch.id ? null : batch.id)}
              selectedIds={selected}
              onToggleOne={toggleOne}
              onSelectBatch={selectBatch}
            />
          ))}

          {unlocated.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-amber-900">
                <Icon d={ICONS.warn} className="h-4 w-4" />
                {unlocated.length} without a map pin
              </p>
              <p className="mt-1 text-xs leading-relaxed text-amber-800">
                No coordinates saved, so they cannot go on a trip. Call for an address first.
              </p>
              <div className="mt-3 flex flex-col gap-2">
                {unlocated.map((p) => (
                  <PersonRow key={p.id} person={p} selected={selected.has(p.id)} onToggle={toggleOne} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Waiting */}
      {view === "waiting" && (
        <div>
          {searchBox}
          <p className="mt-3 text-xs text-slate-400">Nearest to the kitchen first</p>
          <div className="mt-2 flex flex-col gap-2">
            {waiting.filter(match).map((p) => (
              <PersonRow key={p.id} person={p} selected={selected.has(p.id)} onToggle={toggleOne} />
            ))}
            {waiting.filter(match).length === 0 && (
              <p className="py-10 text-center text-sm text-slate-500">Nobody matches that search.</p>
            )}
          </div>
        </div>
      )}

      {/* Has access */}
      {view === "access" && (
        <div>
          {hasAccess.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center">
              <p className="text-sm font-semibold text-slate-700">Nobody has access yet</p>
              <p className="mt-1 text-sm text-slate-500">
                Open Rider trips, pick a trip, then give access.
              </p>
            </div>
          ) : (
            <>
              {searchBox}
              <p className="mt-3 text-xs text-slate-400">
                These {hasAccess.length} can order from outside your radius
              </p>
              <div className="mt-2 flex flex-col gap-2">
                {hasAccess.filter(match).map((p) => (
                  <PersonRow key={p.id} person={p} selected={false} onToggle={() => {}} />
                ))}
                {hasAccess.filter(match).length === 0 && (
                  <p className="py-10 text-center text-sm text-slate-500">Nobody matches that search.</p>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Action bar — floats above the app's sticky nav */}
      {selected.size > 0 && (
        <div className={`fixed inset-x-0 z-[90] px-3 ${ACTION_BAR_POSITION}`}>
          <div className="mx-auto flex max-w-2xl items-center gap-2 rounded-2xl bg-slate-900 p-2 shadow-xl">
            <button
              onClick={() => setSelected(new Set())}
              className="rounded-xl p-3 text-slate-300"
              aria-label="Clear selection"
            >
              <Icon d={ICONS.close} className="h-4 w-4" w={2} />
            </button>
            <button
              onClick={() => setConfirming(true)}
              className="flex-1 rounded-xl bg-[#2CD377] py-3 text-sm font-bold text-white active:bg-[#25B366]"
            >
              Give access to {selected.size}
            </button>
          </div>
        </div>
      )}

      {confirming && (
        <ConfirmDialog
          people={chosen}
          busy={saving}
          onCancel={() => !saving && setConfirming(false)}
          onConfirm={grant}
        />
      )}

      {toast && (
        <div className="fixed inset-x-0 bottom-36 z-[95] flex justify-center px-4">
          <p className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg">
            {toast}
          </p>
        </div>
      )}
    </div>
  );
};

export default Waitlist;