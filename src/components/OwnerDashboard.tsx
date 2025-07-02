import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { vehicleService, Vehicle } from '../services/vehicleService';
import EditProfileModal, { ProfileUpdateData } from './Profile/EditProfileModal';
import SuccessNotification from './Profile/SuccessNotification';
import AddVehicleModal from './AddVehicleModal';
import { 
  Car, 
  MapPin, 
  DollarSign, 
  Users, 
  BarChart3, 
  Settings,
  Bell,
  Plus,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Navigation,
  Fuel,
  Wrench,
  MessageCircle,
  Shield,
  LogOut
} from 'lucide-react';

const OwnerDashboard = () => {
  const { user, logout, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  
  // Firebase vehicle data
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  
  // Subscribe to user's vehicles only when user is authenticated
  useEffect(() => {
    if (!user?.id) {
      console.log('👤 OwnerDashboard: No user authenticated, skipping vehicle subscription');
      setVehicles([]);
      setVehiclesLoading(false);
      return;
    }

    console.log('🏠 OwnerDashboard: Setting up vehicle subscription for owner:', user.id);
    setVehiclesLoading(true);
    
    const unsubscribe = vehicleService.subscribeToOwnerVehicles(user.id, (ownerVehicles) => {
      console.log('🏠 OwnerDashboard: Received vehicles:', ownerVehicles.length);
      setVehicles(ownerVehicles);
      setVehiclesLoading(false);
    });

    return () => {
      console.log('🏠 OwnerDashboard: Cleaning up vehicle subscription');
      unsubscribe();
    };
  }, [user?.id]); // Re-subscribe when user changes
  
  // Handle vehicle addition success
  const handleVehicleAdded = () => {
    console.log('🎉 OwnerDashboard: Vehicle added successfully!');
    setShowSuccessNotification(true);
    // The subscription will automatically update the vehicles list
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleProfileUpdate = async (data: ProfileUpdateData) => {
    try {
      await updateProfile(data);
      console.log('✅ Profile updated successfully');
      setShowSuccessNotification(true);
    } catch (error) {
      console.error('❌ Profile update failed:', error);
      throw error; // Re-throw to let the modal handle the error display
    }
  };



  const recentTransactions = [
    { id: 1, driver: "Sipho Mthembu", amount: 1200, date: "2025-01-13", status: "completed" },
    { id: 2, driver: "Nomsa Dlamini", amount: 1100, date: "2025-01-13", status: "completed" },
    { id: 3, driver: "Thabo Molefe", amount: 1150, date: "2025-01-06", status: "completed" },
    { id: 4, driver: "Sarah Nkomo", amount: 1000, date: "2025-01-06", status: "pending" }
  ];

  const alerts = [
    { id: 1, type: "maintenance", message: "Hyundai Grand i10 (GP 789-012) service due in 2 weeks", priority: "medium" },
    { id: 2, type: "payment", message: "Payment overdue from John Smith - Toyota Corolla", priority: "high" },
    { id: 3, type: "fuel", message: "Low fuel alert - Hyundai Grand i10 (45%)", priority: "low" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-700 bg-clip-text text-transparent">
                FleetLink
              </span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link to="/messages" className="p-2 text-gray-400 hover:text-gray-600 relative">
                <MessageCircle className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></span>
              </Link>
              <Link to="/notifications" className="p-2 text-gray-400 hover:text-gray-600 relative">
                <Bell className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-700 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">{user?.name || 'User'}</span>
                  <span className="text-xs text-gray-500 capitalize">{user?.role} Account</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-8 mb-8 border-b">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'vehicles', label: 'Vehicles', icon: Car },
            { id: 'payments', label: 'Payments', icon: DollarSign },
            { id: 'drivers', label: 'Drivers', icon: Users },
            { id: 'tracking', label: 'Tracking', icon: MapPin },
            { id: 'profile', label: 'Profile', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Vehicles</p>
                    <p className="text-3xl font-bold text-gray-900">24</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Car className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">+2</span>
                  <span className="text-gray-500 ml-1">this month</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Rentals</p>
                    <p className="text-3xl font-bold text-gray-900">21</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-gray-500">87.5% utilization</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                    <p className="text-3xl font-bold text-gray-900">R89,240</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">+12%</span>
                  <span className="text-gray-500 ml-1">vs last month</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                    <p className="text-3xl font-bold text-gray-900">R4,250</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-gray-500">3 overdue payments</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button 
                onClick={() => setActiveTab('vehicles')}
                className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow group w-full text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Car className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Manage Vehicles</h3>
                    <p className="text-sm text-gray-500">View your fleet</p>
                  </div>
                </div>
              </button>

              <Link to="/messages" className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow group">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <MessageCircle className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Messages</h3>
                    <p className="text-sm text-gray-500">Chat with drivers</p>
                  </div>
                </div>
              </Link>

              <button
                onClick={() => setActiveTab('tracking')}
                className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow group w-full text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                    <Shield className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Security & Tracking</h3>
                    <p className="text-sm text-gray-500">Monitor your fleet</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('payments')}
                className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow group w-full text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <BarChart3 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Payments</h3>
                    <p className="text-sm text-gray-500">Manage revenue</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Alerts */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
              </div>
              <div className="p-6 space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      alert.priority === 'high' ? 'bg-red-500' :
                      alert.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                    </div>
                    <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                <button 
                  onClick={() => setActiveTab('payments')}
                  className="text-blue-600 text-sm font-medium hover:text-blue-700"
                >
                  View all
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentTransactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {transaction.driver}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          R{transaction.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            transaction.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {transaction.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Vehicles Tab */}
        {activeTab === 'vehicles' && (
          <div className="space-y-6">
            {/* Header with Actions */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search vehicles..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Filter className="w-4 h-4" />
                  <span>Filter</span>
                </button>
              </div>
              <button 
                onClick={() => setIsAddVehicleOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Vehicle</span>
              </button>
            </div>

            {/* Vehicles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{vehicle.make}</h3>
                        <p className="text-sm text-gray-500">{vehicle.plate}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        vehicle.status === 'available' 
                          ? 'bg-green-100 text-green-800' 
                          : vehicle.status === 'rented'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {vehicle.status}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Applications:</span>
                        <span className="font-medium">{vehicle.applications || 0}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Weekly Rate:</span>
                        <span className="font-medium">R{vehicle.weeklyRate}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Location:</span>
                        <span className="font-medium">{vehicle.location}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <div className="flex items-center space-x-1">
                          <Navigation className="w-3 h-3" />
                          <span>{vehicle.views || 0} views</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>⭐ {vehicle.rating || 'New'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>{vehicle.year}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => setActiveTab('tracking')}
                          className="flex-1 bg-blue-50 text-blue-600 text-center py-2 rounded-lg text-sm font-medium hover:bg-blue-100"
                        >
                          Track
                        </button>
                        <button className="flex-1 bg-gray-50 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-100">
                          Manage
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other tabs content would go here */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Management</h3>
            <div className="space-y-6">
              {/* Payment Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">This Month</h4>
                  <p className="text-2xl font-bold text-green-700">R89,240</p>
                  <p className="text-sm text-green-600">+12% from last month</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-medium text-orange-900 mb-2">Pending</h4>
                  <p className="text-2xl font-bold text-orange-700">R4,250</p>
                  <p className="text-sm text-orange-600">3 overdue payments</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Next Week</h4>
                  <p className="text-2xl font-bold text-blue-700">R18,400</p>
                  <p className="text-sm text-blue-600">15 payments due</p>
                </div>
              </div>
              
              {/* Recent Transactions Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentTransactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {transaction.driver}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          Toyota Corolla Quest
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          R{transaction.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            transaction.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button className="text-blue-600 hover:text-blue-700 font-medium">
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'drivers' && (
          <div className="space-y-6">
            {/* Drivers Header */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Driver Management</h3>
                  <p className="text-sm text-gray-500 mt-1">Manage your driver network and applications</p>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Invite Driver</span>
                </button>
              </div>

              {/* Driver Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-900">Active Drivers</p>
                      <p className="text-2xl font-bold text-blue-700">21</p>
                    </div>
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-900">Applications</p>
                      <p className="text-2xl font-bold text-green-700">8</p>
                    </div>
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-900">Pending Review</p>
                      <p className="text-2xl font-bold text-yellow-700">3</p>
                    </div>
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-900">Avg. Rating</p>
                      <p className="text-2xl font-bold text-purple-700">4.8</p>
                    </div>
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Active Drivers List */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <h4 className="text-lg font-semibold text-gray-900">Active Drivers</h4>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {vehicles.filter(v => v.status === 'rented').map((vehicle) => (
                    <div key={vehicle.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {vehicle.ownerName.split(' ').map((n: string) => n.charAt(0)).join('')}
                          </span>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">{vehicle.ownerName}</h5>
                          <p className="text-sm text-gray-500">Driving {vehicle.make} • {vehicle.plate}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6 text-sm">
                        <div className="text-center">
                          <p className="text-gray-500">Weekly Rate</p>
                          <p className="font-medium">R{vehicle.weeklyRate}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500">Applications</p>
                          <p className="font-medium">{vehicle.applications || 0}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500">Rating</p>
                          <p className="font-medium">4.8 ⭐</p>
                        </div>
                        <div className="flex space-x-2">
                          <button className="bg-blue-50 text-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-100">
                            Contact
                          </button>
                          <button className="bg-gray-50 text-gray-600 px-3 py-1 rounded text-sm hover:bg-gray-100">
                            Profile
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tracking' && (
          <div className="space-y-6">
            {/* Tracking Header */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Fleet Tracking & Security</h3>
                  <p className="text-sm text-gray-500 mt-1">Real-time monitoring of your vehicle fleet</p>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Geo-fence Settings</span>
                </button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-900">Active Vehicles</p>
                      <p className="text-2xl font-bold text-green-700">21</p>
                    </div>
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-900">Parked</p>
                      <p className="text-2xl font-bold text-blue-700">3</p>
                    </div>
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-900">Low Fuel</p>
                      <p className="text-2xl font-bold text-yellow-700">2</p>
                    </div>
                    <Fuel className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-900">Alerts</p>
                      <p className="text-2xl font-bold text-red-700">1</p>
                    </div>
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Tracking List */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <h4 className="text-lg font-semibold text-gray-900">Live Vehicle Status</h4>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${
                          vehicle.status === 'available' ? 'bg-green-500' : 'bg-gray-400'
                        }`}></div>
                        <div>
                          <h5 className="font-medium text-gray-900">{vehicle.make}</h5>
                          <p className="text-sm text-gray-500">{vehicle.plate} • Status: {vehicle.status}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6 text-sm">
                        <div className="text-center">
                          <p className="text-gray-500">Location</p>
                          <p className="font-medium">{vehicle.location}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500">Views</p>
                          <p className="font-medium">{vehicle.views || 0}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500">Rating</p>
                          <p className="font-medium">⭐ {vehicle.rating || 'New'}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button className="bg-blue-50 text-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-100">
                            Track
                          </button>
                          <button className="bg-gray-50 text-gray-600 px-3 py-1 rounded text-sm hover:bg-gray-100">
                            History
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Account Information */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
                <p className="text-sm text-gray-500 mt-1">Manage your personal and business details</p>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-700 rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-gray-900">{user?.name || 'User'}</h4>
                    <p className="text-gray-500 capitalize">{user?.role} Account</p>
                    <div className="flex items-center mt-2">
                      <div className={`w-2 h-2 rounded-full mr-2 ${user?.verified ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                      <span className="text-sm text-gray-600">
                        {user?.verified ? 'Verified Account' : 'Pending Verification'}
                      </span>
                    </div>
                  </div>
                                     <button 
                     onClick={() => setIsEditProfileOpen(true)}
                     className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                   >
                     Edit Profile
                   </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <span className="text-gray-900">{user?.name || 'Not provided'}</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <span className="text-gray-900">{user?.email || 'Not provided'}</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <span className="text-gray-900">{user?.phone || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <span className="text-gray-900 capitalize">{user?.role} Account</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <span className="text-gray-900">
                          {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-ZA', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 'Not available'}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Account ID</label>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <span className="text-gray-900 font-mono text-sm">{user?.id || 'Not available'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Settings className="w-5 h-5 text-gray-500" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">Account Settings</div>
                      <div className="text-sm text-gray-500">Privacy & preferences</div>
                    </div>
                  </button>
                  
                  <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Shield className="w-5 h-5 text-gray-500" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">Security</div>
                      <div className="text-sm text-gray-500">Password & 2FA</div>
                    </div>
                  </button>
                  
                  <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Bell className="w-5 h-5 text-gray-500" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">Notifications</div>
                      <div className="text-sm text-gray-500">Alert preferences</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        onSave={handleProfileUpdate}
      />

      {/* Add Vehicle Modal */}
      <AddVehicleModal
        isOpen={isAddVehicleOpen}
        onClose={() => setIsAddVehicleOpen(false)}
        onSuccess={handleVehicleAdded}
      />

      {/* Success Notification */}
      <SuccessNotification
        isVisible={showSuccessNotification}
        message="Your profile has been updated successfully!"
        onClose={() => setShowSuccessNotification(false)}
      />
    </div>
  );
};

export default OwnerDashboard;