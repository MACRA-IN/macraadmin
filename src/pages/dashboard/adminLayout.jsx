import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import MacraLogo from "../../assets/logo/Macra.png";

const getAdminFromToken = () => {
  try {
    const token = localStorage.getItem("adminToken");
    if (!token) return null;
    const decoded = jwtDecode(token);
    return {
      name: decoded.name || decoded.username || decoded.sub || "Admin",
      email: decoded.email || "",
    };
  } catch {
    return null;
  }
};

const HomeIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.75}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
  </svg>
);
const SettlementIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.75}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 14h6m-6-4h6m-7 9l-2-1-2 1V5a2 2 0 012-2h12a2 2 0 012 2v14l-2-1-2 1-2-1-2 1-2-1-2 1z"
    />
  </svg>
);
const KitchenIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.75}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
    />
  </svg>
);

const LogoutIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.75}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
    />
  </svg>
);

const SideNavLink = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
        isActive
          ? "bg-[#2CD377]/10 text-[#2CD377]"
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
      }`
    }
  >
    {({ isActive }) => (
      <>
        <Icon
          className={`h-4 w-4 shrink-0 transition-colors duration-150 ${isActive ? "text-[#2CD377]" : "text-gray-400 group-hover:text-gray-600"}`}
        />
        <span className="tracking-tight">{label}</span>
      </>
    )}
  </NavLink>
);

const BottomNavLink = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `group flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-150 ${
        isActive ? "text-[#2CD377]" : "text-gray-400"
      }`
    }
  >
    {({ isActive }) => (
      <>
        <div
          className={`p-1.5 rounded-lg transition-all duration-150 ${isActive ? "bg-[#2CD377]/10" : "group-active:bg-gray-100"}`}
        >
          <Icon
            className={`h-5 w-5 transition-colors duration-150 ${isActive ? "text-[#2CD377]" : "text-gray-400"}`}
          />
        </div>
        <span
          className={`text-[10px] font-semibold tracking-tight transition-colors duration-150 ${isActive ? "text-[#2CD377]" : "text-gray-400"}`}
        >
          {label}
        </span>
      </>
    )}
  </NavLink>
);

const AdminLayout = () => {
  const navigate = useNavigate();
  const admin = getAdminFromToken();

  const initials = admin?.name
    ? admin.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "A";

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-100 flex-col fixed top-0 left-0 h-full z-30">
        {/* Brand */}
        <div className="px-5 pt-6 pb-5 border-b border-gray-100">
          <img src={MacraLogo} alt="Macra" className="h-7 w-auto" />
          <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mt-2 ml-0.5">
            Admin Panel
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-300 px-3 mb-2">
            Menu
          </p>
          <SideNavLink to="/dashboard" icon={HomeIcon} label="Dashboard" />
          <SideNavLink
            to="/kitchen-orders"
            icon={KitchenIcon}
            label="Kitchen Orders"
          />
          <SideNavLink
            to="/settlement"
            icon={SettlementIcon}
            label="settlements"
          />
        </nav>

        {/* Admin profile + logout */}
        <div className="px-3 pb-4 pt-3 border-t border-gray-100 flex flex-col gap-1">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
            <div className="h-7 w-7 rounded-full bg-[#2CD377]/15 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-bold text-[#2CD377] tracking-tight">
                {initials}
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-gray-800 tracking-tight leading-tight truncate">
                {admin?.name || "Admin"}
              </span>
              {admin?.email && (
                <span className="text-[10px] text-gray-400 truncate leading-tight mt-0.5">
                  {admin.email}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all duration-150 w-full cursor-pointer"
          >
            <LogoutIcon className="h-4 w-4 shrink-0 text-gray-400 group-hover:text-red-400 transition-colors duration-150" />
            <span className="tracking-tight">Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile top header ── */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 z-30">
        <img src={MacraLogo} alt="Macra" className="h-6 w-auto" />
        <div className="h-7 w-7 rounded-full bg-[#2CD377]/15 flex items-center justify-center">
          <span className="text-[10px] font-bold text-[#2CD377] tracking-tight">
            {initials}
          </span>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1 md:ml-64 pt-14 pb-16 md:pt-0 md:pb-0">
        <Outlet />
      </main>

      {/* ── Mobile sticky bottom nav ── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 z-50">
        <div className="flex items-stretch h-16">
          <BottomNavLink to="/dashboard" icon={HomeIcon} label="Dashboard" />
          <BottomNavLink
            to="/kitchen-orders"
            icon={KitchenIcon}
            label="Orders"
          />
          <BottomNavLink
            to="/settlement"
            icon={SettlementIcon}
            label="settlements"
          />

          <button
            onClick={handleLogout}
            className="group flex-1 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-150"
          >
            <div className="p-1.5 rounded-lg group-active:bg-red-50 transition-all duration-150">
              <LogoutIcon className="h-5 w-5 text-gray-400 group-hover:text-red-500 group-active:text-red-500 transition-colors duration-150" />
            </div>
            <span className="text-[10px] font-semibold text-gray-400 group-hover:text-red-500 group-active:text-red-500 tracking-tight transition-colors duration-150">
              Logout
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default AdminLayout;
