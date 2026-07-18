import { useEffect, useState } from "react";
import {
  generateSettlement,
  getsettlements,
} from "../../services/settlementServices";
import { useNavigate } from "react-router-dom";

const Settlement = () => {
  const [settlements, setSettlements] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const fetchSettlements = async () => {
    try {
      const response = await getsettlements();

      if (response.success) {
        setSettlements(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch settlements:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettlements();
  }, []);

  const handleGenerate = async () => {
    try {
      setGenerating(true);

      const response = await generateSettlement();

      if (response.success) {
        alert(response.message || "Settlement generated successfully.");
        fetchSettlements();
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to generate settlement.");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading settlements...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settlements</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage weekly kitchen settlements.
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="rounded-lg bg-[#2CD377] px-5 py-3 font-semibold text-white transition hover:bg-[#22b864] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {generating ? "Generating..." : "Generate Settlement"}
        </button>
      </div>

      {/* Empty State */}
      {settlements.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <p className="text-lg font-medium text-gray-700">
            No settlements found
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Click <strong>Generate Settlement</strong> to create this week's
            settlement.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Week
                  </th>

                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Orders
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Kitchen Payable
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Paid
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Balance
                  </th>

                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {settlements.map((settlement) => (
                  <tr key={settlement.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {settlement.week_start}
                      </div>

                      <div className="text-sm text-gray-500">
                        to {settlement.week_end}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      {settlement.total_orders}
                    </td>

                    <td className="px-6 py-4 text-right font-semibold">
                      ₹{settlement.kitchen_payable}
                    </td>

                    <td className="px-6 py-4 text-right">
                      ₹{settlement.paid_amount}
                    </td>

                    <td className="px-6 py-4 text-right">
                      ₹{settlement.balance_amount}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          settlement.status === "paid"
                            ? "bg-green-100 text-green-700"
                            : settlement.status === "partial"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {settlement.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() =>
                          navigate(`/settlements/${settlement.id}`)
                        }
                        className="cursor-pointer font-medium text-[#2CD377] hover:underline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settlement;