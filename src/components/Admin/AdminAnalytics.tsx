import React, { useState, useEffect } from 'react';
import { adminService, type AdminAnalytics } from '../../services/adminService';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Car, 
  DollarSign,
  Calendar,
  MapPin,
  RefreshCw
} from 'lucide-react';

const AdminAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    loadAnalytics();
  }, [timeframe]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const analyticsData = await adminService.getAnalytics(timeframe);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for demo purposes since analytics aren't implemented yet
  const mockData = {
    userGrowth: [
      { date: '2025-01-01', count: 45 },
      { date: '2025-01-08', count: 52 },
      { date: '2025-01-15', count: 61 },
      { date: '2025-01-22', count: 73 },
    ],
    vehicleGrowth: [
      { date: '2025-01-01', count: 12 },
      { date: '2025-01-08', count: 18 },
      { date: '2025-01-15', count: 24 },
      { date: '2025-01-22', count: 31 },
    ],
    topLocations: [
      { location: 'Downtown', count: 25 },
      { location: 'Airport', count: 18 },
      { location: 'University District', count: 15 },
      { location: 'Business Center', count: 12 },
      { location: 'Suburbs', count: 8 },
    ],
    popularVehicles: [
      { make: 'Toyota', count: 15 },
      { make: 'Honda', count: 12 },
      { make: 'Ford', count: 8 },
      { make: 'BMW', count: 6 },
      { make: 'Mercedes', count: 4 },
    ]
  };

  const MetricCard: React.FC<{
    title: string;
    value: string;
    change: string;
    changeType: 'positive' | 'negative' | 'neutral';
    icon: React.ElementType;
    color: string;
  }> = ({ title, value, change, changeType, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <p className={`text-sm ${
            changeType === 'positive' ? 'text-green-600' : 
            changeType === 'negative' ? 'text-red-600' : 
            'text-gray-600'
          }`}>
            {change}
          </p>
        </div>
      </div>
    </div>
  );

  const SimpleChart: React.FC<{
    title: string;
    data: { date: string; count: number }[];
    color: string;
  }> = ({ title, data, color }) => {
    const maxValue = Math.max(...data.map(d => d.count));
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{new Date(item.date).toLocaleDateString()}</span>
              <div className="flex items-center flex-1 ml-4">
                <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className={`h-2 rounded-full ${color}`}
                    style={{ width: `${(item.count / maxValue) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 w-8">{item.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const TopListCard: React.FC<{
    title: string;
    data: { [key: string]: string | number; count: number }[];
    labelKey: string;
    icon: React.ElementType;
  }> = ({ title, data, labelKey, icon: Icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Icon className="w-5 h-5 mr-2 text-gray-600" />
        {title}
      </h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                {index + 1}
              </span>
              <span className="text-sm font-medium text-gray-900">{item[labelKey]}</span>
            </div>
            <span className="text-sm text-gray-600">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 mx-auto animate-spin mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Insights</h1>
          <p className="text-gray-600 mt-1">Platform performance and user behavior analysis</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as '7d' | '30d' | '90d' | '1y')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button
            onClick={loadAnalytics}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value="$24,580"
          change="+12.5% vs last period"
          changeType="positive"
          icon={DollarSign}
          color="bg-green-500"
        />
        <MetricCard
          title="Active Users"
          value="342"
          change="+8.2% vs last period"
          changeType="positive"
          icon={Users}
          color="bg-blue-500"
        />
        <MetricCard
          title="Vehicle Utilization"
          value="78%"
          change="+3.1% vs last period"
          changeType="positive"
          icon={Car}
          color="bg-purple-500"
        />
        <MetricCard
          title="Avg. Booking Value"
          value="$186"
          change="-2.4% vs last period"
          changeType="negative"
          icon={TrendingUp}
          color="bg-orange-500"
        />
      </div>

      {/* Growth Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleChart
          title="User Growth"
          data={mockData.userGrowth}
          color="bg-blue-500"
        />
        <SimpleChart
          title="Vehicle Growth"
          data={mockData.vehicleGrowth}
          color="bg-green-500"
        />
      </div>

      {/* Top Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopListCard
          title="Top Locations"
          data={mockData.topLocations}
          labelKey="location"
          icon={MapPin}
        />
        <TopListCard
          title="Popular Vehicle Makes"
          data={mockData.popularVehicles}
          labelKey="make"
          icon={Car}
        />
      </div>

      {/* Additional Insights */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">2.4</div>
            <div className="text-sm text-gray-600">Avg. Bookings per User</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">4.2</div>
            <div className="text-sm text-gray-600">Avg. Rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">72h</div>
            <div className="text-sm text-gray-600">Avg. Booking Duration</div>
          </div>
        </div>
      </div>

      {/* Performance Indicators */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Indicators</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Customer Acquisition</span>
            <div className="flex items-center">
              <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
              <span className="text-sm text-gray-600">75%</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">User Retention</span>
            <div className="flex items-center">
              <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '68%' }}></div>
              </div>
              <span className="text-sm text-gray-600">68%</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Platform Health</span>
            <div className="flex items-center">
              <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
              <span className="text-sm text-gray-600">92%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics; 