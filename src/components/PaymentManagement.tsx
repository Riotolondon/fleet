import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft,
  DollarSign,
  Calendar,
  CreditCard,
  Download,
  Filter,
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Users
} from 'lucide-react';

const PaymentManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const paymentStats = {
    totalRevenue: 89240,
    pendingPayments: 4250,
    overduePayments: 1200,
    collectionRate: 94.2
  };

  const transactions = [
    {
      id: 1,
      driver: "Sipho Mthembu",
      vehicle: "Toyota Corolla Quest (CA 123-456)",
      amount: 1200,
      dueDate: "2025-01-13",
      paidDate: "2025-01-13",
      status: "paid",
      method: "EFT"
    },
    {
      id: 2,
      driver: "Nomsa Dlamini",
      vehicle: "Hyundai Grand i10 (GP 789-012)",
      amount: 1100,
      dueDate: "2025-01-13",
      paidDate: "2025-01-13",
      status: "paid",
      method: "PayFast"
    },
    {
      id: 3,
      driver: "John Smith",
      vehicle: "Toyota Corolla (WC 345-678)",
      amount: 1150,
      dueDate: "2025-01-06",
      paidDate: null,
      status: "overdue",
      method: null
    },
    {
      id: 4,
      driver: "Sarah Nkomo",
      vehicle: "Suzuki Swift (GP 456-789)",
      amount: 1000,
      dueDate: "2025-01-20",
      paidDate: null,
      status: "pending",
      method: null
    }
  ];

  const paymentMethods = [
    { name: "EFT/Bank Transfer", percentage: 45, color: "bg-blue-500" },
    { name: "PayFast", percentage: 30, color: "bg-green-500" },
    { name: "Ozow", percentage: 15, color: "bg-purple-500" },
    { name: "Cash", percentage: 10, color: "bg-yellow-500" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'overdue': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
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
              <h1 className="text-xl font-semibold text-gray-900">Payment Management</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-8 mb-8 border-b">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'transactions', label: 'Transactions', icon: DollarSign },
            { id: 'methods', label: 'Payment Methods', icon: CreditCard },
            { id: 'reports', label: 'Reports', icon: Calendar }
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
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900">R{paymentStats.totalRevenue.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">+12%</span>
                  <span className="text-gray-500 ml-1">this month</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                    <p className="text-3xl font-bold text-gray-900">R{paymentStats.pendingPayments.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-gray-500">4 pending payments</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Overdue Payments</p>
                    <p className="text-3xl font-bold text-gray-900">R{paymentStats.overduePayments.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-red-600">Requires attention</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Collection Rate</p>
                    <p className="text-3xl font-bold text-gray-900">{paymentStats.collectionRate}%</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-gray-500">Last 30 days</span>
                </div>
              </div>
            </div>

            {/* Payment Methods Chart */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Payment Methods Distribution</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {paymentMethods.map((method, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded ${method.color}`}></div>
                        <span className="text-sm font-medium text-gray-900">{method.name}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${method.color}`}
                            style={{ width: `${method.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-8">{method.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <Users className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">{transaction.driver}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.vehicle}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          R{transaction.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.dueDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                            {getStatusIcon(transaction.status)}
                            <span className="ml-1 capitalize">{transaction.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.method || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                          {transaction.status === 'overdue' && (
                            <button className="text-red-600 hover:text-red-900">Remind</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs */}
        {activeTab === 'methods' && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method Configuration</h3>
            <p className="text-gray-600">Configure PayFast, Ozow, and bank integration settings...</p>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Reports</h3>
            <p className="text-gray-600">Generate detailed payment reports and analytics...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentManagement;