import { useState, useEffect } from "react";
import { getKitchenOrders, triggerCreateOrders } from "../../services/dashboardServices";

const KitchenOrders = () => {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generateResult, setGenerateResult] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getKitchenOrders();
      setOrders(data.orders);
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateOrders = async () => {
    try {
      setGenerating(true);
      setGenerateResult(null);
      const data = await triggerCreateOrders();
      setGenerateResult(data);
      await fetchOrders();
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleSendToKitchen = () => {
    const phone = "919381972536";
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const lunch = orders.filter((o) => o.delivery_slot === "lunch");
  const dinner = orders.filter((o) => o.delivery_slot === "dinner");

  const OrderTable = ({ list }) => (
    <div className="border border-gray-100 rounded-2xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">ID</th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Category</th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Product</th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Address</th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone</th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody>
          {list.map((order, index) => (
            <tr key={order.id} className={index !== list.length - 1 ? "border-b border-gray-50" : ""}>
              <td className="px-5 py-3.5 font-bold text-[#2CD377]">#{order.id}</td>
              <td className="px-5 py-3.5 font-medium text-gray-700">{order.category_name}</td>
              <td className="px-5 py-3.5 text-gray-600">{order.product_name}</td>
              <td className="px-5 py-3.5 text-gray-400 max-w-xs truncate">{order.address}</td>
              <td className="px-5 py-3.5 text-gray-400">{order.customer_phone || "—"}</td>
              <td className="px-5 py-3.5">
                <span className="bg-blue-50 text-blue-500 text-xs font-semibold px-2.5 py-1 rounded-full capitalize">{order.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 rounded-full border-4 border-[#2CD377] border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-2xl px-6 py-4">
        <p className="text-red-500 text-sm font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Kitchen Orders</h2>
          <p className="text-gray-400 text-sm mt-0.5">{orders.length} scheduled orders today</p>
        </div>
        <div className="flex items-center gap-3">

          {/* Generate Orders Button */}
          <button
            onClick={handleGenerateOrders}
            disabled={generating}
            className="flex items-center gap-2 bg-white border border-gray-200 hover:border-[#2CD377] hover:text-[#2CD377] text-gray-600 font-bold px-5 py-2.5 rounded-xl text-sm transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {generating ? (
              <div className="animate-spin h-4 w-4 rounded-full border-2 border-[#2CD377] border-t-transparent" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            {generating ? "Generating..." : "Generate Orders"}
          </button>

          {/* Send to Kitchen Button */}
          <button
            onClick={handleSendToKitchen}
            disabled={orders.length === 0}
            className="flex items-center gap-2 bg-[#2CD377] hover:bg-[#25bc6a] active:scale-95 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all duration-150 shadow-lg shadow-[#2CD377]/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L0 24l6.341-1.512A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.662-.523-5.178-1.433l-.371-.22-3.862.921.978-3.768-.242-.389A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
            Send to Kitchen
          </button>

        </div>
      </div>

      {/* Generate Result Banner */}
      {generateResult && (
        <div className="bg-[#2CD377]/10 border border-[#2CD377]/20 rounded-2xl px-5 py-3 flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#2CD377]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-medium text-[#2CD377]">
            {generateResult.data.orders_created} orders created · {generateResult.data.orders_assigned} assigned to {generateResult.data.riders_used} rider
          </p>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="bg-gray-50 border border-gray-100 rounded-2xl px-6 py-12 text-center">
          <p className="text-gray-400 text-sm font-medium">No scheduled orders today</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">

          {/* Lunch Section */}
          {lunch.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Lunch</span>
                <span className="bg-[#2CD377]/10 text-[#2CD377] text-xs font-bold px-2 py-0.5 rounded-full">{lunch.length}</span>
              </div>
              <OrderTable list={lunch} />
            </div>
          )}

          {/* Dinner Section */}
          {dinner.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Dinner</span>
                <span className="bg-[#2CD377]/10 text-[#2CD377] text-xs font-bold px-2 py-0.5 rounded-full">{dinner.length}</span>
              </div>
              <OrderTable list={dinner} />
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default KitchenOrders;