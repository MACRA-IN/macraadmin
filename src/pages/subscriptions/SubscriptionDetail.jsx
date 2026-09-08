import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getSubscriptionById,
  getTierProducts,
  shuffleMealSlots,
  updateMealSlot,
} from "../../services/subscriptionServices";
import ConfirmDialog from "../../components/ui/confirmDialog";
import Toast from "../../components/ui/toast";
import useToast from "../../hooks/useToast";

/* ---------------------------------------------------------------- */
/*  Icons                                                            */
/* ---------------------------------------------------------------- */
const BackIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const PencilIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const LockIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const WhatsAppIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 32 32" fill="currentColor">
    <path d="M16 0C7.163 0 0 7.163 0 16c0 2.833.738 5.494 2.031 7.807L0 32l8.418-2.007A15.93 15.93 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.27 13.27 0 01-6.79-1.858l-.487-.29-5.002 1.194 1.257-4.866-.317-.5A13.267 13.267 0 012.667 16C2.667 8.636 8.636 2.667 16 2.667S29.333 8.636 29.333 16 23.364 29.333 16 29.333zm7.27-9.862c-.398-.199-2.352-1.16-2.717-1.292-.364-.133-.63-.199-.895.199-.265.398-1.028 1.292-1.26 1.558-.232.265-.464.298-.862.1-.398-.2-1.681-.62-3.202-1.977-1.183-1.056-1.982-2.36-2.214-2.758-.232-.398-.025-.613.174-.811.179-.178.398-.464.597-.696.2-.232.265-.398.398-.664.133-.265.066-.497-.033-.696-.1-.199-.895-2.157-1.226-2.953-.323-.775-.65-.67-.895-.682-.232-.01-.497-.013-.762-.013-.265 0-.696.1-1.061.497-.364.398-1.393 1.36-1.393 3.317s1.426 3.847 1.625 4.113c.199.265 2.806 4.284 6.798 6.01.95.41 1.692.655 2.27.839.954.303 1.822.26 2.509.158.765-.114 2.352-.961 2.684-1.889.332-.928.332-1.724.232-1.889-.099-.165-.364-.265-.762-.464z" />
  </svg>
);

/* ---------------------------------------------------------------- */
/*  Helpers                                                          */
/* ---------------------------------------------------------------- */
const statusStyle = (status) => {
  if (status === "active") return "bg-[#2CD377]/10 text-[#2CD377]";
  if (status === "paused") return "bg-yellow-50 text-yellow-600";
  if (status === "expired") return "bg-red-50 text-red-500";
  return "bg-gray-100 text-gray-500";
};

/** "2026-09-09" is parsed as a local calendar day, not UTC midnight, so a
 *  delivery date never renders one day early. */
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
    ? d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : iso || "—";
};

/** plan_price arrives as a string like "796.00". */
const fmtPrice = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? `₹${n.toLocaleString("en-IN")}` : `₹${value}`;
};

const dayParts = (iso) => {
  const d = parseDate(iso);
  if (!d) return { day: iso, weekday: "" };
  return {
    day: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    weekday: d.toLocaleDateString("en-IN", { weekday: "short" }),
  };
};

/* ---------------------------------------------------------------- */
/*  Pieces                                                           */
/* ---------------------------------------------------------------- */
const Field = ({ label, value }) => (
  <div className="min-w-0">
    <p className="text-[10px] uppercase tracking-wide text-gray-400">{label}</p>
    <p className="mt-0.5 truncate text-sm font-semibold text-gray-800">
      {value || "—"}
    </p>
  </div>
);

const StatCard = ({ label, value, valueClass = "text-gray-800" }) => (
  <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
    <p className={`text-xl font-bold ${valueClass}`}>{value ?? 0}</p>
    <p className="mt-0.5 text-xs text-gray-400">{label}</p>
  </div>
);

const SlotTile = ({ slot, muted, onEdit }) => {
  const filled = Boolean(slot.product_id || slot.product_name);

  if (!filled) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50/50 px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-wide text-gray-400">
            {slot.slot}
          </p>
          <p className="mt-0.5 truncate text-xs font-medium text-gray-400">
            Not planned
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2.5 rounded-xl border border-gray-100 bg-white px-3 py-2.5 ${
        muted ? "opacity-60" : ""
      }`}
    >
      {slot.image_url && (
        <img
          src={slot.image_url}
          alt=""
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
          className="h-9 w-9 shrink-0 rounded-lg object-cover"
        />
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span
            title={slot.is_veg ? "Veg" : "Non-veg"}
            className={`h-2 w-2 shrink-0 rounded-full ${
              slot.is_veg ? "bg-[#2CD377]" : "bg-red-500"
            }`}
          />
          <p className="text-[10px] uppercase tracking-wide text-gray-400">
            {slot.slot}
          </p>
        </div>

        <p className="mt-0.5 truncate text-xs font-semibold text-gray-800">
          {slot.product_name}
        </p>

        <p className="mt-0.5 truncate text-[11px] text-gray-400">
          {slot.protein_g}g protein · {slot.calories} kcal
        </p>
      </div>

      {slot.editable ? (
        <button
          onClick={() => onEdit(slot)}
          aria-label={`Edit ${slot.slot}`}
          className="shrink-0 rounded-lg border border-gray-200 p-1.5 text-gray-400 transition-colors hover:border-[#2CD377] hover:text-[#2CD377] cursor-pointer"
        >
          <PencilIcon className="h-3.5 w-3.5" />
        </button>
      ) : (
        <span
          title="Locked — the order has already been generated"
          className="shrink-0 rounded-lg border border-gray-100 bg-gray-50 p-1.5 text-gray-300"
        >
          <LockIcon className="h-3.5 w-3.5" />
        </span>
      )}
    </div>
  );
};

const ShuffleIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
  </svg>
);

const CloseIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

/** Pick a different bowl for one slot. */
const ProductPicker = ({ slot, date, products, loading, saving, onPick, onClose }) => {
  const [query, setQuery] = useState("");

  const term = query.trim().toLowerCase();
  const shown = term
    ? products.filter((p) => p.name?.toLowerCase().includes(term))
    : products;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-4 sm:items-center"
      onClick={() => !saving && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <div className="min-w-0">
            <p className="text-base font-bold text-gray-800">Change bowl</p>
            <p className="mt-0.5 truncate text-xs text-gray-400">
              <span className="capitalize">{slot.slot}</span> · {date}
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
            className="shrink-0 rounded-lg p-1 text-gray-400 transition-colors hover:text-gray-600 disabled:opacity-50 cursor-pointer"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-gray-100 px-5 py-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search bowls"
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-[#2CD377] focus:ring-2 focus:ring-[#2CD377]/20"
          />
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3">
          {loading && (
            <div className="flex justify-center py-10">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-[#2CD377] border-t-transparent" />
            </div>
          )}

          {!loading && shown.length === 0 && (
            <p className="py-10 text-center text-sm text-gray-400">
              No bowls match that search.
            </p>
          )}

          {!loading && shown.length > 0 && (
            <div className="flex flex-col gap-2">
              {shown.map((p) => {
                const current = p.id === slot.product_id;
                return (
                  <button
                    key={p.id}
                    onClick={() => !current && onPick(p)}
                    disabled={saving || current}
                    className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors disabled:cursor-not-allowed ${
                      current
                        ? "border-[#2CD377] bg-[#2CD377]/5"
                        : "border-gray-100 hover:border-[#2CD377] disabled:opacity-50 cursor-pointer"
                    }`}
                  >
                    {p.image_url && (
                      <img
                        src={p.image_url}
                        alt=""
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                        className="h-10 w-10 shrink-0 rounded-lg object-cover"
                      />
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          title={p.is_veg ? "Veg" : "Non-veg"}
                          className={`h-2 w-2 shrink-0 rounded-full ${
                            p.is_veg ? "bg-[#2CD377]" : "bg-red-500"
                          }`}
                        />
                        <p className="truncate text-sm font-semibold text-gray-800">
                          {p.name}
                        </p>
                      </div>
                      <p className="mt-0.5 truncate text-[11px] text-gray-400">
                        {p.protein_g}g protein · {p.calories} kcal
                      </p>
                    </div>

                    {current && (
                      <span className="shrink-0 rounded-full bg-[#2CD377]/10 px-2 py-0.5 text-[10px] font-bold text-[#2CD377]">
                        Current
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CalendarRow = ({ entry, onEdit }) => {
  const { day, weekday } = dayParts(entry.date);
  const inactive = entry.paused || entry.off_day;
  const label = entry.paused ? "Paused" : entry.off_day ? "No delivery" : null;
  const slots = entry.slots || [];

  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl border px-4 py-3 sm:flex-row sm:items-center ${
        inactive ? "border-gray-100 bg-gray-50" : "border-gray-100 bg-white shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between gap-2 sm:w-28 sm:shrink-0 sm:flex-col sm:items-start">
        <div className="min-w-0">
          <p
            className={`truncate text-sm font-bold ${
              inactive ? "text-gray-400" : "text-gray-800"
            }`}
          >
            {day}
          </p>
          <p className="truncate text-xs text-gray-400">{weekday}</p>
        </div>

        {label && (
          <span className="shrink-0 rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-500">
            {label}
          </span>
        )}
      </div>

      {slots.length > 0 ? (
        <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
          {slots.map((slot) => (
            <SlotTile
              key={`${entry.date}-${slot.slot}`}
              slot={slot}
              muted={inactive}
              onEdit={(s) => onEdit(s, entry.date)}
            />
          ))}
        </div>
      ) : (
        <p className="min-w-0 flex-1 text-xs text-gray-400">
          {label || "No slots"}
        </p>
      )}
    </div>
  );
};

/* ---------------------------------------------------------------- */
/*  Page                                                             */
/* ---------------------------------------------------------------- */
const SubscriptionDetail = () => {
  const { subscriptionId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [editing, setEditing] = useState(null); // { slot, date }
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmShuffle, setConfirmShuffle] = useState(false);
  const [shuffling, setShuffling] = useState(false);

  const { toast, showSuccess, showError, dismiss } = useToast();

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const json = await getSubscriptionById(subscriptionId);
        if (cancelled) return;
        setData(json);
        setError("");
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load subscription");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [subscriptionId, reloadKey]);

  const refresh = () => setReloadKey((k) => k + 1);

  const handleEditSlot = async (slot, date) => {
    setEditing({ slot, date });

    // The tier list is the same for every slot, so only fetch it once.
    if (products.length > 0) return;

    setProductsLoading(true);
    try {
      const json = await getTierProducts(subscriptionId);
      setProducts(json?.products || []);
    } catch (err) {
      showError(err.message || "Failed to load bowls");
    } finally {
      setProductsLoading(false);
    }
  };

  const handlePickProduct = async (product) => {
    if (!editing?.slot?.meal_planner_id) return;

    setSaving(true);
    try {
      const json = await updateMealSlot(
        editing.slot.meal_planner_id,
        product.id,
      );
      setEditing(null);
      showSuccess(json?.message || `Swapped to ${product.name}`);
      refresh();
    } catch (err) {
      showError(err.message || "Failed to update the slot");
    } finally {
      setSaving(false);
    }
  };

  const handleShuffle = async () => {
    setShuffling(true);
    try {
      const json = await shuffleMealSlots(subscriptionId);
      setConfirmShuffle(false);
      showSuccess(json?.message || "Meals shuffled");
      refresh();
    } catch (err) {
      setConfirmShuffle(false);
      showError(err.message || "Failed to shuffle meals");
    } finally {
      setShuffling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2CD377] border-t-transparent" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 px-6 py-12 text-center">
        <p className="text-sm font-medium text-red-500">
          {error || "Subscription not found."}
        </p>
        <button
          onClick={() => navigate("/subscriptions")}
          className="mt-3 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white cursor-pointer"
        >
          Back to subscriptions
        </button>
      </div>
    );
  }

  const { customer = {}, subscription = {}, progress = {}, calendar = [] } = data;
  const slots = Array.isArray(subscription.delivery_slot)
    ? subscription.delivery_slot.join(", ")
    : subscription.delivery_slot;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/subscriptions")}
          aria-label="Back to subscriptions"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-gray-200 transition hover:bg-gray-50 cursor-pointer"
        >
          <BackIcon className="h-4 w-4 text-gray-500" />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold text-gray-800">
            {customer.name}
          </h1>
          <p className="mt-0.5 truncate text-sm text-gray-400">
            {subscription.plan} · {subscription.category}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${statusStyle(
            subscription.status,
          )}`}
        >
          {subscription.status}
        </span>
      </div>

      {/* Customer */}
      <div className="rounded-2xl border border-gray-100 bg-white px-4 py-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
          Customer
        </p>

        <div className="mt-3 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Field label="Name" value={customer.name} />

          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wide text-gray-400">
              Phone
            </p>
            {customer.phone ? (
              <a
                href={`https://wa.me/91${customer.phone}`}
                target="_blank"
                rel="noreferrer"
                className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-[#25D366] hover:underline"
              >
                <WhatsAppIcon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{customer.phone}</span>
              </a>
            ) : (
              <p className="mt-0.5 text-sm font-semibold text-gray-800">—</p>
            )}
          </div>

          <Field label="Email" value={customer.email} />
          <Field label="Address" value={customer.address} />
        </div>
      </div>

      {/* Subscription */}
      <div className="rounded-2xl border border-gray-100 bg-white px-4 py-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
          Subscription
        </p>

        <div className="mt-3 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Field label="Plan" value={subscription.plan} />
          <Field label="Category" value={subscription.category} />
          <Field label="Price" value={fmtPrice(subscription.plan_price)} />
          <Field label="Slots" value={slots} />
          <Field
            label="Date Range"
            value={`${fmtDate(subscription.start_date)} — ${fmtDate(
              subscription.end_date,
            )}`}
          />
          <Field label="Status" value={subscription.status} />

          {subscription.pause_start_date && (
            <>
              <Field
                label="Paused"
                value={`${fmtDate(subscription.pause_start_date)} — ${fmtDate(
                  subscription.pause_end_date,
                )}`}
              />
              <Field
                label="Paused Days"
                value={subscription.total_paused_days}
              />
            </>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total days" value={progress.total_delivery_days} />
        <StatCard
          label="Planned"
          value={progress.planned_meals}
          valueClass="text-[#2CD377]"
        />
        <StatCard label="Order created" value={progress.order_created} />
        <StatCard
          label="Not planned"
          value={progress.not_planned}
          valueClass="text-red-500"
        />
      </div>

      {/* Calendar */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Calendar
            </span>
            <span className="rounded-full bg-[#2CD377]/10 px-2 py-0.5 text-xs font-bold text-[#2CD377]">
              {calendar.length}
            </span>
          </div>

          <button
            onClick={() => setConfirmShuffle(true)}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-500 transition-all duration-150 hover:border-[#2CD377] hover:text-[#2CD377] cursor-pointer"
          >
            <ShuffleIcon className="h-3.5 w-3.5" />
            Shuffle
          </button>
        </div>

        {calendar.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-gray-50 px-6 py-12 text-center">
            <p className="text-sm font-medium text-gray-400">
              No delivery days yet
            </p>
          </div>
        ) : (
          calendar.map((entry) => (
            <CalendarRow
              key={entry.date}
              entry={entry}
              onEdit={handleEditSlot}
            />
          ))
        )}
      </div>

      {editing && (
        <ProductPicker
          slot={editing.slot}
          date={editing.date}
          products={products}
          loading={productsLoading}
          saving={saving}
          onPick={handlePickProduct}
          onClose={() => setEditing(null)}
        />
      )}

      <ConfirmDialog
        open={confirmShuffle}
        title="Shuffle the remaining meals?"
        message="Every slot that is still editable gets a new random bowl from this subscription's tier. Locked slots — the ones already turned into orders — are left alone."
        confirmLabel="Shuffle"
        busyLabel="Shuffling..."
        busy={shuffling}
        onConfirm={handleShuffle}
        onCancel={() => setConfirmShuffle(false)}
      />

      <Toast toast={toast} onDismiss={dismiss} />
    </div>
  );
};

export default SubscriptionDetail;
