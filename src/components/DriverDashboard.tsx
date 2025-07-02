import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { vehicleService, Vehicle } from '../services/vehicleService';
import EditProfileModal, { ProfileUpdateData } from './Profile/EditProfileModal';
import SuccessNotification from './Profile/SuccessNotification';
import { 
  Car, 
  DollarSign, 
  MapPin,
  Clock,
  Star,
  TrendingUp,
  Bell,
  FileText,
  Settings,
  Search,
  Filter,
  MessageCircle,
  LogOut,
  CheckCircle
} from 'lucide-react';

const DriverDashboard = () => {
  const { user, logout, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  
  // Vehicle search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<{[key: string]: 'applying' | 'applied' | 'approved' | 'rejected' | undefined}>({});
  
  // Real-time vehicle data
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);

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

  // Subscribe to available vehicles only when user is authenticated
  useEffect(() => {
    if (!user?.id) {
      console.log('👤 DriverDashboard: No user authenticated, skipping vehicle subscription');
      setAvailableVehicles([]);
      setVehiclesLoading(false);
      return;
    }

    console.log('📱 DriverDashboard: Setting up vehicle subscription for user:', user.id);
    setVehiclesLoading(true);
    
    const unsubscribe = vehicleService.subscribeToAvailableVehicles((vehicles) => {
      console.log('📱 DriverDashboard: Received vehicles:', vehicles.length);
      setAvailableVehicles(vehicles);
      setVehiclesLoading(false);
    });

    return () => {
      console.log('📱 DriverDashboard: Cleaning up vehicle subscription');
      unsubscribe();
    };
  }, [user?.id]); // Re-subscribe when user changes

  const handleApplyForVehicle = async (vehicleId: string) => {
    try {
      setApplicationStatus(prev => ({ ...prev, [vehicleId]: 'applying' }));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate success
      setApplicationStatus(prev => ({ ...prev, [vehicleId]: 'applied' }));
      setShowSuccessNotification(true);
      
      console.log(`Applied for vehicle ${vehicleId}`);
    } catch (error) {
      console.error('Application failed:', error);
      setApplicationStatus(prev => {
        const newStatus = { ...prev };
        delete newStatus[vehicleId];
        return newStatus;
      });
    }
  };

  const driverStats = {
    weeklyEarnings: 2450,
    totalTrips: 47,
    rating: 4.8,
    hoursWorked: 38
  };

  // Filter vehicles based on search and filters
  const filteredVehicles = availableVehicles.filter(vehicle => {
    // Only show vehicles that are available and not owned by the current user
    if (vehicle.status !== 'available' || vehicle.ownerId === user?.id) {
      return false;
    }

    // Search filter
    const matchesSearch = searchQuery === '' || 
      vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Location filter
    const matchesLocation = selectedLocation === 'all' || 
      vehicle.location.toLowerCase().includes(selectedLocation.toLowerCase());
    
    // Price filter
    const matchesPrice = priceRange === 'all' || 
      (priceRange === 'under-1000' && vehicle.weeklyRate < 1000) ||
      (priceRange === '1000-1200' && vehicle.weeklyRate >= 1000 && vehicle.weeklyRate <= 1200) ||
      (priceRange === 'over-1200' && vehicle.weeklyRate > 1200);
    
    return matchesSearch && matchesLocation && matchesPrice;
  });

  const recentPayments = [
    { id: 1, amount: 1200, date: "2025-01-13", status: "paid", vehicle: "Toyota Corolla Quest" },
    { id: 2, amount: 1200, date: "2025-01-06", status: "paid", vehicle: "Toyota Corolla Quest" },
    { id: 3, amount: 1200, date: "2024-12-30", status: "paid", vehicle: "Toyota Corolla Quest" }
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
                FleetLink Driver
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
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'vehicles', label: 'Find Vehicles', icon: Car },
            { id: 'payments', label: 'Payments', icon: DollarSign },
            { id: 'documents', label: 'Documents', icon: FileText },
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
                    <p className="text-sm font-medium text-gray-600">Weekly Earnings</p>
                    <p className="text-3xl font-bold text-gray-900">R{driverStats.weeklyEarnings.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">+15%</span>
                  <span className="text-gray-500 ml-1">vs last week</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Trips</p>
                    <p className="text-3xl font-bold text-gray-900">{driverStats.totalTrips}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-gray-500">This week</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Driver Rating</p>
                    <p className="text-3xl font-bold text-gray-900">{driverStats.rating}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-gray-500">Based on 127 rides</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Hours Worked</p>
                    <p className="text-3xl font-bold text-gray-900">{driverStats.hoursWorked}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-gray-500">This week</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => setActiveTab('vehicles')}
                className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow group w-full text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Car className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Find Vehicles</h3>
                    <p className="text-sm text-gray-500">Browse available cars</p>
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
                    <p className="text-sm text-gray-500">Chat with owners</p>
                  </div>
                </div>
              </Link>

              <button
                onClick={() => setActiveTab('documents')}
                className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow group w-full text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Documents</h3>
                    <p className="text-sm text-gray-500">Manage documents</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Current Vehicle */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Current Vehicle</h3>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Car className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Toyota Corolla Quest</h4>
                      <p className="text-gray-500">CA 123-456 • Weekly Rate: R1,200</p>
                      <p className="text-sm text-gray-500">Owner: Thabo Mokoena</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      Active Rental
                    </span>
                    <p className="text-sm text-gray-500 mt-2">Next payment due: Jan 20</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Payments */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Recent Payments</h3>
                <Link to="#" className="text-blue-600 text-sm font-medium hover:text-blue-700">
                  View all
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentPayments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {payment.vehicle}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          R{payment.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payment.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            {payment.status}
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

        {/* Find Vehicles Tab */}
        {activeTab === 'vehicles' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by make, model, or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center space-x-2 px-6 py-3 border rounded-lg transition-colors ${
                    showFilters ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                </button>
              </div>

              {/* Filter Options */}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Locations</option>
                      <option value="johannesburg">Johannesburg</option>
                      <option value="cape town">Cape Town</option>
                      <option value="durban">Durban</option>
                      <option value="pretoria">Pretoria</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weekly Rate</label>
                    <select
                      value={priceRange}
                      onChange={(e) => setPriceRange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Prices</option>
                      <option value="under-1000">Under R1,000</option>
                      <option value="1000-1200">R1,000 - R1,200</option>
                      <option value="over-1200">Over R1,200</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedLocation('all');
                        setPriceRange('all');
                      }}
                      className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              )}

              {/* Results Count */}
              <div className="mt-4 text-sm text-gray-600">
                {filteredVehicles.length} vehicle{filteredVehicles.length !== 1 ? 's' : ''} available
              </div>
            </div>

            {/* Available Vehicles */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehiclesLoading ? (
                <div className="col-span-full bg-white rounded-xl shadow-sm border p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Loading vehicles...</h3>
                  <p className="text-gray-500">Finding available vehicles for you.</p>
                </div>
              ) : filteredVehicles.length === 0 ? (
                <div className="col-span-full bg-white rounded-xl shadow-sm border p-8 text-center">
                  <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles found</h3>
                  <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
                </div>
              ) : (
                filteredVehicles.map((vehicle) => (
                <div key={vehicle.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{vehicle.make}</h3>
                        <p className="text-sm text-gray-500">{vehicle.year} • {vehicle.location}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        vehicle.status === 'available'
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {vehicle.status === 'available' ? 'Available' : 'Rented'}
                      </span>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Owner:</span>
                        <span className="font-medium">{vehicle.ownerName}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Weekly Rate:</span>
                        <span className="font-medium text-green-600">R{vehicle.weeklyRate}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Rating:</span>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="font-medium">{vehicle.rating || 'New'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">Features:</p>
                      <div className="flex flex-wrap gap-1">
                        {vehicle.features.map((feature, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={() => handleApplyForVehicle(vehicle.id)}
                      className={`w-full py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                        vehicle.status !== 'available'
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : applicationStatus[vehicle.id] === 'applying'
                          ? 'bg-blue-400 text-white cursor-not-allowed'
                          : applicationStatus[vehicle.id] === 'applied'
                          ? 'bg-green-100 text-green-800 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                      disabled={vehicle.status !== 'available' || applicationStatus[vehicle.id] === 'applying' || applicationStatus[vehicle.id] === 'applied'}
                    >
                      {vehicle.status !== 'available' ? (
                        <span>Not Available</span>
                      ) : applicationStatus[vehicle.id] === 'applying' ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Applying...</span>
                        </>
                      ) : applicationStatus[vehicle.id] === 'applied' ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>Application Sent</span>
                        </>
                      ) : (
                        <span>Apply for Rental</span>
                      )}
                    </button>
                  </div>
                </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Other tabs */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h3>
            <p className="text-gray-600">Detailed payment history and management coming soon...</p>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Management</h3>
            <p className="text-gray-600">Upload and manage your driving license, PDP, and other documents...</p>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Account Information */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Driver Profile</h3>
                <p className="text-sm text-gray-500 mt-1">Manage your personal details and driver information</p>
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
                        {user?.verified ? 'Verified Driver' : 'Pending Verification'}
                      </span>
                    </div>
                    <div className="flex items-center mt-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                      <span className="text-sm text-gray-600">4.8 Driver Rating</span>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Driver ID</label>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <span className="text-gray-900 font-mono text-sm">{user?.id || 'Not available'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Driver Stats */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Driver Statistics</h3>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">4.8</div>
                    <div className="text-sm text-gray-600">Overall Rating</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">127</div>
                    <div className="text-sm text-gray-600">Total Trips</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">R24,500</div>
                    <div className="text-sm text-gray-600">Monthly Earnings</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">98%</div>
                    <div className="text-sm text-gray-600">Completion Rate</div>
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
                    <FileText className="w-5 h-5 text-gray-500" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">Documents</div>
                      <div className="text-sm text-gray-500">License & PDP</div>
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

      {/* Success Notification */}
      <SuccessNotification
        isVisible={showSuccessNotification}
        message={applicationStatus && Object.values(applicationStatus).includes('applied') 
          ? "Your rental application has been submitted successfully!" 
          : "Your profile has been updated successfully!"}
        onClose={() => setShowSuccessNotification(false)}
      />
    </div>
  );
};

export default DriverDashboard;