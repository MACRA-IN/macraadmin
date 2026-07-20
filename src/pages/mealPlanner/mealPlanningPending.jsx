import { useEffect, useState } from "react";
import { getPendingMealPlannerCustomers } from "../../services/mealPlannerServices";

const WhatsAppIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 32 32" fill="currentColor">
    <path d="M16 0C7.163 0 0 7.163 0 16c0 2.833.738 5.494 2.031 7.807L0 32l8.418-2.007A15.93 15.93 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.27 13.27 0 01-6.79-1.858l-.487-.29-5.002 1.194 1.257-4.866-.317-.5A13.267 13.267 0 012.667 16C2.667 8.636 8.636 2.667 16 2.667S29.333 8.636 29.333 16 23.364 29.333 16 29.333zm7.27-9.862c-.398-.199-2.352-1.16-2.717-1.292-.364-.133-.63-.199-.895.199-.265.398-1.028 1.292-1.26 1.558-.232.265-.464.298-.862.1-.398-.2-1.681-.62-3.202-1.977-1.183-1.056-1.982-2.36-2.214-2.758-.232-.398-.025-.613.174-.811.179-.178.398-.464.597-.696.2-.232.265-.398.398-.664.133-.265.066-.497-.033-.696-.1-.199-.895-2.157-1.226-2.953-.323-.775-.65-.67-.895-.682-.232-.01-.497-.013-.762-.013-.265 0-.696.1-1.061.497-.364.398-1.393 1.36-1.393 3.317s1.426 3.847 1.625 4.113c.199.265 2.806 4.284 6.798 6.01.95.41 1.692.655 2.27.839.954.303 1.822.26 2.509.158.765-.114 2.352-.961 2.684-1.889.332-.928.332-1.724.232-1.889-.099-.165-.364-.265-.762-.464z" />
  </svg>
);

const MealPlanningPending = () => {
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState({ pending_count: 0, customers: [] });

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

  useEffect(() => { fetchPendingCustomers(); }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin h-8 w-8 rounded-full border-4 border-[#2CD377] border-t-transparent" />
    </div>
  );

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Meal Planning</h1>
          <p className="text-sm text-gray-400 mt-0.5">Customers pending meal plan for next week</p>
        </div>
        <button
          onClick={fetchPendingCustomers}
          className="flex items-center gap-2 bg-white border border-gray-200 hover:border-[#2CD377] hover:text-[#2CD377] text-gray-500 font-bold px-4 py-2.5 rounded-xl text-sm transition-all duration-150 cursor-pointer self-start sm:self-auto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Stat Banner */}
      <div className={`rounded-2xl px-5 py-4 flex items-center gap-4 border ${pending.pending_count === 0 ? "bg-[#2CD377]/5 border-[#2CD377]/20" : "bg-yellow-50 border-yellow-200"}`}>
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${pending.pending_count === 0 ? "bg-[#2CD377]/15" : "bg-yellow-100"}`}>
          {pending.pending_count === 0 ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#2CD377]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          )}
        </div>
        <div>
          {pending.pending_count === 0 ? (
            <>
              <p className="text-sm font-bold text-[#2CD377]">All caught up!</p>
              <p className="text-xs text-gray-400 mt-0.5">Everyone has planned their meals for next week.</p>
            </>
          ) : (
            <>
              <p className="text-sm font-bold text-yellow-700">{pending.pending_count} customer{pending.pending_count > 1 ? "s" : ""} haven't planned yet</p>
              <p className="text-xs text-yellow-500 mt-0.5">Send a WhatsApp reminder to nudge them.</p>
            </>
          )}
        </div>
        {pending.pending_count > 0 && (
          <span className="ml-auto text-3xl font-bold text-yellow-500">{pending.pending_count}</span>
        )}
      </div>

      {/* Customer List */}
      {pending.pending_count > 0 && (
        <>
          {/* Mobile cards */}
          <div className="flex flex-col gap-3 sm:hidden">
            {pending.customers.map((customer) => {
              const message = encodeURIComponent(
                `Hi ${customer.customer_name} 👋\n\nYou haven't planned your meals for next week.\n\nPlease open Macra and complete your meal planning.\n\nhttps://macra.in/dashboard`
              );
              return (
                <div key={customer.subscription_id} className="bg-white border border-gray-100 rounded-2xl px-4 py-4 flex flex-col gap-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-[#2CD377]/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-[#2CD377]">
                          {customer.customer_name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{customer.customer_name}</p>
                        <p className="text-xs text-gray-400">{customer.phone}</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold bg-yellow-50 text-yellow-600 px-2.5 py-1 rounded-full">Pending</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 rounded-xl px-3 py-2">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">Plan</p>
                      <p className="text-xs font-semibold text-gray-700 mt-0.5">{customer.plan}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl px-3 py-2">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">End Date</p>
                      <p className="text-xs font-semibold text-gray-700 mt-0.5">{customer.end_date}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => window.open(`https://wa.me/91${customer.phone}?text=${message}`, '_blank')}
                    className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] active:scale-95 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all duration-150 shadow-md shadow-[#25D366]/20 w-full cursor-pointer"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                    Send Reminder
                  </button>
                </div>
              );
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Plan</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">End Date</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {pending.customers.map((customer, index) => {
                  const message = encodeURIComponent(
                    `Hi ${customer.customer_name} 👋\n\nYou haven't planned your meals for next week.\n\nPlease open Macra and complete your meal planning.\n\nhttps://macra.in/dashboard`
                  );
                  return (
                    <tr key={customer.subscription_id} className={index !== pending.customers.length - 1 ? "border-b border-gray-50 hover:bg-gray-50/50" : "hover:bg-gray-50/50"}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-7 w-7 rounded-full bg-[#2CD377]/10 flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-bold text-[#2CD377]">
                              {customer.customer_name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium text-gray-800">{customer.customer_name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500">{customer.phone}</td>
                      <td className="px-5 py-3.5 text-gray-600">{customer.plan}</td>
                      <td className="px-5 py-3.5 text-gray-500">{customer.end_date}</td>
                      <td className="px-5 py-3.5 text-center">
                        <button
                          onClick={() => window.open(`https://wa.me/91${customer.phone}?text=${message}`, '_blank')}
                          className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold px-3.5 py-1.5 rounded-xl text-xs transition-all duration-150 shadow-sm shadow-[#25D366]/20 cursor-pointer"
                        >
                          <WhatsAppIcon className="h-3.5 w-3.5" />
                          WhatsApp
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default MealPlanningPending;
