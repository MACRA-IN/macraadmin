import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getSettlementById,
  markSettlementPaid,
} from "../../services/settlementServices";

const SettlementDetails = () => {
  const { id } = useParams();

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

  useEffect(() => {
    fetchSettlement();
  }, []);

  const handlePayment = async () => {
    if (!amount || Number(amount) <= 0) {
      alert("Enter a valid amount.");
      return;
    }

    try {
      const response = await markSettlementPaid(settlement.id, Number(amount));
      if (response.success) {
        setShowPaymentModal(false);
        setAmount("");
        fetchSettlement();
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Payment failed.");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading settlement...</p>
      </div>
    );
  }

  if (!settlement) {
    return (
      <div className="p-6">
        <p className="text-red-500">Settlement not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settlement Details</h1>

          <p className="mt-1 text-sm text-gray-500">
            {settlement.week_start} to {settlement.week_end}
          </p>
        </div>

        <span
          className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${
            settlement.status === "paid"
              ? "bg-green-100 text-green-700"
              : settlement.status === "partial"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
          }`}
        >
          {settlement.status}
        </span>
      </div>

      {/* Summary */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Customer Collection</p>

          <h2 className="mt-2 text-2xl font-bold">
            ₹{settlement.customer_collection}
          </h2>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Kitchen Payable</p>

          <h2 className="mt-2 text-2xl font-bold">
            ₹{settlement.kitchen_payable}
          </h2>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Macra Profit</p>

          <h2 className="mt-2 text-2xl font-bold text-[#2CD377]">
            ₹{settlement.macra_profit}
          </h2>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Paid Amount</p>

          <h2 className="mt-2 text-2xl font-bold">₹{settlement.paid_amount}</h2>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Balance</p>

          <h2 className="mt-2 text-2xl font-bold text-red-500">
            ₹{settlement.balance_amount}
          </h2>
        </div>
      </div>

      {/* Orders */}

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold">Orders ({orders.length})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Order
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Product
                </th>

                <th className="px-6 py-4 text-center text-xs font-semibold uppercase text-gray-500">
                  Slot
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-gray-500">
                  Customer Paid
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-gray-500">
                  Kitchen Price
                </th>

                <th className="px-6 py-4 text-center text-xs font-semibold uppercase text-gray-500">
                  Commission
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-gray-500">
                  Kitchen Payable
                </th>

                <th className="px-6 py-4 text-center text-xs font-semibold uppercase text-gray-500">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">#{order.id}</td>

                  <td className="px-6 py-4 font-medium">
                    {order.product_name}
                  </td>

                  <td className="px-6 py-4 text-center capitalize">
                    {order.delivery_slot}
                  </td>

                  <td className="px-6 py-4 text-right">₹{order.order_total}</td>

                  <td className="px-6 py-4 text-right">
                    ₹{order.kitchen_price}
                  </td>

                  <td className="px-6 py-4 text-center">
                    {order.commission_percentage}%
                  </td>

                  <td className="px-6 py-4 text-right font-semibold">
                    ₹{order.kitchen_payable}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        order.status === "delivered"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {settlement.status !== "paid" && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowPaymentModal(true)}
            className="rounded-lg bg-[#2CD377] px-6 py-3 font-semibold text-white transition hover:bg-[#22b864]"
          >
            Mark as Paid
          </button>
        </div>
      )}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold">Record Payment</h2>

            <p className="mt-2 text-sm text-gray-500">Remaining Balance</p>

            <h3 className="mt-1 text-3xl font-bold text-[#2CD377]">
              ₹{settlement.balance_amount}
            </h3>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium">
                Amount Paid
              </label>

              <input
                type="number"
                min="1"
                max={settlement.balance_amount}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter payment amount"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#2CD377]"
              />
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setAmount("");
                }}
                className="rounded-lg border border-gray-300 px-5 py-2 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={handlePayment}
                className="rounded-lg bg-[#2CD377] px-5 py-2 font-medium text-white hover:bg-[#22b864]"
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
