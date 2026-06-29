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
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const LogoutIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const AdminLayout = () => {
  const navigate = useNavigate();
  const admin = getAdminFromToken();

  const initials = admin?.name
    ? admin.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "A";

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col fixed top-0 left-0 h-full">

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
          <NavLink
            to="/dashboard"
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
                <HomeIcon className={`h-4 w-4 shrink-0 transition-colors duration-150 ${isActive ? "text-[#2CD377]" : "text-gray-400 group-hover:text-gray-600"}`} />
                <span className="tracking-tight">Dashboard</span>
              </>
            )}
          </NavLink>
        </nav>

        {/* Admin profile + logout */}
        <div className="px-3 pb-4 pt-3 border-t border-gray-100 flex flex-col gap-1">
          {/* Profile row */}
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
            <div className="h-7 w-7 rounded-full bg-[#2CD377]/15 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-bold text-[#2CD377] tracking-tight">{initials}</span>
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

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all duration-150 w-full cursor-pointer"
          >
            <LogoutIcon className="h-4 w-4 shrink-0 text-gray-400 group-hover:text-red-400 transition-colors duration-150" />
            <span className="tracking-tight">Logout</span>
          </button>
        </div>

      </aside>

      {/* Main content */}
      <main className="ml-64 flex-1 min-h-screen">
        <Outlet />
      </main>

    </div>
  );
};

export default AdminLayout;
