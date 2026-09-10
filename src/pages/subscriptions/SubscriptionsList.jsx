import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getSubscriptions } from "../../services/subscriptionServices";

const FILTERS = [
  { label: "All", value: "" },
  { label: "Active", value: "active" },
  { label: "Paused", value: "paused" },
  { label: "Expired", value: "expired" },
];

const statusStyle = (status) => {
  if (status === "active") return "bg-[#2CD377]/10 text-[#2CD377]";
  if (status === "paused") return "bg-yellow-50 text-yellow-600";
  if (status === "expired") return "bg-red-50 text-red-500";
  return "bg-gray-100 text-gray-500";
};

/** "2026-09-09" is parsed as a local calendar day, not UTC midnight, so the
 *  date never renders one day early. */
const parseDate = (iso) => {
  if (!iso) return null;
  const parts = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (parts) {
    return new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]));
  }
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
};

const fmtDate = (iso) => {
  const d = parseDate(iso);
  return d
    ? d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
    : iso || "—";
};

/** plan_price arrives as a string like "796.00". */
const fmtPrice = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? `₹${n.toLocaleString("en-IN")}` : `₹${value}`;
};

const SubscriptionCard = ({ subscription: s, onOpen }) => {
  // total_meals counts bowls (days x slots); total_delivery_days counts days and
  // would read 200% for a lunch+dinner customer.
  const total = Number(s.total_meals ?? s.total_delivery_days) || 0;
  const planned = Number(s.planned_meals) || 0;
  const percent = total > 0 ? Math.round((planned / total) * 100) : 0;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full flex-col gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-4 text-left shadow-sm transition-all duration-150 hover:border-gray-200 hover:shadow-md cursor-pointer"
    >
      {/* Customer */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2CD377]/10">
            <span className="text-sm font-bold text-[#2CD377]">
              {s.customer_name?.charAt(0).toUpperCase()}
            </span>
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-800">
              {s.customer_name}
            </p>
            <p className="truncate text-xs text-gray-400">{s.phone}</p>
          </div>
        </div>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyle(
            s.status,
          )}`}
        >
          {s.status}
        </span>
      </div>

      {/* Plan */}
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-700">{s.plan}</p>
          <p className="truncate text-xs text-gray-400">{s.category}</p>
        </div>

        <p className="shrink-0 text-sm font-bold text-gray-800">
          {fmtPrice(s.plan_price)}
        </p>
      </div>

      {/* Dates */}
      <p className="truncate text-xs text-gray-400">
        {fmtDate(s.start_date)} — {fmtDate(s.end_date)}
      </p>

      {/* Progress */}
      <div>
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="text-gray-400">
            <span className="font-semibold text-gray-600">{planned}</span> /{" "}
            {total} planned
          </span>
          <span className="shrink-0 font-semibold text-[#2CD377]">
            {percent}%
          </span>
        </div>

        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-[#2CD377] transition-all duration-300"
            style={{ width: `${Math.min(percent, 100)}%` }}
          />
        </div>
      </div>
    </button>
  );
};

const SubscriptionsList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const status = searchParams.get("status") || "";

  const [subscriptions, setSubscriptions] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const data = await getSubscriptions(status);
        if (cancelled) return;
        setSubscriptions(data?.subscriptions || []);
        setCount(data?.count ?? data?.subscriptions?.length ?? 0);
        setError("");
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load subscriptions");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [status]);

  const selectFilter = (value) => {
    setSearchParams(value ? { status: value } : {}, { replace: true });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="min-w-0">
        <h1 className="text-xl font-bold tracking-tight text-gray-800">
          Subscriptions
        </h1>
        <p className="mt-0.5 text-sm text-gray-400">
          {loading
            ? "Loading..."
            : `${count} ${count === 1 ? "subscription" : "subscriptions"}${
                status ? ` · ${status}` : ""
              }`}
        </p>
      </div>

      {/* Filter pills */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.value || "all"}
            onClick={() => selectFilter(f.value)}
            className={`shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition-colors cursor-pointer ${
              status === f.value
                ? "bg-[#2CD377] text-white"
                : "border border-gray-200 bg-white text-gray-500 hover:border-[#2CD377] hover:text-[#2CD377]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2CD377] border-t-transparent" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-6 py-12 text-center">
          <p className="text-sm font-medium text-red-500">{error}</p>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && subscriptions.length === 0 && (
        <div className="rounded-2xl border border-gray-100 bg-gray-50 px-6 py-12 text-center">
          <p className="text-sm font-medium text-gray-400">
            No subscriptions found
          </p>
        </div>
      )}

      {/* Grid */}
      {!loading && !error && subscriptions.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subscriptions.map((s) => (
            <SubscriptionCard
              key={s.subscription_id}
              subscription={s}
              onOpen={() => navigate(`/subscriptions/${s.subscription_id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SubscriptionsList;
