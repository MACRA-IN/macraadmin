import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSettlementById, markSettlementPaid } from "../../services/settlementServices";

const statusStyle = (status) => {
  if (status === "paid") return "bg-green-50 text-green-600";
  if (status === "partial") return "bg-yellow-50 text-yellow-600";
  return "bg-red-50 text-red-500";
};

const SummaryCard = ({ label, value, valueClass = "text-gray-800" }) => (
  <div className="bg-white border border-gray-100 rounded-2xl px-4 py-4 shadow-sm flex flex-col gap-1">
    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
    <p className={`text-xl font-bold ${valueClass}`}>{value}</p>
  </div>
);

const SettlementDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [settlement, setSettlement] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [amount, setAmount] = useState("");

  const fetchSettlement = async () => {
    try {
      const response = await getSettlementById(id);
      if (response.success) {
        setSettlement(response.data.settlement);
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error("Failed to fetch settlement:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSettlement(); }, []);

  const handlePayment = async () => {
    if (!amount || Number(amount) <= 0) { alert("Enter a valid amount."); return; }
    try {
      const response = await markSettlementPaid(settlement.id, Number(amount));
      if (response.success) {
        setShowPaymentModal(false);
        setAmount("");
        fetchSettlement();
      }
    } catch (error) {
      alert(error.response?.data?.message || "Payment failed.");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin h-8 w-8 rounded-full border-4 border-[#2CD377] border-t-transparent" />
    </div>
  );

  if (!settlement) return (
    <div className="bg-red-50 border border-red-100 rounded-2xl px-6 py-4">
      <p className="text-red-500 text-sm font-medium">Settlement not found.</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/settlements")}
            className="h-8 w-8 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 transition cursor-pointer shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Settlement Details</h1>
            <p className="text-sm text-gray-400 mt-0.5">{settlement.week_start} — {settlement.week_end}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full capitalize ${statusStyle(settlement.status)}`}>
            {settlement.status}
          </span>
          {settlement.status !== "paid" && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="flex items-center gap-2 bg-[#2CD377] hover:bg-[#25bc6a] active:scale-95 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all duration-150 shadow-lg shadow-[#2CD377]/30 cursor-pointer"
            >
              Mark as Paid
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
        <SummaryCard label="Customer Collection" value={`₹${settlement.customer_collection}`} />
        <SummaryCard label="Kitchen Payable" value={`₹${settlement.kitchen_payable}`} />
        <SummaryCard label="Macra Profit" value={`₹${settlement.macra_profit}`} valueClass="text-[#2CD377]" />
        <SummaryCard label="Paid Amount" value={`₹${settlement.paid_amount}`} />
        <SummaryCard label="Balance" value={`₹${settlement.balance_amount}`} valueClass="text-red-500" />
      </div>

      {/* Orders */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Orders</span>
          <span className="bg-[#2CD377]/10 text-[#2CD377] text-xs font-bold px-2 py-0.5 rounded-full">{orders.length}</span>
        </div>

        {/* Mobile cards */}
        <div className="flex flex-col gap-3 sm:hidden">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-gray-100 rounded-2xl px-4 py-4 flex flex-col gap-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#2CD377] text-sm">#{order.id}</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${order.status === "delivered" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-600"}`}>
                  {order.status}
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-800">{order.product_name}</p>
              <p className="text-xs text-gray-400 capitalize">{order.delivery_slot} slot</p>
              <div className="grid grid-cols-3 gap-2 mt-1">
                <div className="bg-gray-50 rounded-xl px-2 py-2 text-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Cust. Paid</p>
                  <p className="text-xs font-bold text-gray-800 mt-0.5">₹{order.order_total}</p>
                </div>
                <div className="bg-gray-50 rounded-xl px-2 py-2 text-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Commission</p>
                  <p className="text-xs font-bold text-gray-800 mt-0.5">{order.commission_percentage}%</p>
                </div>
                <div className="bg-gray-50 rounded-xl px-2 py-2 text-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Payable</p>
                  <p className="text-xs font-bold text-[#2CD377] mt-0.5">₹{order.kitchen_payable}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Order</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Product</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Slot</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Cust. Paid</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Kitchen Price</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Commission</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Payable</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={order.id} className={index !== orders.length - 1 ? "border-b border-gray-50 hover:bg-gray-50/50" : "hover:bg-gray-50/50"}>
                  <td className="px-5 py-3.5 font-bold text-[#2CD377]">#{order.id}</td>
                  <td className="px-5 py-3.5 font-medium text-gray-700">{order.product_name}</td>
                  <td className="px-5 py-3.5 text-center text-gray-500 capitalize">{order.delivery_slot}</td>
                  <td className="px-5 py-3.5 text-right text-gray-600">₹{order.order_total}</td>
                  <td className="px-5 py-3.5 text-right text-gray-600">₹{order.kitchen_price}</td>
                  <td className="px-5 py-3.5 text-center text-gray-600">{order.commission_percentage}%</td>
                  <td className="px-5 py-3.5 text-right font-semibold text-gray-800">₹{order.kitchen_payable}</td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${order.status === "delivered" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-600"}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-gray-800">Record Payment</h2>
            <p className="text-sm text-gray-400 mt-0.5">Remaining balance</p>
            <p className="text-3xl font-bold text-[#2CD377] mt-1">₹{settlement.balance_amount}</p>

            <div className="mt-5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Amount Paid</label>
              <input
                type="number"
                min="1"
                max={settlement.balance_amount}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter payment amount"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#2CD377] focus:ring-2 focus:ring-[#2CD377]/20 transition"
              />
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => { setShowPaymentModal(false); setAmount(""); }}
                className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                className="flex-1 bg-[#2CD377] hover:bg-[#25bc6a] text-white rounded-xl py-2.5 text-sm font-bold transition shadow-lg shadow-[#2CD377]/30 cursor-pointer"
              >
                Save Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettlementDetails;
