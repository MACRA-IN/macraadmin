import { useEffect, useState } from "react";
import {
  generateSettlement,
  getsettlements,
} from "../../services/settlementServices";
import { useNavigate } from "react-router-dom";

const statusStyle = (status) => {
  switch (status) {
    case "paid":
      return "bg-green-100 text-green-700";
    case "partial":
      return "bg-yellow-100 text-yellow-700";
    default:
      return "bg-red-100 text-red-700";
  }
};

const Settlement = () => {
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

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
      <div className="flex justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2CD377] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col p-5 gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settlements</h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage weekly kitchen settlements.
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2CD377] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#23bf69] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {generating ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Generating...
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Generate Settlement
            </>
          )}
        </button>
      </div>

      {settlements.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-20 text-center">
          <h2 className="text-lg font-semibold text-gray-700">
            No settlements found
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Click <strong>Generate Settlement</strong> to create this week's
            settlement.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[950px] w-full">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
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
                {settlements.map((s) => (
                  <tr key={s.id} className="transition hover:bg-gray-50">
                    <td className="px-6 py-5">
                      <div className="font-semibold text-gray-900">
                        {s.week_start}
                      </div>

                      <div className="mt-1 text-sm text-gray-500">
                        to {s.week_end}
                      </div>
                    </td>

                    <td className="px-6 py-5 text-center font-medium text-gray-700">
                      {s.total_orders}
                    </td>

                    <td className="px-6 py-5 text-right font-semibold text-gray-900">
                      ₹{Number(s.kitchen_payable).toFixed(2)}
                    </td>

                    <td className="px-6 py-5 text-right text-gray-700">
                      ₹{Number(s.paid_amount).toFixed(2)}
                    </td>

                    <td className="px-6 py-5 text-right font-semibold text-red-600">
                      ₹{Number(s.balance_amount).toFixed(2)}
                    </td>

                    <td className="px-6 py-5 text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyle(
                          s.status,
                        )}`}
                      >
                        {s.status}
                      </span>
                    </td>

                    <td className="px-6 py-5 text-center">
                      <button
                        onClick={() => navigate(`/settlements/${s.id}`)}
                        className="rounded-lg border border-[#2CD377] px-4 py-2 text-sm font-medium text-[#2CD377] transition hover:bg-[#2CD377] hover:text-white cursor-pointer"
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
