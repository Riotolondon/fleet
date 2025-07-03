import React, { useState, useEffect } from 'react';
import { adminService, type AdminAnnouncement } from '../../services/adminService';
import { 
  Settings, 
  Bell, 
  Shield, 
  Mail, 
  Database,
  Key,
  Globe,
  Save,
  Plus,
  Trash2,
  Edit,
  RefreshCw
} from 'lucide-react';

const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'security' | 'announcements'>('general');
  const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);

  const [generalSettings, setGeneralSettings] = useState({
    platformName: 'FleetLink',
    supportEmail: 'support@fleetlink.com',
    maintenanceMode: false,
    allowNewRegistrations: true,
    requireEmailVerification: true,
    maxVehiclesPerOwner: 10,
    commissionRate: 15,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    adminAlerts: true,
    userReportNotifications: true,
    systemMaintenanceNotifications: true,
  });

  const [securitySettings, setSecuritySettings] = useState({
    passwordMinLength: 8,
    requireStrongPasswords: true,
    enableTwoFactor: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    enableIpWhitelist: false,
  });

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    type: 'info' as 'info' | 'warning' | 'maintenance' | 'feature',
    targetAudience: 'all' as 'all' | 'owners' | 'drivers' | 'admins',
    priority: 'medium' as 'low' | 'medium' | 'high',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    isActive: true,
  });

  useEffect(() => {
    if (activeTab === 'announcements') {
      loadAnnouncements();
    }
  }, [activeTab]);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      // For now, we'll use empty array since announcements aren't fully implemented
      setAnnouncements([]);
    } catch (error) {
      console.error('Error loading announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (section: string) => {
    try {
      setLoading(true);
      // Here you would normally save to Firebase or your backend
      console.log(`Saving ${section} settings...`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert(`${section} settings saved successfully!`);
    } catch (error) {
      console.error(`Error saving ${section} settings:`, error);
      alert(`Failed to save ${section} settings`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async () => {
    try {
      if (!newAnnouncement.title || !newAnnouncement.content) {
        alert('Please fill in all required fields');
        return;
      }

      setLoading(true);
      
      // Create announcement using admin service
      await adminService.createAnnouncement({
        ...newAnnouncement,
        createdBy: 'current-admin-id', // In real app, get from auth context
        startDate: new Date(newAnnouncement.startDate),
        endDate: newAnnouncement.endDate ? new Date(newAnnouncement.endDate) : undefined,
      });

      // Reset form and close modal
      setNewAnnouncement({
        title: '',
        content: '',
        type: 'info',
        targetAudience: 'all',
        priority: 'medium',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        isActive: true,
      });
      
      setShowAnnouncementModal(false);
      await loadAnnouncements();
      
      alert('Announcement created successfully!');
    } catch (error) {
      console.error('Error creating announcement:', error);
      alert('Failed to create announcement');
    } finally {
      setLoading(false);
    }
  };

  const SettingCard: React.FC<{
    title: string;
    description: string;
    children: React.ReactNode;
  }> = ({ title, description, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      {children}
    </div>
  );

  const InputField: React.FC<{
    label: string;
    type?: string;
    value: string | number | boolean;
    onChange: (value: any) => void;
    placeholder?: string;
  }> = ({ label, type = 'text', value, onChange, placeholder }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {type === 'checkbox' ? (
        <input
          type="checkbox"
          checked={value as boolean}
          onChange={(e) => onChange(e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      ) : (
        <input
          type={type}
          value={value as string | number}
          onChange={(e) => onChange(type === 'number' ? parseInt(e.target.value) : e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      )}
    </div>
  );

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <SettingCard
        title="Platform Configuration"
        description="Basic platform settings and configuration"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Platform Name"
            value={generalSettings.platformName}
            onChange={(value) => setGeneralSettings(prev => ({ ...prev, platformName: value }))}
          />
          <InputField
            label="Support Email"
            type="email"
            value={generalSettings.supportEmail}
            onChange={(value) => setGeneralSettings(prev => ({ ...prev, supportEmail: value }))}
          />
          <InputField
            label="Max Vehicles per Owner"
            type="number"
            value={generalSettings.maxVehiclesPerOwner}
            onChange={(value) => setGeneralSettings(prev => ({ ...prev, maxVehiclesPerOwner: value }))}
          />
          <InputField
            label="Commission Rate (%)"
            type="number"
            value={generalSettings.commissionRate}
            onChange={(value) => setGeneralSettings(prev => ({ ...prev, commissionRate: value }))}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="flex items-center space-x-2">
            <InputField
              label="Maintenance Mode"
              type="checkbox"
              value={generalSettings.maintenanceMode}
              onChange={(value) => setGeneralSettings(prev => ({ ...prev, maintenanceMode: value }))}
            />
            <span className="text-sm text-gray-600">Enable maintenance mode</span>
          </div>
          <div className="flex items-center space-x-2">
            <InputField
              label="Allow New Registrations"
              type="checkbox"
              value={generalSettings.allowNewRegistrations}
              onChange={(value) => setGeneralSettings(prev => ({ ...prev, allowNewRegistrations: value }))}
            />
            <span className="text-sm text-gray-600">Allow new user registrations</span>
          </div>
        </div>
        <button
          onClick={() => handleSaveSettings('general')}
          disabled={loading}
          className="mt-4 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4 mr-2" />
          Save General Settings
        </button>
      </SettingCard>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <SettingCard
        title="Notification Preferences"
        description="Configure notification settings for the platform"
      >
        <div className="space-y-4">
          {Object.entries(notificationSettings).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <span className="font-medium text-gray-900 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <p className="text-sm text-gray-600">
                  {key === 'emailNotifications' && 'Send email notifications to users'}
                  {key === 'smsNotifications' && 'Send SMS notifications to users'}
                  {key === 'pushNotifications' && 'Send push notifications to mobile apps'}
                  {key === 'adminAlerts' && 'Send alerts to administrators'}
                  {key === 'userReportNotifications' && 'Notify when users submit reports'}
                  {key === 'systemMaintenanceNotifications' && 'Notify about system maintenance'}
                </p>
              </div>
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setNotificationSettings(prev => ({ ...prev, [key]: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>
        <button
          onClick={() => handleSaveSettings('notification')}
          disabled={loading}
          className="mt-4 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Notification Settings
        </button>
      </SettingCard>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <SettingCard
        title="Security Configuration"
        description="Configure security settings and policies"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Password Min Length"
            type="number"
            value={securitySettings.passwordMinLength}
            onChange={(value) => setSecuritySettings(prev => ({ ...prev, passwordMinLength: value }))}
          />
          <InputField
            label="Session Timeout (minutes)"
            type="number"
            value={securitySettings.sessionTimeout}
            onChange={(value) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: value }))}
          />
          <InputField
            label="Max Login Attempts"
            type="number"
            value={securitySettings.maxLoginAttempts}
            onChange={(value) => setSecuritySettings(prev => ({ ...prev, maxLoginAttempts: value }))}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="flex items-center space-x-2">
            <InputField
              label="Require Strong Passwords"
              type="checkbox"
              value={securitySettings.requireStrongPasswords}
              onChange={(value) => setSecuritySettings(prev => ({ ...prev, requireStrongPasswords: value }))}
            />
            <span className="text-sm text-gray-600">Enforce strong password policy</span>
          </div>
          <div className="flex items-center space-x-2">
            <InputField
              label="Enable Two-Factor Auth"
              type="checkbox"
              value={securitySettings.enableTwoFactor}
              onChange={(value) => setSecuritySettings(prev => ({ ...prev, enableTwoFactor: value }))}
            />
            <span className="text-sm text-gray-600">Enable 2FA for all users</span>
          </div>
        </div>
        <button
          onClick={() => handleSaveSettings('security')}
          disabled={loading}
          className="mt-4 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Security Settings
        </button>
      </SettingCard>
    </div>
  );

  const renderAnnouncements = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Announcements</h2>
          <p className="text-gray-600">Manage platform-wide announcements and notifications</p>
        </div>
        <button
          onClick={() => setShowAnnouncementModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Announcement
        </button>
      </div>

      {announcements.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow-sm text-center">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No announcements found. Create your first announcement to communicate with users.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-800">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-gray-600 mb-3">{announcement.content}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="capitalize">{announcement.type}</span>
                <span className="capitalize">{announcement.targetAudience}</span>
                <span className="capitalize">{announcement.priority}</span>
                <span>{announcement.isActive ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Announcement Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full m-4">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Create New Announcement</h2>
            </div>
            <div className="p-6 space-y-4">
              <InputField
                label="Title"
                value={newAnnouncement.title}
                onChange={(value) => setNewAnnouncement(prev => ({ ...prev, title: value }))}
                placeholder="Enter announcement title"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter announcement content"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={newAnnouncement.type}
                    onChange={(e) => setNewAnnouncement(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="feature">Feature</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                  <select
                    value={newAnnouncement.targetAudience}
                    onChange={(e) => setNewAnnouncement(prev => ({ ...prev, targetAudience: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Users</option>
                    <option value="owners">Owners</option>
                    <option value="drivers">Drivers</option>
                    <option value="admins">Admins</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Start Date"
                  type="date"
                  value={newAnnouncement.startDate}
                  onChange={(value) => setNewAnnouncement(prev => ({ ...prev, startDate: value }))}
                />
                <InputField
                  label="End Date (Optional)"
                  type="date"
                  value={newAnnouncement.endDate}
                  onChange={(value) => setNewAnnouncement(prev => ({ ...prev, endDate: value }))}
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowAnnouncementModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAnnouncement}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Create Announcement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'announcements', label: 'Announcements', icon: Globe },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
        <p className="text-gray-600 mt-1">Configure platform settings and manage system announcements</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && renderGeneralSettings()}
      {activeTab === 'notifications' && renderNotificationSettings()}
      {activeTab === 'security' && renderSecuritySettings()}
      {activeTab === 'announcements' && renderAnnouncements()}
    </div>
  );
};

export default AdminSettings; 