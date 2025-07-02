import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Bell, Check, Filter, Search, DollarSign, Car, AlertTriangle, Calendar, MessageCircle, Settings, Trash2, AreaChart as MarkAsUnread, Plus } from 'lucide-react';
import { notificationService, Notification } from '../../services/notificationService';

const NotificationCenter = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to real-time notifications for the current user
  useEffect(() => {
    if (!user?.id) {
      console.log('🔔 NotificationCenter: No user ID, skipping subscription');
      setLoading(false);
      return;
    }

    console.log('🔔 NotificationCenter: Setting up notification subscription for user:', user.id);

    try {
      const unsubscribe = notificationService.subscribeToUserNotifications(
        user.id,
        (userNotifications) => {
          console.log('🔔 NotificationCenter: Received notifications:', userNotifications.length);
          setNotifications(userNotifications);
          setLoading(false);
        }
      );

      return () => {
        console.log('🔔 NotificationCenter: Cleaning up notification subscription');
        unsubscribe();
      };
    } catch (error) {
      console.error('🔔 NotificationCenter: Error setting up subscription:', error);
      setLoading(false);
    }
  }, [user?.id]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment': return <DollarSign className="w-5 h-5 text-green-600" />;
      case 'maintenance': return <Car className="w-5 h-5 text-blue-600" />;
      case 'security': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'compliance': return <Calendar className="w-5 h-5 text-orange-600" />;
      case 'message': return <MessageCircle className="w-5 h-5 text-purple-600" />;
      case 'system': return <Settings className="w-5 h-5 text-gray-600" />;
      case 'new_vehicle': return <Plus className="w-5 h-5 text-blue-600" />;
      default: return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-l-red-500 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      case 'medium': return 'border-l-blue-500 bg-blue-50';
      case 'low': return 'border-l-gray-500 bg-gray-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatTime = (timestamp: unknown) => {
    // Handle Firestore timestamp
    let date: Date;
    if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp && typeof timestamp.toDate === 'function') {
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else {
      return 'Unknown time';
    }

    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hour${Math.floor(diffInHours) !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    try {
      await notificationService.markAllAsRead(user.id);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleCreateSampleNotifications = async () => {
    if (!user?.id) return;
    try {
      await notificationService.createSampleNotifications(user.id);
    } catch (error) {
      console.error('Failed to create sample notifications:', error);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || 
                         (filter === 'unread' && !notification.read) ||
                         (filter === 'read' && notification.read) ||
                         notification.type === filter;
    
    const matchesSearch = searchQuery === '' || 
                         notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <h1 className="text-xl font-semibold text-gray-900">Notifications</h1>
                {unreadCount > 0 && (
                  <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium text-white bg-red-600 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-900">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Notifications</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
                <option value="payment">Payments</option>
                <option value="security">Security</option>
                <option value="maintenance">Maintenance</option>
                <option value="compliance">Compliance</option>
                <option value="message">Messages</option>
                <option value="system">System</option>
                <option value="new_vehicle">New Vehicles</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
              </div>
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
              </div>
              <MarkAsUnread className="w-8 h-8 text-red-400" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-orange-600">
                  {notifications.filter(n => n.priority === 'critical').length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-400" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today</p>
                <p className="text-2xl font-bold text-blue-600">
                  {notifications.filter(n => {
                    let notifDate: Date;
                    if (n.timestamp && n.timestamp.toDate) {
                      notifDate = n.timestamp.toDate();
                    } else if (n.timestamp instanceof Date) {
                      notifDate = n.timestamp;
                    } else if (typeof n.timestamp === 'string') {
                      notifDate = new Date(n.timestamp);
                    } else {
                      return false;
                    }
                    const today = new Date();
                    return notifDate.toDateString() === today.toDateString();
                  }).length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-400" />
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Loading notifications...</h3>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery ? 'Try adjusting your search terms' : notifications.length === 0 ? 'No notifications yet' : 'You\'re all caught up!'}
              </p>
              {notifications.length === 0 && (
                <button
                  onClick={handleCreateSampleNotifications}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                >
                  Create Sample Notifications (Testing)
                </button>
              )}
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow-sm border-l-4 p-6 hover:shadow-md transition-shadow ${
                  getPriorityColor(notification.priority)
                } ${!notification.read ? 'ring-2 ring-blue-100' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          notification.priority === 'critical' ? 'bg-red-100 text-red-800' :
                          notification.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          notification.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {notification.priority}
                        </span>
                      </div>
                      
                      <p className={`text-sm ${!notification.read ? 'text-gray-900' : 'text-gray-600'} mb-2`}>
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {formatTime(notification.timestamp)}
                        </span>
                        
                        {notification.actionUrl && (
                          <Link
                            to={notification.actionUrl}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                          >
                            View Details →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.read && (
                      <button 
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="p-1 text-gray-400 hover:text-blue-600 rounded"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button className="p-1 text-gray-400 hover:text-red-600 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bulk Actions */}
        {filteredNotifications.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
              </span>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Mark all as read
                </button>
                <span className="text-gray-300">|</span>
                <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                  Clear all
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;