import { useEffect, useState } from "react";
import { getCustomers } from "../../services/dashboardServices";

const CopyPhone = ({ phone }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={copy} className="ml-1.5 text-gray-300 hover:text-[#2CD377] transition-colors" title="Copy">
      {copied
        ? <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-[#2CD377]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        : <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
      }
    </button>
  );
};

const statusStyle = (status) => {
  if (status === "active") return "bg-[#2CD377]/10 text-[#2CD377]";
  if (status === "paused") return "bg-yellow-50 text-yellow-600";
  if (status === "expired") return "bg-red-50 text-red-500";
  return "bg-gray-100 text-gray-500";
};

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getCustomers()
      .then((data) => setCustomers(Array.isArray(data.data) ? data.data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter((c) =>
    `${c.name} ${c.phone} ${c.email}`.toLowerCase().includes(search.toLowerCase())
  );

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
          <h1 className="text-xl font-bold text-gray-800">Customers</h1>
          <p className="text-sm text-gray-400 mt-0.5">{customers.length} total customers</p>
        </div>
        <div className="relative w-full sm:w-64">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-[#2CD377] focus:ring-2 focus:ring-[#2CD377]/20 transition placeholder-gray-300"
          />
        </div>
      </div>

      {/* Empty */}
      {filtered.length === 0 && (
        <div className="bg-gray-50 border border-gray-100 rounded-2xl px-6 py-12 text-center">
          <p className="text-gray-400 text-sm font-medium">No customers found</p>
        </div>
      )}

      {filtered.length > 0 && (
        <>
          {/* Mobile cards */}
          <div className="flex flex-col gap-3 sm:hidden">
            {filtered.map((c) => (
              <div key={c.id} className="bg-white border border-gray-100 rounded-2xl px-4 py-4 flex flex-col gap-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-[#2CD377]/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-[#2CD377]">{c.name?.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{c.name}</p>
                      <p className="text-xs font-semibold text-gray-700 flex items-center">{c.phone}<CopyPhone phone={c.phone} /></p>
                    </div>
                  </div>
                  {c.subscription_status && (
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusStyle(c.subscription_status)}`}>
                      {c.subscription_status}
                    </span>
                  )}
                </div>
                {c.email && <p className="text-xs text-gray-400 truncate">{c.email}</p>}
                {(c.plan || c.address) && (
                  <div className="grid grid-cols-2 gap-2">
                    {c.plan && (
                      <div className="bg-gray-50 rounded-xl px-3 py-2">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">Plan</p>
                        <p className="text-xs font-semibold text-gray-700 mt-0.5">{c.plan}</p>
                      </div>
                    )}
                    {c.address && (
                      <div className="bg-gray-50 rounded-xl px-3 py-2">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">Address</p>
                        <p className="text-xs font-semibold text-gray-700 mt-0.5 truncate">{c.address}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Plan</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Address</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, index) => (
                  <tr key={c.id} className={index !== filtered.length - 1 ? "border-b border-gray-50 hover:bg-gray-50/50" : "hover:bg-gray-50/50"}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-7 w-7 rounded-full bg-[#2CD377]/10 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-[#2CD377]">{c.name?.charAt(0).toUpperCase()}</span>
                        </div>
                        <span className="font-medium text-gray-800">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">
                      <span className="flex items-center gap-1">{c.phone}<CopyPhone phone={c.phone} /></span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 truncate max-w-[160px]">{c.email || "—"}</td>
                    <td className="px-5 py-3.5 text-gray-600">{c.plan || "—"}</td>
                    <td className="px-5 py-3.5 text-gray-400 truncate max-w-[180px]">{c.address || "—"}</td>
                    <td className="px-5 py-3.5 text-center">
                      {c.subscription_status ? (
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusStyle(c.subscription_status)}`}>
                          {c.subscription_status}
                        </span>
                      ) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Customers;
