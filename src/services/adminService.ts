import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  updateDoc, 
  deleteDoc,
  setDoc,
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  writeBatch,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { User } from './authService';

export interface AdminStats {
  totalUsers: number;
  totalOwners: number;
  totalDrivers: number;
  totalVehicles: number;
  totalApplications: number;
  totalConversations: number;
  totalMessages: number;
  recentSignups: number;
  activeUsers: number;
  pendingApplications: number;
  verifiedUsers: number;
  revenueThisMonth: number;
}

export interface AdminUser extends User {
  lastLogin?: any;
  status: 'active' | 'suspended' | 'banned';
  totalVehicles?: number;
  totalApplications?: number;
  totalMessages?: number;
  verificationDocuments?: string[];
  riskScore?: number;
  notes?: string;
}

export interface AdminVehicle {
  id: string;
  ownerId: string;
  ownerName: string;
  make: string;
  model: string;
  year: number;
  plate: string;
  location: string;
  weeklyRate: number;
  images: string[];
  status: 'active' | 'pending' | 'suspended' | 'rejected';
  verificationStatus: 'pending' | 'verified' | 'rejected';
  createdAt: any;
  updatedAt: any;
  totalApplications?: number;
  rating?: number;
  reports?: AdminReport[];
}

export interface AdminApplication {
  id: string;
  vehicleId: string;
  vehicleMake: string;
  driverId: string;
  driverName: string;
  ownerId: string;
  ownerName: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  startDate: any;
  endDate: any;
  totalCost: number;
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  createdAt: any;
  updatedAt: any;
  riskFlags?: string[];
  adminNotes?: string;
}

export interface AdminReport {
  id: string;
  type: 'user' | 'vehicle' | 'application' | 'chat';
  reporterId: string;
  reporterName: string;
  targetId: string;
  targetType: 'user' | 'vehicle' | 'application' | 'message';
  category: 'inappropriate_content' | 'fraud' | 'safety_concern' | 'harassment' | 'other';
  description: string;
  evidence?: string[];
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;
  resolution?: string;
  createdAt: any;
  updatedAt: any;
}

export interface AdminAnnouncement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'maintenance' | 'feature';
  targetAudience: 'all' | 'owners' | 'drivers' | 'admins';
  isActive: boolean;
  startDate: any;
  endDate?: any;
  priority: 'low' | 'medium' | 'high';
  createdBy: string;
  createdAt: any;
  updatedAt: any;
}

export interface AdminAnalytics {
  userGrowth: { date: string; count: number }[];
  vehicleGrowth: { date: string; count: number }[];
  applicationTrends: { date: string; count: number }[];
  revenue: { date: string; amount: number }[];
  topLocations: { location: string; count: number }[];
  popularVehicles: { make: string; count: number }[];
  userActivity: { date: string; activeUsers: number }[];
}

class AdminService {
  private readonly USERS_COLLECTION = 'users';
  private readonly VEHICLES_COLLECTION = 'vehicles';
  private readonly APPLICATIONS_COLLECTION = 'applications';
  private readonly CONVERSATIONS_COLLECTION = 'conversations';
  private readonly MESSAGES_COLLECTION = 'chatMessages';
  private readonly REPORTS_COLLECTION = 'reports';
  private readonly ANNOUNCEMENTS_COLLECTION = 'announcements';
  private readonly ANALYTICS_COLLECTION = 'analytics';

  /**
   * Get comprehensive admin dashboard statistics
   */
  async getDashboardStats(): Promise<AdminStats> {
    try {
      console.log('📊 Fetching admin dashboard stats...');

      // Run all queries in parallel for better performance
      const [
        usersSnapshot,
        vehiclesSnapshot,
        applicationsSnapshot,
        conversationsSnapshot,
        messagesSnapshot
      ] = await Promise.all([
        getDocs(collection(db, this.USERS_COLLECTION)),
        getDocs(collection(db, this.VEHICLES_COLLECTION)),
        getDocs(collection(db, this.APPLICATIONS_COLLECTION)),
        getDocs(collection(db, this.CONVERSATIONS_COLLECTION)),
        getDocs(collection(db, this.MESSAGES_COLLECTION))
      ]);

      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const vehicles = vehiclesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const applications = applicationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calculate statistics
      const totalUsers = users.length;
      const totalOwners = users.filter((user: any) => user.role === 'owner').length;
      const totalDrivers = users.filter((user: any) => user.role === 'driver').length;
      const verifiedUsers = users.filter((user: any) => user.verified === true).length;

      // Recent signups (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const recentSignups = users.filter((user: any) => {
        const createdAt = new Date(user.createdAt);
        return createdAt > weekAgo;
      }).length;

      // Pending applications
      const pendingApplications = applications.filter((app: any) => app.status === 'pending').length;

      const stats: AdminStats = {
        totalUsers,
        totalOwners,
        totalDrivers,
        totalVehicles: vehicles.length,
        totalApplications: applications.length,
        totalConversations: conversationsSnapshot.size,
        totalMessages: messagesSnapshot.size,
        recentSignups,
        activeUsers: 0, // TODO: Calculate based on last login
        pendingApplications,
        verifiedUsers,
        revenueThisMonth: 0 // TODO: Calculate from completed applications
      };

      console.log('✅ Dashboard stats fetched:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Get all users with admin-specific information
   */
  async getAllUsers(): Promise<AdminUser[]> {
    try {
      console.log('👥 Fetching all users for admin...');
      
      const usersSnapshot = await getDocs(
        query(collection(db, this.USERS_COLLECTION), orderBy('createdAt', 'desc'))
      );

      const users: AdminUser[] = await Promise.all(
        usersSnapshot.docs.map(async (userDoc) => {
          const userData = userDoc.data() as User;
          
          // Get additional stats for each user
          const [vehiclesCount, applicationsCount] = await Promise.all([
            this.getUserVehicleCount(userData.id),
            this.getUserApplicationCount(userData.id)
          ]);

          return {
            ...userData,
            status: 'active', // Default status
            totalVehicles: vehiclesCount,
            totalApplications: applicationsCount,
            totalMessages: 0, // TODO: Calculate
            riskScore: 0 // TODO: Calculate based on reports/behavior
          } as AdminUser;
        })
      );

      console.log('✅ Users fetched for admin:', users.length);
      return users;
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      throw error;
    }
  }

  /**
   * Update user status (suspend, ban, activate)
   */
  async updateUserStatus(userId: string, status: 'active' | 'suspended' | 'banned', reason?: string): Promise<void> {
    try {
      console.log('🔄 Updating user status:', { userId, status, reason });

      await updateDoc(doc(db, this.USERS_COLLECTION, userId), {
        status,
        updatedAt: serverTimestamp(),
        ...(reason && { statusReason: reason })
      });

      console.log('✅ User status updated');

      // Log admin action (non-blocking)
      this.logAdminAction('user_status_change', {
        targetUserId: userId,
        newStatus: status,
        reason
      }).catch(error => {
        console.warn('⚠️ Failed to log admin action, but user update succeeded:', error);
      });

    } catch (error) {
      console.error('❌ Error updating user status:', error);
      throw error;
    }
  }

  /**
   * Get all vehicles with admin information
   */
  async getAllVehicles(): Promise<AdminVehicle[]> {
    try {
      console.log('🚗 Fetching all vehicles for admin...');
      
      const vehiclesSnapshot = await getDocs(
        query(collection(db, this.VEHICLES_COLLECTION), orderBy('createdAt', 'desc'))
      );

      const vehicles: AdminVehicle[] = await Promise.all(
        vehiclesSnapshot.docs.map(async (vehicleDoc) => {
          const vehicleData = vehicleDoc.data();
          
          // Get application count for this vehicle
          const applicationsCount = await this.getVehicleApplicationCount(vehicleDoc.id);

          return {
            id: vehicleDoc.id,
            ...vehicleData,
            status: vehicleData.status || 'active',
            verificationStatus: vehicleData.verificationStatus || 'pending',
            totalApplications: applicationsCount,
            rating: vehicleData.rating || 0
          } as AdminVehicle;
        })
      );

      console.log('✅ Vehicles fetched for admin:', vehicles.length);
      return vehicles;
    } catch (error) {
      console.error('❌ Error fetching vehicles:', error);
      throw error;
    }
  }

  /**
   * Update vehicle status and verification
   */
  async updateVehicleStatus(
    vehicleId: string, 
    status: 'active' | 'pending' | 'suspended' | 'rejected',
    verificationStatus?: 'pending' | 'verified' | 'rejected',
    reason?: string
  ): Promise<void> {
    try {
      console.log('🔄 Updating vehicle status:', { vehicleId, status, verificationStatus, reason });

      // Check if vehicle exists first
      const vehicleDoc = await getDoc(doc(db, this.VEHICLES_COLLECTION, vehicleId));
      if (!vehicleDoc.exists()) {
        throw new Error(`Vehicle with ID ${vehicleId} not found`);
      }

      const updateData: any = {
        status,
        updatedAt: serverTimestamp()
      };

      if (verificationStatus) {
        updateData.verificationStatus = verificationStatus;
      }

      if (reason) {
        updateData.statusReason = reason;
      }

      console.log('📝 Update data:', updateData);

      await updateDoc(doc(db, this.VEHICLES_COLLECTION, vehicleId), updateData);

      console.log('✅ Vehicle status updated successfully');

      // Log admin action (non-blocking)
      this.logAdminAction('vehicle_status_change', {
        targetVehicleId: vehicleId,
        newStatus: status,
        verificationStatus,
        reason
      }).catch(error => {
        console.warn('⚠️ Failed to log admin action, but vehicle update succeeded:', error);
      });
    } catch (error: any) {
      console.error('❌ Error updating vehicle status:', error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        details: error.details
      });
      throw new Error(`Failed to update vehicle status: ${error.message}`);
    }
  }

  /**
   * Get all applications with admin information
   */
  async getAllApplications(): Promise<AdminApplication[]> {
    try {
      console.log('📄 Fetching all applications for admin...');
      
      const applicationsSnapshot = await getDocs(
        query(collection(db, this.APPLICATIONS_COLLECTION), orderBy('createdAt', 'desc'))
      );

      const applications: AdminApplication[] = applicationsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          vehicleId: data.vehicleId || '',
          vehicleMake: data.vehicleMake || '',
          driverId: data.driverId || '',
          driverName: data.driverName || '',
          ownerId: data.ownerId || '',
          ownerName: data.ownerName || '',
          status: data.status || 'pending',
          startDate: data.startDate,
          endDate: data.endDate,
          totalCost: data.totalCost || 0,
          paymentStatus: data.paymentStatus || 'pending',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          riskFlags: data.riskFlags || [],
          adminNotes: data.adminNotes || ''
        } as AdminApplication;
      });

      console.log('✅ Applications fetched for admin:', applications.length);
      return applications;
    } catch (error) {
      console.error('❌ Error fetching applications:', error);
      throw error;
    }
  }

  /**
   * Create and manage reports
   */
  async createReport(report: Omit<AdminReport, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      console.log('📝 Creating new report:', report);

      const reportData = {
        ...report,
        status: 'pending' as const,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await doc(collection(db, this.REPORTS_COLLECTION));
      await setDoc(docRef, reportData);

      console.log('✅ Report created:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating report:', error);
      throw error;
    }
  }

  /**
   * Get all reports
   */
  async getAllReports(): Promise<AdminReport[]> {
    try {
      console.log('📋 Fetching all reports...');
      
      const reportsSnapshot = await getDocs(
        query(collection(db, this.REPORTS_COLLECTION), orderBy('createdAt', 'desc'))
      );

      const reports: AdminReport[] = reportsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AdminReport));

      console.log('✅ Reports fetched:', reports.length);
      return reports;
    } catch (error) {
      console.error('❌ Error fetching reports:', error);
      throw error;
    }
  }

  /**
   * Update report status
   */
  async updateReportStatus(
    reportId: string, 
    status: AdminReport['status'],
    resolution?: string,
    assignedTo?: string
  ): Promise<void> {
    try {
      console.log('🔄 Updating report status:', { reportId, status, resolution });

      const updateData: any = {
        status,
        updatedAt: serverTimestamp()
      };

      if (resolution) updateData.resolution = resolution;
      if (assignedTo) updateData.assignedTo = assignedTo;

      await updateDoc(doc(db, this.REPORTS_COLLECTION, reportId), updateData);

      console.log('✅ Report status updated');
    } catch (error) {
      console.error('❌ Error updating report status:', error);
      throw error;
    }
  }

  /**
   * Create system announcements
   */
  async createAnnouncement(announcement: Omit<AdminAnnouncement, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      console.log('📢 Creating announcement:', announcement);

      const announcementData = {
        ...announcement,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await doc(collection(db, this.ANNOUNCEMENTS_COLLECTION));
      await setDoc(docRef, announcementData);

      console.log('✅ Announcement created:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating announcement:', error);
      throw error;
    }
  }

  /**
   * Get system analytics data
   */
  async getAnalytics(timeframe: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<AdminAnalytics> {
    try {
      console.log('📈 Fetching analytics data for timeframe:', timeframe);

      // This would typically involve complex aggregation queries
      // For now, returning mock data structure
      const analytics: AdminAnalytics = {
        userGrowth: [],
        vehicleGrowth: [],
        applicationTrends: [],
        revenue: [],
        topLocations: [],
        popularVehicles: [],
        userActivity: []
      };

      // TODO: Implement actual analytics calculations
      console.log('✅ Analytics data fetched');
      return analytics;
    } catch (error) {
      console.error('❌ Error fetching analytics:', error);
      throw error;
    }
  }

  /**
   * Helper functions
   */
  private async getUserVehicleCount(userId: string): Promise<number> {
    try {
      const vehiclesSnapshot = await getDocs(
        query(collection(db, this.VEHICLES_COLLECTION), where('ownerId', '==', userId))
      );
      return vehiclesSnapshot.size;
    } catch (error) {
      console.error('Error getting user vehicle count:', error);
      return 0;
    }
  }

  private async getUserApplicationCount(userId: string): Promise<number> {
    try {
      const applicationsSnapshot = await getDocs(
        query(collection(db, this.APPLICATIONS_COLLECTION), where('driverId', '==', userId))
      );
      return applicationsSnapshot.size;
    } catch (error) {
      console.error('Error getting user application count:', error);
      return 0;
    }
  }

  private async getVehicleApplicationCount(vehicleId: string): Promise<number> {
    try {
      const applicationsSnapshot = await getDocs(
        query(collection(db, this.APPLICATIONS_COLLECTION), where('vehicleId', '==', vehicleId))
      );
      return applicationsSnapshot.size;
    } catch (error) {
      console.error('Error getting vehicle application count:', error);
      return 0;
    }
  }

  /**
   * Log admin actions for audit trail
   */
  private async logAdminAction(action: string, details: any): Promise<void> {
    try {
      // Get current user from Firebase Auth
      const { auth } = await import('../config/firebase');
      const currentUser = auth.currentUser;
      
      const logData = {
        action,
        details,
        timestamp: serverTimestamp(),
        adminId: currentUser?.uid || 'unknown-admin',
        adminEmail: currentUser?.email || 'unknown-email'
      };

      await setDoc(doc(collection(db, 'admin_logs')), logData);
      console.log('✅ Admin action logged:', action);
    } catch (error) {
      console.error('❌ Error logging admin action:', error);
      // Don't throw here as it's not critical - the main action should still succeed
    }
  }

  /**
   * Bulk operations
   */
  async bulkUpdateUsers(userIds: string[], updates: Partial<AdminUser>): Promise<void> {
    try {
      console.log('🔄 Bulk updating users:', { count: userIds.length, updates });

      const batch = writeBatch(db);
      
      userIds.forEach(userId => {
        const userRef = doc(db, this.USERS_COLLECTION, userId);
        batch.update(userRef, {
          ...updates,
          updatedAt: serverTimestamp()
        });
      });

      await batch.commit();
      console.log('✅ Bulk user update completed');
    } catch (error) {
      console.error('❌ Error in bulk user update:', error);
      throw error;
    }
  }

  /**
   * Search functionality
   */
  async searchUsers(searchTerm: string): Promise<AdminUser[]> {
    try {
      // Note: This is a simple implementation. In production, you'd use 
      // more sophisticated search like Algolia or Elasticsearch
      const users = await this.getAllUsers();
      
      const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.phone && user.phone.includes(searchTerm))
      );

      return filteredUsers;
    } catch (error) {
      console.error('❌ Error searching users:', error);
      throw error;
    }
  }

  async searchVehicles(searchTerm: string): Promise<AdminVehicle[]> {
    try {
      const vehicles = await this.getAllVehicles();
      
      const filteredVehicles = vehicles.filter(vehicle => 
        vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return filteredVehicles;
    } catch (error) {
      console.error('❌ Error searching vehicles:', error);
      throw error;
    }
  }
}

export const adminService = new AdminService();
export default adminService; 