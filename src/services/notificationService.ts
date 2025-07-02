import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  updateDoc, 
  doc,
  getDocs,
  serverTimestamp,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Notification {
  id: string;
  type: 'payment' | 'maintenance' | 'security' | 'system' | 'message' | 'compliance' | 'new_vehicle';
  title: string;
  message: string;
  timestamp: unknown; // Firestore timestamp
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionUrl?: string;
  metadata?: {
    vehicleId?: string;
    amount?: number;
    dueDate?: string;
    vehicleMake?: string;
    vehicleLocation?: string;
    ownerId?: string;
    ownerName?: string;
    driverId?: string;
    applicationId?: string;
    status?: string;
  };
  userId: string; // The user who should receive this notification
  createdBy?: string; // The user who created this notification (for audit purposes)
}

export interface NewVehicleNotificationData {
  vehicleId: string;
  vehicleMake: string;
  vehicleLocation: string;
  weeklyRate: number;
  ownerId: string;
  ownerName: string;
}

class NotificationService {
  private readonly COLLECTION_NAME = 'notifications';
  private readonly USERS_COLLECTION = 'users';

  /**
   * Create a notification for a specific user
   */
  async createNotification(notification: Omit<Notification, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), {
        ...notification,
        timestamp: serverTimestamp(),
        read: false
      });
      
      console.log('✅ Notification created:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Send a notification to all users when a new vehicle is posted
   */
  async notifyAllUsersOfNewVehicle(vehicleData: NewVehicleNotificationData): Promise<void> {
    try {
      // Get all users from the users collection
      const usersQuery = query(collection(db, this.USERS_COLLECTION));
      const userSnapshots = await getDocs(usersQuery);
      
      const notificationPromises: Promise<string>[] = [];

      userSnapshots.forEach((userDoc: QueryDocumentSnapshot<DocumentData>) => {
        const userId = userDoc.id;
        
        // Don't send notification to the vehicle owner
        if (userId === vehicleData.ownerId) {
          return;
        }

        const notification: Omit<Notification, 'id'> = {
          type: 'new_vehicle',
          title: 'New Vehicle Available for Rent',
          message: `${vehicleData.vehicleMake} is now available for rent in ${vehicleData.vehicleLocation} at R${vehicleData.weeklyRate}/week by ${vehicleData.ownerName}`,
          read: false,
          priority: 'medium',
          actionUrl: '/marketplace',
          metadata: {
            vehicleId: vehicleData.vehicleId,
            vehicleMake: vehicleData.vehicleMake,
            vehicleLocation: vehicleData.vehicleLocation,
            amount: vehicleData.weeklyRate,
            ownerId: vehicleData.ownerId,
            ownerName: vehicleData.ownerName
          },
          userId: userId,
          createdBy: vehicleData.ownerId,
          timestamp: serverTimestamp()
        };

        notificationPromises.push(this.createNotification(notification));
      });

      await Promise.all(notificationPromises);
      console.log(`✅ Sent new vehicle notifications to ${notificationPromises.length} users`);
    } catch (error) {
      console.error('❌ Error sending new vehicle notifications:', error);
      throw error;
    }
  }

  /**
   * Get notifications for a specific user with real-time updates
   */
  subscribeToUserNotifications(
    userId: string, 
    callback: (notifications: Notification[]) => void
  ): () => void {
    console.log('🔔 NotificationService: Setting up subscription for user:', userId);
    
    try {
      // First try a simple query without orderBy to see if it works
      const notificationsQuery = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId)
      );

      const unsubscribe = onSnapshot(
        notificationsQuery, 
        (snapshot) => {
          console.log('🔔 NotificationService: Query snapshot received, docs:', snapshot.docs.length);
          
          const notifications: Notification[] = snapshot.docs.map(doc => {
            const data = doc.data();
            console.log('🔔 NotificationService: Processing notification:', doc.id, data);
            return {
              id: doc.id,
              ...data
            } as Notification;
          });
          
          // Sort by timestamp manually since orderBy might need an index
          notifications.sort((a, b) => {
            const aTime = (a.timestamp && typeof a.timestamp === 'object' && 'toDate' in a.timestamp) 
              ? (a.timestamp as any).toDate() : new Date(0);
            const bTime = (b.timestamp && typeof b.timestamp === 'object' && 'toDate' in b.timestamp) 
              ? (b.timestamp as any).toDate() : new Date(0);
            return bTime.getTime() - aTime.getTime();
          });
          
          console.log('🔔 NotificationService: Calling callback with', notifications.length, 'notifications');
          callback(notifications);
        },
        (error) => {
          console.error('❌ NotificationService: Snapshot listener error:', error);
          // Call callback with empty array on error to stop loading state
          callback([]);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('❌ NotificationService: Error setting up subscription:', error);
      // Return a dummy unsubscribe function and call callback immediately
      callback([]);
      return () => {};
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, this.COLLECTION_NAME, notificationId);
      await updateDoc(notificationRef, {
        read: true
      });
      
      console.log('✅ Notification marked as read:', notificationId);
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a specific user
   */
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const notificationsQuery = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId),
        where('read', '==', false)
      );

      const snapshot = await getDocs(notificationsQuery);
      const updatePromises = snapshot.docs.map(doc => 
        updateDoc(doc.ref, { read: true })
      );

      await Promise.all(updatePromises);
      console.log(`✅ Marked ${updatePromises.length} notifications as read for user ${userId}`);
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count for a user
   */
  subscribeToUnreadCount(
    userId: string, 
    callback: (count: number) => void
  ): () => void {
    try {
      const unreadQuery = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId),
        where('read', '==', false)
      );

      const unsubscribe = onSnapshot(unreadQuery, (snapshot) => {
        callback(snapshot.size);
      });

      return unsubscribe;
    } catch (error) {
      console.error('❌ Error subscribing to unread count:', error);
      throw error;
    }
  }

  /**
   * Send a general system notification to all users
   */
  async sendSystemNotificationToAll(
    title: string,
    message: string,
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    actionUrl?: string
  ): Promise<void> {
    try {
      const usersQuery = query(collection(db, this.USERS_COLLECTION));
      const userSnapshots = await getDocs(usersQuery);
      
      const notificationPromises: Promise<string>[] = [];

      userSnapshots.forEach((userDoc: QueryDocumentSnapshot<DocumentData>) => {
        const userId = userDoc.id;
        
        const notification: Omit<Notification, 'id'> = {
          type: 'system',
          title,
          message,
          read: false,
          priority,
          actionUrl,
          userId: userId,
          timestamp: serverTimestamp()
        };

        notificationPromises.push(this.createNotification(notification));
      });

      await Promise.all(notificationPromises);
      console.log(`✅ Sent system notification to ${notificationPromises.length} users`);
    } catch (error) {
      console.error('❌ Error sending system notification:', error);
      throw error;
    }
  }

  /**
   * Create sample notifications for testing (for development only)
   */
  async createSampleNotifications(userId: string): Promise<void> {
    try {
      console.log('🧪 Creating sample notifications for user:', userId);
      
      const sampleNotifications: Omit<Notification, 'id'>[] = [
        {
          type: 'system',
          title: 'Welcome to FleetLink!',
          message: 'Your account has been set up successfully. Start exploring vehicles or list your own.',
          read: false,
          priority: 'medium',
          actionUrl: '/marketplace',
          userId: userId,
          timestamp: serverTimestamp()
        },
        {
          type: 'new_vehicle',
          title: 'New Vehicle Available',
          message: 'Toyota Corolla Quest is now available for rent in Sandton at R1200/week',
          read: false,
          priority: 'medium',
          actionUrl: '/marketplace',
          userId: userId,
          metadata: {
            vehicleMake: 'Toyota Corolla Quest',
            vehicleLocation: 'Sandton',
            amount: 1200
          },
          timestamp: serverTimestamp()
        }
      ];

      const promises = sampleNotifications.map(notification => 
        this.createNotification(notification)
      );

      await Promise.all(promises);
      console.log('✅ Sample notifications created successfully');
    } catch (error) {
      console.error('❌ Error creating sample notifications:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService; 