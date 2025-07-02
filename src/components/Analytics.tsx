import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Car,
  Users,
  BarChart3,
  Activity,
  MapPin
} from 'lucide-react';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('30d');

  const kpiData = {
    totalRevenue: { value: 89240, change: 12.5, trend: 'up' },
    activeVehicles: { value: 24, change: 8.3, trend: 'up' },
    utilization: { value: 87.5, change: -2.1, trend: 'down' },
    avgWeeklyRate: { value: 1150, change: 5.2, trend: 'up' }
  };

  const revenueData = [
    { month: 'Jul', revenue: 65000, vehicles: 18 },
    { month: 'Aug', revenue: 72000, vehicles: 20 },
    { month: 'Sep', revenue: 68000, vehicles: 19 },
    { month: 'Oct', revenue: 78000, vehicles: 22 },
    { month: 'Nov', revenue: 82000, vehicles: 23 },
    { month: 'Dec', revenue: 89240, vehicles: 24 }
  ];

  const vehiclePerformance = [
    { make: 'Toyota Corolla Quest', count: 8, revenue: 28800, utilization: 92 },
    { make: 'Hyundai Grand i10', count: 6, revenue: 19800, utilization: 88 },
    { make: 'Suzuki Swift', count: 5, revenue: 15000, utilization: 85 },
    { make: 'Nissan Almera', count: 3, revenue: 10800, utilization: 80 },
    { make: 'Kia Picanto', count: 2, revenue: 6400, utilization: 75 }
  ];

  const locationData = [
    { city: 'Johannesburg', vehicles: 12, revenue: 43200, percentage: 48 },
    { city: 'Cape Town', vehicles: 7, revenue: 25200, percentage: 28 },
    { city: 'Durban', vehicles: 3, revenue: 10800, percentage: 12 },
    { city: 'Pretoria', vehicles: 2, revenue: 7200, percentage: 8 }
  ];

  const driverMetrics = [
    { name: 'Sipho Mthembu', vehicle: 'Toyota Corolla Quest', revenue: 4800, rating: 4.9, trips: 156 },
    { name: 'Nomsa Dlamini', vehicle: 'Hyundai Grand i10', revenue: 4400, rating: 4.7, trips: 142 },
    { name: 'Ahmed Hassan', vehicle: 'Suzuki Swift', revenue: 4000, rating: 4.8, trips: 138 },
    { name: 'Sarah Nkomo', vehicle: 'Toyota Corolla Quest', revenue: 3800, rating: 4.6, trips: 124 }
  ];

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? 
      <TrendingUp className="w-4 h-4 text-green-500" /> : 
      <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  const getTrendColor = (trend: string) => {
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/owner-dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">Analytics & Reports</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">R{kpiData.totalRevenue.value.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              {getTrendIcon(kpiData.totalRevenue.trend)}
              <span className={`font-medium ml-1 ${getTrendColor(kpiData.totalRevenue.trend)}`}>
                {kpiData.totalRevenue.change}%
              </span>
              <span className="text-gray-500 ml-1">vs last period</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Vehicles</p>
                <p className="text-3xl font-bold text-gray-900">{kpiData.activeVehicles.value}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Car className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              {getTrendIcon(kpiData.activeVehicles.trend)}
              <span className={`font-medium ml-1 ${getTrendColor(kpiData.activeVehicles.trend)}`}>
                {kpiData.activeVehicles.change}%
              </span>
              <span className="text-gray-500 ml-1">vs last period</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Fleet Utilization</p>
                <p className="text-3xl font-bold text-gray-900">{kpiData.utilization.value}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              {getTrendIcon(kpiData.utilization.trend)}
              <span className={`font-medium ml-1 ${getTrendColor(kpiData.utilization.trend)}`}>
                {Math.abs(kpiData.utilization.change)}%
              </span>
              <span className="text-gray-500 ml-1">vs last period</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Weekly Rate</p>
                <p className="text-3xl font-bold text-gray-900">R{kpiData.avgWeeklyRate.value}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              {getTrendIcon(kpiData.avgWeeklyRate.trend)}
              <span className={`font-medium ml-1 ${getTrendColor(kpiData.avgWeeklyRate.trend)}`}>
                {kpiData.avgWeeklyRate.change}%
              </span>
              <span className="text-gray-500 ml-1">vs last period</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
            </div>
            <div className="p-6">
              <div className="h-64 flex items-end justify-between space-x-2">
                {revenueData.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-blue-500 rounded-t-lg mb-2 relative group cursor-pointer hover:bg-blue-600 transition-colors"
                      style={{ height: `${(data.revenue / 90000) * 200}px` }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        R{data.revenue.toLocaleString()}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{data.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Vehicle Performance */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Vehicle Performance</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {vehiclePerformance.map((vehicle, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{vehicle.make}</span>
                        
                        <span className="text-sm text-gray-500">{vehicle.count} vehicles</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>R{vehicle.revenue.toLocaleString()}</span>
                        <span>{vehicle.utilization}% utilization</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${vehicle.utilization}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Location Distribution */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Revenue by Location</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {locationData.map((location, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <div>
                        <span className="text-sm font-medium text-gray-900">{location.city}</span>
                        <p className="text-xs text-gray-500">{location.vehicles} vehicles</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-gray-900">R{location.revenue.toLocaleString()}</span>
                      <p className="text-xs text-gray-500">{location.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Drivers */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Top Performing Drivers</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {driverMetrics.map((driver, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-900">{driver.name}</span>
                        <p className="text-xs text-gray-500">{driver.vehicle}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-gray-900">R{driver.revenue.toLocaleString()}</span>
                      <p className="text-xs text-gray-500">{driver.rating}★ • {driver.trips} trips</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;