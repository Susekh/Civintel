"use client";
import React, { useEffect, useState } from "react";
import {
  User,
  MapPin,
  TrendingUp,
  Zap,
  BarChart3,
  LineChart as LineChartIcon,
} from "lucide-react";
import StatCard from "@/components/StatCard";
import AnalyticsChart from "@/components/ui/AnalyticsChart";
import MostSavedSpots from "@/components/MostSavedSpots";

interface UserSession {
  user: { id: string; email: string; name?: string };
}

interface AnalyticsData {
  users: {
    total: number;
    newLast1Month: number;
    newLast3Months: number;
    newLast6Months: number;
  };
  spots: {
    total: number;
    createdLast1Month: number;
    createdLast3Months: number;
    createdLast6Months: number;
  };
}

interface AdminClientPageProps {
  session: UserSession;
}

const AdminClientPage: React.FC<AdminClientPageProps> = ({ session }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"users" | "spots">("users");

  const user = session.user;

  useEffect(() => {
    const fetchAnalytics = async (): Promise<void> => {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/analytics`);
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const data: AnalyticsData = await res.json();
        setAnalyticsData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-green-500 border-t-transparent rounded-full mb-3" />
        <p className="text-neutral-400">Loading analytics...</p>
      </div>
    );

  if (error || !analyticsData)
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-xl font-semibold mb-1 text-red-500">
          Error Loading Dashboard
        </h1>
        <p className="text-neutral-400">{error ?? "No data available."}</p>
      </div>
    );

  const { users, spots } = analyticsData;

  const chartData = [
    {
      name: "1 Month",
      users: users.newLast1Month,
      spots: spots.createdLast1Month,
    },
    {
      name: "3 Months",
      users: users.newLast3Months,
      spots: spots.createdLast3Months,
    },
    {
      name: "6 Months",
      users: users.newLast6Months,
      spots: spots.createdLast6Months,
    },
  ];

  const userStats = [
    {
      title: "Total Registered Users",
      value: users.total,
      icon: User,
      color: "text-green-500",
    },
    {
      title: "New Users (1M)",
      value: users.newLast1Month,
      icon: TrendingUp,
      color: "text-emerald-400",
    },
    {
      title: "New Users (3M)",
      value: users.newLast3Months,
      icon: TrendingUp,
      color: "text-emerald-500",
    },
    {
      title: "New Users (6M)",
      value: users.newLast6Months,
      icon: TrendingUp,
      color: "text-emerald-600",
    },
  ];

  const spotStats = [
    {
      title: "Total Spots",
      value: spots.total,
      icon: MapPin,
      color: "text-indigo-500",
    },
    {
      title: "New Spots (1M)",
      value: spots.createdLast1Month,
      icon: Zap,
      color: "text-sky-400",
    },
    {
      title: "New Spots (3M)",
      value: spots.createdLast3Months,
      icon: Zap,
      color: "text-sky-500",
    },
    {
      title: "New Spots (6M)",
      value: spots.createdLast6Months,
      icon: Zap,
      color: "text-sky-600",
    },
  ];

  return (
    <div className="min-h-screen text-white font-sans bg-black">
      <div className="max-w-6xl mx-auto p-4">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-neutral-800 pb-3">
          <h1 className="text-2xl font-bold text-gray-200">Admin Analytics</h1>
          <div className="flex items-center gap-2 mt-2 sm:mt-0 text-sm text-neutral-300 font-mono">
            <User className="w-4 h-4 text-green-400" /> {user.email}
          </div>
        </header>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: "users", label: "User Analytics", color: "bg-green-600" },
            { key: "spots", label: "Spot Analytics", color: "bg-indigo-600" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as "users" | "spots")}
              className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                activeTab === tab.key
                  ? `${tab.color} text-white`
                  : "bg-neutral-900 text-neutral-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "users" ? (
          <>
            {/* Chart first */}
            <AnalyticsChart
              type="line"
              data={chartData}
              dataKey="users"
              color="#22c55e"
              title="User Growth Trend"
              icon={<LineChartIcon className="w-4 h-4 text-green-500" />}
            />

            {/* Stats below */}
            <h2 className="text-lg font-semibold mt-8 mb-3 text-neutral-200 border-l-4 border-green-500 pl-2">
              User Growth Overview
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {userStats.map((stat, i) => (
                <StatCard key={i} {...stat} />
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Chart first */}
            <AnalyticsChart
              type="bar"
              data={chartData}
              dataKey="spots"
              color="#6366f1"
              title="Spot Creation Trend"
              icon={<BarChart3 className="w-4 h-4 text-indigo-500" />}
            />

            {/* Stats below */}
            <h2 className="text-lg font-semibold mt-8 mb-3 text-neutral-200 border-l-4 border-indigo-500 pl-2">
              Spot Creation Overview
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {spotStats.map((stat, i) => (
                <StatCard key={i} {...stat} />
              ))}
            </div>
          </>
        )}
        {/* Most Saved Spots Section */}
        <div className="mt-10 border-t border-neutral-800 pt-6">
          <h2 className="text-lg font-semibold mb-4 text-neutral-200 border-l-4 border-amber-500 pl-2">
            Most Saved Spots
          </h2>
          <div className="flex justify-center">
            <MostSavedSpots />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminClientPage;
