import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { adminService, type AdminStats } from '../../services/adminService';
import { 
  Users, 
  Car, 
  FileText, 
  MessageSquare, 
  AlertTriangle, 
  BarChart3, 
  Settings, 
  Shield,
  TrendingUp,
  UserCheck,
  Clock,
  DollarSign,
  Eye,
  Search,
  Bell,
  RefreshCw,
  LogOut
} from 'lucide-react';
import AdminUsers from './AdminUsers';
import AdminVehicles from './AdminVehicles';
import AdminApplications from './AdminApplications';
import AdminReports from './AdminReports';
import AdminAnalytics from './AdminAnalytics';
import AdminSettings from './AdminSettings';

type AdminSection = 
  | 'dashboard' 
  | 'users' 
  | 'vehicles' 
  | 'applications' 
  | 'reports' 
  | 'analytics' 
  | 'settings';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const dashboardStats = await adminService.getDashboardStats();
      setStats(dashboardStats);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardStats();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Verify user is admin
  if (!user || (user.role !== 'admin' && !user.isAdmin)) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, count: null },
    { id: 'users', label: 'Users', icon: Users, count: stats?.totalUsers },
    { id: 'vehicles', label: 'Vehicles', icon: Car, count: stats?.totalVehicles },
    { id: 'applications', label: 'Applications', icon: FileText, count: stats?.pendingApplications },
    { id: 'reports', label: 'Reports', icon: AlertTriangle, count: null },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, count: null },
    { id: 'settings', label: 'Settings', icon: Settings, count: null },
  ];

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ElementType;
    color: string;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
  }> = ({ title, value, icon: Icon, color, change, changeType = 'neutral' }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
          {change && (
            <p className={`text-sm ${
              changeType === 'positive' ? 'text-green-600' : 
              changeType === 'negative' ? 'text-red-600' : 
              'text-gray-600'
            }`}>
              {change}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderDashboardOverview = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of FleetLink platform metrics</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={Users}
          color="bg-blue-500"
          change={`+${stats?.recentSignups || 0} this week`}
          changeType="positive"
        />
        <StatCard
          title="Total Vehicles"
          value={stats?.totalVehicles || 0}
          icon={Car}
          color="bg-green-500"
        />
        <StatCard
          title="Pending Applications"
          value={stats?.pendingApplications || 0}
          icon={Clock}
          color="bg-yellow-500"
        />
        <StatCard
          title="Revenue (Month)"
          value={stats?.revenueThisMonth || 0}
          icon={DollarSign}
          color="bg-purple-500"
          change="+12.5%"
          changeType="positive"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Verified Users"
          value={stats?.verifiedUsers || 0}
          icon={UserCheck}
          color="bg-emerald-500"
        />
        <StatCard
          title="Total Messages"
          value={stats?.totalMessages || 0}
          icon={MessageSquare}
          color="bg-indigo-500"
        />
        <StatCard
          title="Active Conversations"
          value={stats?.totalConversations || 0}
          icon={Eye}
          color="bg-cyan-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveSection('users')}
            className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Users className="w-8 h-8 text-blue-600 mr-3" />
            <div className="text-left">
              <p className="font-semibold text-gray-900">Manage Users</p>
              <p className="text-sm text-gray-600">View and moderate user accounts</p>
            </div>
          </button>
          <button
            onClick={() => setActiveSection('applications')}
            className="flex items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
          >
            <FileText className="w-8 h-8 text-yellow-600 mr-3" />
            <div className="text-left">
              <p className="font-semibold text-gray-900">Review Applications</p>
              <p className="text-sm text-gray-600">Approve or reject rental requests</p>
            </div>
          </button>
          <button
            onClick={() => setActiveSection('reports')}
            className="flex items-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <AlertTriangle className="w-8 h-8 text-red-600 mr-3" />
            <div className="text-left">
              <p className="font-semibold text-gray-900">Handle Reports</p>
              <p className="text-sm text-gray-600">Review user reports and issues</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <Users className="w-5 h-5 text-blue-600 mr-3" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">New user registered</p>
              <p className="text-xs text-gray-600">2 minutes ago</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <Car className="w-5 h-5 text-green-600 mr-3" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Vehicle listing approved</p>
              <p className="text-xs text-gray-600">15 minutes ago</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <FileText className="w-5 h-5 text-yellow-600 mr-3" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Application submitted</p>
              <p className="text-xs text-gray-600">1 hour ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-blue-600 mx-auto animate-spin mb-4" />
            <p className="text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
      );
    }

    switch (activeSection) {
      case 'dashboard':
        return renderDashboardOverview();
      case 'users':
        return <AdminUsers />;
      case 'vehicles':
        return <AdminVehicles />;
      case 'applications':
        return <AdminApplications />;
      case 'reports':
        return <AdminReports />;
      case 'analytics':
        return <AdminAnalytics />;
      case 'settings':
        return <AdminSettings />;
      default:
        return renderDashboardOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-sm text-gray-600">FleetLink</p>
            </div>
          </div>
        </div>

        <nav className="mt-6">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as AdminSection)}
                className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 transition-colors ${
                  isActive ? 'bg-blue-50 border-r-2 border-blue-600 text-blue-600' : 'text-gray-700'
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                <span className="flex-1">{item.label}</span>
                {item.count !== null && (
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Admin Info */}
        <div className="absolute bottom-0 w-64 p-6 border-t border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {user?.name?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user?.name || 'Administrator'}</p>
                <p className="text-xs text-gray-600">Admin User</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;