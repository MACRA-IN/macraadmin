import { useEffect, useState } from "react";
import {
  autoPlanMeals,
  getPendingMealPlannerCustomers,
} from "../../services/mealPlannerServices";
import ConfirmDialog from "../../components/ui/confirmDialog";
import Toast from "../../components/ui/toast";
import useToast from "../../hooks/useToast";

const WhatsAppIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 32 32" fill="currentColor">
    <path d="M16 0C7.163 0 0 7.163 0 16c0 2.833.738 5.494 2.031 7.807L0 32l8.418-2.007A15.93 15.93 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.27 13.27 0 01-6.79-1.858l-.487-.29-5.002 1.194 1.257-4.866-.317-.5A13.267 13.267 0 012.667 16C2.667 8.636 8.636 2.667 16 2.667S29.333 8.636 29.333 16 23.364 29.333 16 29.333zm7.27-9.862c-.398-.199-2.352-1.16-2.717-1.292-.364-.133-.63-.199-.895.199-.265.398-1.028 1.292-1.26 1.558-.232.265-.464.298-.862.1-.398-.2-1.681-.62-3.202-1.977-1.183-1.056-1.982-2.36-2.214-2.758-.232-.398-.025-.613.174-.811.179-.178.398-.464.597-.696.2-.232.265-.398.398-.664.133-.265.066-.497-.033-.696-.1-.199-.895-2.157-1.226-2.953-.323-.775-.65-.67-.895-.682-.232-.01-.497-.013-.762-.013-.265 0-.696.1-1.061.497-.364.398-1.393 1.36-1.393 3.317s1.426 3.847 1.625 4.113c.199.265 2.806 4.284 6.798 6.01.95.41 1.692.655 2.27.839.954.303 1.822.26 2.509.158.765-.114 2.352-.961 2.684-1.889.332-.928.332-1.724.232-1.889-.099-.165-.364-.265-.762-.464z" />
  </svg>
);

const RefreshIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const CheckIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const WarningIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
  </svg>
);

const buildReminderUrl = (customer) => {
  const message = encodeURIComponent(
    `Hi ${customer.customer_name} 👋\n\nYou haven't planned your meals for next week.\n\nPlease open Macra and complete your meal planning.\n\nhttps://macra.in/dashboard`,
  );
  return `https://wa.me/91${customer.phone}?text=${message}`;
};

const openReminder = (customer) =>
  window.open(buildReminderUrl(customer), "_blank");

const Avatar = ({ name, className = "h-8 w-8", textClass = "text-xs" }) => (
  <div className={`${className} rounded-full bg-[#2CD377]/10 flex items-center justify-center shrink-0`}>
    <span className={`${textClass} font-bold text-[#2CD377]`}>
      {name?.charAt(0).toUpperCase()}
    </span>
  </div>
);

const StatTile = ({ label, value }) => (
  <div className="min-w-0 rounded-xl bg-gray-50 px-3 py-2">
    <p className="text-[10px] uppercase tracking-wide text-gray-400">{label}</p>
    <p className="mt-0.5 truncate text-xs font-semibold text-gray-700">{value}</p>
  </div>
);

const PendingCustomerCard = ({ customer, planning, onAutoPlan }) => (
  <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-4 shadow-sm">
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar name={customer.customer_name} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-800">
            {customer.customer_name}
          </p>
          <p className="truncate text-xs text-gray-400">{customer.phone}</p>
        </div>
      </div>
      <span className="shrink-0 rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-semibold text-yellow-600">
        Pending
      </span>
    </div>

    <div className="grid grid-cols-2 gap-2">
      <StatTile label="Plan" value={customer.plan} />
      <StatTile label="End Date" value={customer.end_date} />
    </div>

    <div className="grid grid-cols-2 gap-2">
      <button
        onClick={() => openReminder(customer)}
        className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-[#25D366] px-3 py-2.5 text-xs font-bold text-white shadow-md shadow-[#25D366]/20 transition-all duration-150 hover:bg-[#20bd5a] active:scale-95 cursor-pointer"
      >
        <WhatsAppIcon className="h-4 w-4 shrink-0" />
        Send Reminder
      </button>

      <button
        onClick={() => onAutoPlan(customer)}
        disabled={planning}
        className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-[#2CD377] px-3 py-2.5 text-xs font-bold text-white shadow-md shadow-[#2CD377]/20 transition-all duration-150 hover:bg-[#25b866] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
      >
        {planning ? "Planning..." : "Plan Meals"}
      </button>
    </div>
  </div>
);

const MealPlanningPending = () => {
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState({ pending_count: 0, customers: [] });
  const [planningId, setPlanningId] = useState(null);
  const [confirmCustomer, setConfirmCustomer] = useState(null);
  const { toast, showSuccess, showError, dismiss } = useToast();

  const fetchPendingCustomers = async () => {
    try {
      setLoading(true);
      const data = await getPendingMealPlannerCustomers();
      setPending(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoPlan = async () => {
    const customer = confirmCustomer;
    if (!customer) return;

    setPlanningId(customer.subscription_id);
    try {
      const json = await autoPlanMeals(
        customer.subscription_id,
        customer.target_date,
      );
      setConfirmCustomer(null);

      if (json.success) {
        showSuccess(json.message || "Meals planned successfully.");
        fetchPendingCustomers();
      } else {
        showError(json.message || "Failed to plan meals");
      }
    } catch (err) {
      setConfirmCustomer(null);
      showError(err?.response?.data?.message || "Failed to plan meals");
    } finally {
      setPlanningId(null);
    }
  };

  useEffect(() => {
    fetchPendingCustomers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 rounded-full border-4 border-[#2CD377] border-t-transparent" />
      </div>
    );
  }

  const allDone = pending.pending_count === 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-gray-800">Meal Planning</h1>
          <p className="mt-0.5 text-sm text-gray-400">
            Customers pending meal plan for next week
          </p>
        </div>

        <button
          onClick={fetchPendingCustomers}
          className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-500 transition-all duration-150 hover:border-[#2CD377] hover:text-[#2CD377] cursor-pointer sm:self-auto"
        >
          <RefreshIcon className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Stat Banner */}
      <div
        className={`flex items-center gap-4 rounded-2xl border px-4 py-4 sm:px-5 ${
          allDone
            ? "border-[#2CD377]/20 bg-[#2CD377]/5"
            : "border-yellow-200 bg-yellow-50"
        }`}
      >
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            allDone ? "bg-[#2CD377]/15" : "bg-yellow-100"
          }`}
        >
          {allDone ? (
            <CheckIcon className="h-5 w-5 text-[#2CD377]" />
          ) : (
            <WarningIcon className="h-5 w-5 text-yellow-500" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          {allDone ? (
            <>
              <p className="text-sm font-bold text-[#2CD377]">All caught up!</p>
              <p className="mt-0.5 text-xs text-gray-400">
                Everyone has planned their meals for next week.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-bold text-yellow-700">
                {pending.pending_count} customer
                {pending.pending_count > 1 ? "s" : ""} haven&apos;t planned yet
              </p>
              <p className="mt-0.5 text-xs text-yellow-500">
                Send a WhatsApp reminder to nudge them.
              </p>
            </>
          )}
        </div>

        {!allDone && (
          <span className="shrink-0 text-2xl font-bold text-yellow-500 sm:text-3xl">
            {pending.pending_count}
          </span>
        )}
      </div>

      {/* Customer List */}
      {!allDone && (
        <>
          {/* Mobile cards */}
          <div className="flex flex-col gap-3 sm:hidden">
            {pending.customers.map((customer) => (
              <PendingCustomerCard
                key={customer.subscription_id}
                customer={customer}
                planning={planningId === customer.subscription_id}
                onAutoPlan={setConfirmCustomer}
              />
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm sm:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Customer
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Phone
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Plan
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                      End Date
                    </th>
                    <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {pending.customers.map((customer, index) => (
                    <tr
                      key={customer.subscription_id}
                      className={
                        index !== pending.customers.length - 1
                          ? "border-b border-gray-50 hover:bg-gray-50/50"
                          : "hover:bg-gray-50/50"
                      }
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar
                            name={customer.customer_name}
                            className="h-7 w-7"
                            textClass="text-[10px]"
                          />
                          <span className="truncate font-medium text-gray-800">
                            {customer.customer_name}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap text-gray-500">
                        {customer.phone}
                      </td>

                      <td className="px-5 py-3.5 text-gray-600">{customer.plan}</td>

                      <td className="px-5 py-3.5 whitespace-nowrap text-gray-500">
                        {customer.end_date}
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setConfirmCustomer(customer)}
                            disabled={planningId === customer.subscription_id}
                            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-[#2CD377] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm shadow-[#2CD377]/20 transition-all duration-150 hover:bg-[#25b866] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                          >
                            {planningId === customer.subscription_id
                              ? "Planning..."
                              : "Plan Meals"}
                          </button>

                          <button
                            onClick={() => openReminder(customer)}
                            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-[#25D366] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm shadow-[#25D366]/20 transition-all duration-150 hover:bg-[#20bd5a] cursor-pointer"
                          >
                            <WhatsAppIcon className="h-3.5 w-3.5 shrink-0" />
                            WhatsApp
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <ConfirmDialog
        open={Boolean(confirmCustomer)}
        title={`Auto-plan meals for ${confirmCustomer?.customer_name ?? ""}?`}
        message="All remaining meals will be filled in automatically. They will be notified to review and change them."
        confirmLabel="Plan Meals"
        busyLabel="Planning..."
        busy={planningId === confirmCustomer?.subscription_id}
        onConfirm={handleAutoPlan}
        onCancel={() => setConfirmCustomer(null)}
      />

      <Toast toast={toast} onDismiss={dismiss} />
    </div>
  );
};

export default MealPlanningPending;
