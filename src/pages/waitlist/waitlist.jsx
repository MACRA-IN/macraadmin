import { useEffect, useMemo, useRef, useState } from "react";
import { approveWaitlistBatch, getWaitlistAreas } from "../../services/waitlistServices";
import { buildBatches, extractAreas, flatten } from "../../utils/waitlistUtils";
import { Icon } from "../../components/waitlist/icons";
import { ICONS } from "../../components/waitlist/iconPaths";
import Tabs from "../../components/waitlist/tabs";
import PersonRow from "../../components/waitlist/personRow";
import BatchCard from "../../components/waitlist/batchCard";
import ConfirmDialog from "../../components/waitlist/confirmDialog";
import SearchInput from "../../components/waitlist/searchInput";
import ActionBar from "../../components/waitlist/actionBar";
import Toast from "../../components/waitlist/toast";

const AUTO_REFRESH_MS = 30000;

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

  const visibleWaiting = waiting.filter(match);
  const visibleAccess = hasAccess.filter(match);

  return (
    <div className="pb-44">
      <div className="flex items-center justify-between gap-3">
        <h1 className="min-w-0 truncate text-xl font-bold tracking-tight text-slate-900">
          Waitlist
        </h1>
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
                <Icon d={ICONS.warn} className="h-4 w-4 shrink-0" />
                {unlocated.length} without a map pin
              </p>
              <p className="mt-1 text-xs leading-relaxed text-amber-800">
                No coordinates saved, so they cannot go on a trip. Call for an address first.
              </p>
              <div className="mt-3 flex flex-col gap-2">
                {unlocated.map((p) => (
                  <PersonRow
                    key={p.id}
                    person={p}
                    selected={selected.has(p.id)}
                    onToggle={toggleOne}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {view === "waiting" && (
        <div>
          <SearchInput value={query} onChange={setQuery} />
          <p className="mt-3 text-xs text-slate-400">Nearest to the kitchen first</p>
          <div className="mt-2 flex flex-col gap-2">
            {visibleWaiting.map((p) => (
              <PersonRow key={p.id} person={p} selected={selected.has(p.id)} onToggle={toggleOne} />
            ))}
            {visibleWaiting.length === 0 && (
              <p className="py-10 text-center text-sm text-slate-500">Nobody matches that search.</p>
            )}
          </div>
        </div>
      )}

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
              <SearchInput value={query} onChange={setQuery} />
              <p className="mt-3 text-xs text-slate-400">
                These {hasAccess.length} can order from outside your radius
              </p>
              <div className="mt-2 flex flex-col gap-2">
                {visibleAccess.map((p) => (
                  <PersonRow key={p.id} person={p} selected={false} onToggle={() => {}} />
                ))}
                {visibleAccess.length === 0 && (
                  <p className="py-10 text-center text-sm text-slate-500">
                    Nobody matches that search.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {selected.size > 0 && (
        <ActionBar
          count={selected.size}
          onClear={() => setSelected(new Set())}
          onConfirm={() => setConfirming(true)}
        />
      )}

      {confirming && (
        <ConfirmDialog
          people={chosen}
          busy={saving}
          onCancel={() => !saving && setConfirming(false)}
          onConfirm={grant}
        />
      )}

      {toast && <Toast message={toast} />}
    </div>
  );
};

export default Waitlist;
