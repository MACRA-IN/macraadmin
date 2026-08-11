import { useEffect, useState } from "react";
import { getLocationChecks } from "../../services/dashboardServices";

const LocationChecks = () => {
  const [checks, setChecks] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getLocationChecks()
      .then((data) => {
        const list = Array.isArray(data) ? data : data.data || [];
        setChecks(list);
        setFiltered(list);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      checks.filter(
        (c) =>
          c.area_name?.toLowerCase().includes(q) ||
          c.city?.toLowerCase().includes(q) ||
          String(c.customer_id).includes(q)
      )
    );
  }, [search, checks]);

  const total = checks.length;
  const within = checks.filter((c) => c.is_within_radius).length;
  const outside = checks.filter((c) => !c.is_within_radius).length;

  if (loading) return <p className="text-sm text-gray-400">Loading...</p>;
  if (error) return <p className="text-sm text-red-500">{error}</p>;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">Location Checks</h1>
        <p className="text-sm text-gray-400 mt-0.5">Customer delivery location verification</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total", value: total, color: "text-gray-800" },
          { label: "Within Radius", value: within, color: "text-[#2CD377]" },
          { label: "Outside Radius", value: outside, color: "text-red-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by area, city or customer ID..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2CD377]/30"
      />

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {filtered.map((c) => (
          <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">{c.area_name}, {c.city}</p>
                <p className="text-xs text-gray-400">Customer #{c.customer_id}</p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                c.is_within_radius ? "bg-[#2CD377]/10 text-[#2CD377]" : "bg-red-50 text-red-500"
              }`}>
                {c.is_within_radius ? "Within" : "Outside"}
              </span>
            </div>
            <div className="flex gap-4 text-xs text-gray-500">
              <span>Road Distance: <span className="font-medium text-gray-700">{c.road_distance_km} km</span></span>
              <span>Radius: <span className="font-medium text-gray-700">{c.delivery_radius_km} km</span></span>
            </div>
            <p className="text-xs text-gray-300">{new Date(c.created_at).toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wider">
              <th className="text-left px-5 py-3">Customer ID</th>
              <th className="text-left px-5 py-3">Area</th>
              <th className="text-left px-5 py-3">City</th>
              <th className="text-left px-5 py-3">Distance</th>
              <th className="text-left px-5 py-3">Radius</th>
              <th className="text-left px-5 py-3">Status</th>
              <th className="text-left px-5 py-3">Checked At</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-3 font-medium text-gray-800">#{c.customer_id}</td>
                <td className="px-5 py-3 text-gray-600">{c.area_name}</td>
                <td className="px-5 py-3 text-gray-600">{c.city}</td>
                <td className="px-5 py-3 text-gray-600">{c.distance_km} km</td>
                <td className="px-5 py-3 text-gray-600">{c.delivery_radius_km} km</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    c.is_within_radius ? "bg-[#2CD377]/10 text-[#2CD377]" : "bg-red-50 text-red-500"
                  }`}>
                    {c.is_within_radius ? "Within" : "Outside"}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-400">{new Date(c.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">No results found.</p>
        )}
      </div>
    </div>
  );
};

export default LocationChecks;
