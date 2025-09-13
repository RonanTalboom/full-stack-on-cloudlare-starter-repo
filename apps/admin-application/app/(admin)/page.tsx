'use client';

import { trpc } from '@/lib/trpc/client';
import { Users, Link, MousePointerClick, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const { data: systemStats, isLoading: statsLoading } = trpc.system.stats.useQuery();
  const { data: analytics, isLoading: analyticsLoading } = trpc.analytics.overview.useQuery();

  if (statsLoading || analyticsLoading) {
    return (
      <div className="animate-pulse">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Users',
      value: systemStats?.users || 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      name: 'Total Links',
      value: systemStats?.links || 0,
      icon: Link,
      color: 'bg-green-500',
    },
    {
      name: 'Total Clicks',
      value: systemStats?.clicks || 0,
      icon: MousePointerClick,
      color: 'bg-purple-500',
    },
    {
      name: 'Active Links',
      value: analytics?.activeLinks || 0,
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 mt-2">
                    {stat.value.toLocaleString()}
                  </p>
                </div>
                <div className={`${stat.color} rounded-lg p-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">System Health</h2>
          <HealthCheck />
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
              View All Users
            </button>
            <button className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
              Manage Links
            </button>
            <button className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
              View Analytics Report
            </button>
            <button className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
              System Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function HealthCheck() {
  const { data: health, isLoading } = trpc.system.health.useQuery();

  if (isLoading) {
    return <div className="text-gray-500">Checking system health...</div>;
  }

  const statusColor = health?.status === 'healthy' ? 'text-green-600' : 'text-red-600';

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="text-gray-600">API Status:</span>
        <span className={statusColor}>{health?.status || 'Unknown'}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Database:</span>
        <span className={health?.database === 'connected' ? 'text-green-600' : 'text-red-600'}>
          {health?.database || 'Unknown'}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Backend Service:</span>
        <span className={health?.backend === 'healthy' ? 'text-green-600' : 'text-yellow-600'}>
          {health?.backend || 'Unknown'}
        </span>
      </div>
    </div>
  );
}