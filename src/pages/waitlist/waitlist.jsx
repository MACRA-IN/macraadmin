import { useEffect, useRef, useState } from "react";
import { getWaitlistAreas } from "../../services/waitlistServices";

const AUTO_REFRESH_MS = 30000;

const MapPinIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const RefreshIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.836 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const CloseIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const UserIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const extractAreas = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const SkeletonCard = () => (
  <div className="rounded-xl p-4 bg-gray-100 animate-pulse h-[124px] flex flex-col items-center justify-center gap-2">
    <div className="h-4 w-4 rounded-full bg-gray-200" />
    <div className="h-3 w-16 rounded bg-gray-200" />
    <div className="h-6 w-8 rounded bg-gray-200" />
    <div className="h-2 w-10 rounded bg-gray-200" />
  </div>
);

const AreaCard = ({ area, onClick }) => (
  <button
    onClick={onClick}
    className={`rounded-xl p-4 text-center flex flex-col items-center transition-transform duration-150 hover:scale-[1.02] cursor-pointer ${
      area.ready ? "bg-[#2CD377] text-white" : "bg-[#E7ECE8] text-gray-800"
    }`}
  >
    <MapPinIcon className="h-4 w-4 mb-2" />
    <p className="text-[14px] font-bold leading-tight line-clamp-2">{area.area_name}</p>
    <p className="text-[32px] font-bold leading-tight mt-1">{area.count}</p>
    <span className="text-[12px] opacity-80 mt-1">{area.ready ? "Ready" : "Growing"}</span>
  </button>
);

const PeopleModal = ({ area, onClose }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-"
    onClick={onClose}
  >
    <div
      className="bg-white rounded-2xl shadow-lg w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <p className="text-sm font-bold text-gray-800">{area.area_name}</p>
          <p className="text-xs text-gray-400 mt-0.5">{area.count} on waitlist</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
          <CloseIcon className="h-5 w-5" />
        </button>
      </div>
      <div className="overflow-y-auto px-5 py-3 flex flex-col gap-2">
        {(area.people || []).length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6">No people found for this area.</p>
        )}
        {(area.people || []).map((p, i) => (
          <div key={p.id ?? i} className="flex items-center gap-3 border border-gray-100 rounded-xl px-3 py-2.5">
            <div className="h-8 w-8 rounded-full bg-[#2CD377]/10 flex items-center justify-center shrink-0">
              <UserIcon className="h-4 w-4 text-[#2CD377]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {p.name || p.full_name || `Person #${p.id ?? i + 1}`}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {p.phone || p.email || ""}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Waitlist = () => {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [selectedArea, setSelectedArea] = useState(null);
  const hasLoadedOnce = useRef(false);

  const fetchAreas = async () => {
    if (hasLoadedOnce.current) setRefreshing(true);
    try {
      const data = await getWaitlistAreas();
      setAreas(extractAreas(data));
      setError("");
      if (hasLoadedOnce.current) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      setError(err.message || "Failed to load waitlist data");
    } finally {
      setLoading(false);
      setRefreshing(false);
      hasLoadedOnce.current = true;
    }
  };

  useEffect(() => {
    fetchAreas();
    const interval = setInterval(fetchAreas, AUTO_REFRESH_MS);
    return () => clearInterval(interval);
  }, []);

  const totalPeople = areas.reduce((sum, a) => sum + (a.count || 0), 0);
  const readyCount = areas.filter((a) => a.ready).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">Waitlist by Area</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {areas.length > 0
              ? `${areas.length} areas • ${totalPeople} waiting • ${readyCount} ready`
              : "Track waitlist demand by area"}
          </p>
        </div>
        <button
          onClick={fetchAreas}
          disabled={loading || refreshing}
          className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer w-full sm:w-auto"
        >
          <RefreshIcon className={`h-4 w-4 ${loading || refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Loading (initial) */}
      {loading && (
        <>
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin h-8 w-8 rounded-full border-4 border-[#2CD377] border-t-transparent" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl px-6 py-12 text-center flex flex-col items-center gap-3">
          <p className="text-red-500 text-sm font-medium">Failed to load waitlist data</p>
          <button
            onClick={fetchAreas}
            className="px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600 transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && areas.length === 0 && (
        <div className="bg-gray-50 border border-gray-100 rounded-2xl px-6 py-12 text-center">
          <MapPinIcon className="h-6 w-6 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-400 text-sm font-medium">No one on waitlist yet</p>
        </div>
      )}

      {/* Grid */}
      {!loading && !error && areas.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {areas.map((area) => (
            <AreaCard key={area.area_name} area={area} onClick={() => setSelectedArea(area)} />
          ))}
        </div>
      )}

      {selectedArea && <PeopleModal area={selectedArea} onClose={() => setSelectedArea(null)} />}
    </div>
  );
};

export default Waitlist;
