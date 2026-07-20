import StatsCards from "../../components/dashboard/statsCard";

const Dashboard = () => {
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-0.5">{today}</p>
      </div>
      <StatsCards />
    </div>
  );
};

export default Dashboard;
