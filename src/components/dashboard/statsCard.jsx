import { useState, useEffect } from "react";
import { getStats } from "../../services/dashboardServices";

const StatsCards = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await getStats();
      setStats(data);
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    {
      title: "Subscriptions",
      cards: [
        { label: "Total", value: stats?.subscriptions.total, color: "text-blue-500", bg: "bg-blue-50",
          icon: <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />,
        },
        { label: "Active", value: stats?.subscriptions.active, color: "text-[#2CD377]", bg: "bg-[#2CD377]/10",
          icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
        },
        { label: "Paused", value: stats?.subscriptions.paused, color: "text-yellow-500", bg: "bg-yellow-50",
          icon: <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
        },
        { label: "Expired", value: stats?.subscriptions.expired, color: "text-red-500", bg: "bg-red-50",
          icon: <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />,
        },
        { label: "New Today", value: stats?.subscriptions.newToday, color: "text-purple-500", bg: "bg-purple-50",
          icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />,
        },
      ],
    },
    {
      title: "Orders",
      cards: [
        { label: "Scheduled Today", value: stats?.orders.scheduledToday, color: "text-orange-500", bg: "bg-orange-50",
          icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />,
        },
        { label: "Delivered Today", value: stats?.orders.deliveredToday, color: "text-[#2CD377]", bg: "bg-[#2CD377]/10",
          icon: <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />,
        },
      ],
    },
    {
      title: "Revenue",
      cards: [
        { label: "Today", value: `₹${stats?.revenue.today}`, color: "text-[#2CD377]", bg: "bg-[#2CD377]/10",
          icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
        },
        { label: "Total", value: `₹${stats?.revenue.total}`, color: "text-blue-500", bg: "bg-blue-50",
          icon: <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />,
        },
      ],
    },
    {
      title: "Customers",
      cards: [
        { label: "Total", value: stats?.customers.total, color: "text-blue-500", bg: "bg-blue-50",
          icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />,
        },
        { label: "New Today", value: stats?.customers.newToday, color: "text-purple-500", bg: "bg-purple-50",
          icon: <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />,
        },
      ],
    },
  ];

  const StatCard = ({ card }) => (
    <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 flex flex-col gap-3">
      <div className={`${card.bg} ${card.color} w-9 h-9 rounded-xl flex items-center justify-center`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          {card.icon}
        </svg>
      </div>
      <div>
        {loading ? (
          <div className="h-7 w-12 bg-gray-100 rounded-lg animate-pulse" />
        ) : (
          <p className="text-2xl font-bold text-gray-800">{card.value}</p>
        )}
        <p className="text-xs font-medium text-gray-400 mt-0.5">{card.label}</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {sections.map((section) => (
        <div key={section.title}>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{section.title}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {section.cards.map((card) => (
              <StatCard key={card.label} card={card} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;