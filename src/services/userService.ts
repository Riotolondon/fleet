import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  serverTimestamp, 
  deleteField,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'driver';
  phone?: string;
  location?: string;
  avatar?: string;
  bio?: string;
  createdAt: any;
  updatedAt: any;
  
  // Online presence
  isOnline: boolean;
  lastSeen: any;
  status: 'online' | 'away' | 'busy' | 'offline';
  
  // Chat preferences
  chatSettings: {
    allowMessagesFrom: 'everyone' | 'verified-only' | 'friends-only';
    showOnlineStatus: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
  };
  
  // Statistics
  stats: {
    totalConversations: number;
    totalMessages: number;
    responseTime: number; // Average response time in minutes
    rating: number;
    totalRatings: number;
  };
  
  // Verification
  isVerified: boolean;
  verificationBadges: string[]; // 'email', 'phone', 'identity', 'background-check'
}

export interface OnlineUser {
  id: string;
  name: string;
  role: 'owner' | 'driver';
  avatar?: string;
  status: 'online' | 'away' | 'busy';
  lastSeen: any;
  isTyping?: boolean;
  currentActivity?: string;
}

class UserService {
  private readonly USERS_COLLECTION = 'users';
  private readonly PRESENCE_COLLECTION = 'userPresence';
  private readonly ONLINE_USERS_COLLECTION = 'onlineUsers';
  
  private presenceUpdateInterval: NodeJS.Timeout | null = null;
  private currentUserId: string | null = null;

  /**
   * Initialize user profile (called during signup/login)
   */
  async initializeUserProfile(
    userId: string, 
    userData: {
      name: string;
      email: string;
      role: 'owner' | 'driver';
      phone?: string;
    }
  ): Promise<void> {
    try {
      const userProfile: Omit<UserProfile, 'id'> = {
        name: userData.name,
        email: userData.email,
        role: userData.role,
        phone: userData.phone,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        isOnline: true,
        lastSeen: serverTimestamp(),
        status: 'online',
        
        chatSettings: {
          allowMessagesFrom: 'everyone',
          showOnlineStatus: true,
          emailNotifications: true,
          pushNotifications: true
        },
        
        stats: {
          totalConversations: 0,
          totalMessages: 0,
          responseTime: 0,
          rating: 0,
          totalRatings: 0
        },
        
        isVerified: false,
        verificationBadges: ['email'] // Email verified during signup
      };

      await setDoc(doc(db, this.USERS_COLLECTION, userId), userProfile);
      console.log('✅ User profile initialized:', userId);
    } catch (error) {
      console.error('❌ Error initializing user profile:', error);
      throw error;
    }
  }

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, this.USERS_COLLECTION, userId));
      
      if (userDoc.exists()) {
        return {
          id: userDoc.id,
          ...userDoc.data()
        } as UserProfile;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error getting user profile:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    userId: string, 
    updates: Partial<Omit<UserProfile, 'id' | 'createdAt'>>
  ): Promise<void> {
    try {
      await updateDoc(doc(db, this.USERS_COLLECTION, userId), {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ User profile updated:', userId);
    } catch (error) {
      console.error('❌ Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Start tracking online presence for a user
   */
  async startPresenceTracking(userId: string, userName: string): Promise<void> {
    try {
      this.currentUserId = userId;
      
      // Get user profile to include role information
      const userProfile = await this.getUserProfile(userId);
      
      // Set user as online
      await this.setUserOnlineStatus(userId, 'online');
      
      // Update online users collection with role information
      await setDoc(doc(db, this.ONLINE_USERS_COLLECTION, userId), {
        userId,
        name: userName,
        role: userProfile?.role || 'driver', // Include role for filtering
        status: 'online',
        lastSeen: serverTimestamp(),
        connectedAt: serverTimestamp()
      });

      // Start periodic presence updates
      this.presenceUpdateInterval = setInterval(() => {
        this.updatePresenceHeartbeat(userId);
      }, 30000); // Update every 30 seconds

      // Handle page visibility changes
      this.setupVisibilityTracking(userId);
      
      // Handle page unload
      window.addEventListener('beforeunload', () => {
        this.stopPresenceTracking(userId);
      });

      console.log('✅ Presence tracking started for user:', userId, {
        name: userName,
        role: userProfile?.role,
        onlineUsersCollection: this.ONLINE_USERS_COLLECTION
      });
    } catch (error) {
      console.error('❌ Error starting presence tracking:', error);
    }
  }

  /**
   * Stop tracking online presence
   */
  async stopPresenceTracking(userId?: string): Promise<void> {
    const targetUserId = userId || this.currentUserId;
    if (!targetUserId) return;

    try {
      // Clear interval
      if (this.presenceUpdateInterval) {
        clearInterval(this.presenceUpdateInterval);
        this.presenceUpdateInterval = null;
      }

      // Set user as offline
      await this.setUserOnlineStatus(targetUserId, 'offline');
      
      // Remove from online users collection
      await updateDoc(doc(db, this.ONLINE_USERS_COLLECTION, targetUserId), {
        status: 'offline',
        lastSeen: serverTimestamp(),
        disconnectedAt: serverTimestamp()
      });

      console.log('✅ Presence tracking stopped for user:', targetUserId);
    } catch (error) {
      console.error('❌ Error stopping presence tracking:', error);
    }
  }

  /**
   * Set user online status
   */
  private async setUserOnlineStatus(
    userId: string, 
    status: 'online' | 'away' | 'busy' | 'offline'
  ): Promise<void> {
    try {
      await updateDoc(doc(db, this.USERS_COLLECTION, userId), {
        status,
        isOnline: status !== 'offline',
        lastSeen: serverTimestamp()
      });
    } catch (error) {
      console.error('❌ Error setting user online status:', error);
    }
  }

  /**
   * Update presence heartbeat
   */
  private async updatePresenceHeartbeat(userId: string): Promise<void> {
    try {
      await updateDoc(doc(db, this.ONLINE_USERS_COLLECTION, userId), {
        lastSeen: serverTimestamp()
      });
    } catch (error) {
      console.error('❌ Error updating presence heartbeat:', error);
    }
  }

  /**
   * Setup visibility tracking for away status
   */
  private setupVisibilityTracking(userId: string): void {
    let awayTimeout: NodeJS.Timeout;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User switched tabs or minimized window
        awayTimeout = setTimeout(() => {
          this.setUserOnlineStatus(userId, 'away');
          updateDoc(doc(db, this.ONLINE_USERS_COLLECTION, userId), {
            status: 'away'
          });
        }, 60000); // Set as away after 1 minute
      } else {
        // User came back
        clearTimeout(awayTimeout);
        this.setUserOnlineStatus(userId, 'online');
        updateDoc(doc(db, this.ONLINE_USERS_COLLECTION, userId), {
          status: 'online',
          lastSeen: serverTimestamp()
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
  }

  /**
   * Get all users for messaging
   */
  async getAllUsers(currentUserId: string): Promise<UserProfile[]> {
    try {
      const usersQuery = query(
        collection(db, this.USERS_COLLECTION),
        orderBy('name', 'asc')
      );

      const snapshot = await getDocs(usersQuery);
      const users = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as UserProfile))
        .filter(user => user.id !== currentUserId); // Exclude current user

      console.log('✅ Retrieved all users:', users.length);
      return users;
    } catch (error) {
      console.error('❌ Error getting all users:', error);
      return [];
    }
  }

  /**
   * Subscribe to online users with real-time updates
   */
  subscribeToOnlineUsers(
    currentUserId: string,
    callback: (users: OnlineUser[]) => void
  ): () => void {
    try {
      console.log('🔄 Setting up online users subscription for:', currentUserId);
      
      // Simplified query without orderBy to avoid index issues
      const onlineUsersQuery = query(
        collection(db, this.ONLINE_USERS_COLLECTION),
        where('status', 'in', ['online', 'away', 'busy'])
      );

      return onSnapshot(onlineUsersQuery, (snapshot) => {
        console.log('📡 Online users snapshot received:', {
          size: snapshot.size,
          docs: snapshot.docs.length,
          empty: snapshot.empty
        });

        const onlineUsers: OnlineUser[] = snapshot.docs
          .map(doc => {
            const data = doc.data();
            console.log('👤 Processing online user:', doc.id, data);
            return {
              id: doc.id,
              name: data.name,
              role: data.role || 'driver',
              avatar: data.avatar,
              status: data.status,
              lastSeen: data.lastSeen,
              currentActivity: data.currentActivity
            };
          })
          .filter(user => user.id !== currentUserId) // Exclude current user
          .sort((a, b) => {
            // Sort by lastSeen client-side instead of server-side
            if (a.lastSeen && b.lastSeen) {
              return b.lastSeen.toDate() - a.lastSeen.toDate();
            }
            return 0;
          });

        console.log('👥 Final online users list:', {
          count: onlineUsers.length,
          users: onlineUsers.map(u => ({ id: u.id, name: u.name, status: u.status }))
        });
        callback(onlineUsers);
      }, (error) => {
        console.error('❌ Error in online users subscription:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          collection: this.ONLINE_USERS_COLLECTION
        });
        callback([]);
      });
    } catch (error) {
      console.error('❌ Error subscribing to online users:', error);
      return () => {};
    }
  }

  /**
   * Subscribe to all users with real-time updates
   */
  subscribeToAllUsers(
    currentUserId: string,
    callback: (users: UserProfile[]) => void
  ): () => void {
    try {
      const usersQuery = query(
        collection(db, this.USERS_COLLECTION),
        orderBy('name', 'asc')
      );

      return onSnapshot(usersQuery, (snapshot) => {
        const users = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          } as UserProfile))
          .filter(user => user.id !== currentUserId); // Exclude current user

        console.log('👤 All users updated:', users.length);
        callback(users);
      }, (error) => {
        console.error('❌ Error in users subscription:', error);
        callback([]);
      });
    } catch (error) {
      console.error('❌ Error subscribing to all users:', error);
      return () => {};
    }
  }

  /**
   * Search users by name, email, or role
   */
  async searchUsers(
    searchTerm: string,
    currentUserId: string,
    filters?: {
      role?: 'owner' | 'driver';
      onlineOnly?: boolean;
      verifiedOnly?: boolean;
    }
  ): Promise<UserProfile[]> {
    try {
      let usersQuery = query(
        collection(db, this.USERS_COLLECTION),
        orderBy('name', 'asc')
      );

      // Apply role filter
      if (filters?.role) {
        usersQuery = query(
          collection(db, this.USERS_COLLECTION),
          where('role', '==', filters.role),
          orderBy('name', 'asc')
        );
      }

      const snapshot = await getDocs(usersQuery);
      let users = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as UserProfile))
        .filter(user => user.id !== currentUserId);

      // Apply text search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        users = users.filter(user =>
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          (user.location && user.location.toLowerCase().includes(searchLower))
        );
      }

      // Apply online filter
      if (filters?.onlineOnly) {
        users = users.filter(user => user.isOnline);
      }

      // Apply verified filter
      if (filters?.verifiedOnly) {
        users = users.filter(user => user.isVerified);
      }

      console.log('🔍 User search results:', users.length);
      return users;
    } catch (error) {
      console.error('❌ Error searching users:', error);
      return [];
    }
  }

  /**
   * Update user activity status
   */
  async updateUserActivity(
    userId: string, 
    activity: string | null
  ): Promise<void> {
    try {
      const updates: any = {
        lastSeen: serverTimestamp()
      };

      if (activity) {
        updates.currentActivity = activity;
      } else {
        updates.currentActivity = deleteField();
      }

      await updateDoc(doc(db, this.ONLINE_USERS_COLLECTION, userId), updates);
    } catch (error) {
      console.error('❌ Error updating user activity:', error);
    }
  }

  /**
   * Get user statistics for chat system
   */
  async getUserChatStats(userId: string): Promise<{
    totalConversations: number;
    totalMessages: number;
    onlineUsers: number;
    recentActivity: any[];
  }> {
    try {
      const userProfile = await this.getUserProfile(userId);
      
      // Get online users count
      const onlineUsersQuery = query(
        collection(db, this.ONLINE_USERS_COLLECTION),
        where('status', 'in', ['online', 'away', 'busy'])
      );
      const onlineSnapshot = await getDocs(onlineUsersQuery);
      
      return {
        totalConversations: userProfile?.stats.totalConversations || 0,
        totalMessages: userProfile?.stats.totalMessages || 0,
        onlineUsers: onlineSnapshot.size,
        recentActivity: [] // TODO: Implement recent activity tracking
      };
    } catch (error) {
      console.error('❌ Error getting user chat stats:', error);
      return {
        totalConversations: 0,
        totalMessages: 0,
        onlineUsers: 0,
        recentActivity: []
      };
    }
  }

  /**
   * Block/unblock a user
   */
  async toggleUserBlock(
    currentUserId: string, 
    targetUserId: string, 
    block: boolean
  ): Promise<void> {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, currentUserId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const currentBlocked = userDoc.data().blockedUsers || [];
        let updatedBlocked;
        
        if (block) {
          updatedBlocked = [...currentBlocked, targetUserId];
        } else {
          updatedBlocked = currentBlocked.filter((id: string) => id !== targetUserId);
        }
        
        await updateDoc(userRef, {
          blockedUsers: updatedBlocked,
          updatedAt: serverTimestamp()
        });
        
        console.log(`✅ User ${block ? 'blocked' : 'unblocked'}:`, targetUserId);
      }
    } catch (error) {
      console.error('❌ Error toggling user block:', error);
      throw error;
    }
  }

  /**
   * Manual test function to check online users collection
   * Call from browser console: window.userService.testOnlineUsers()
   */
  async testOnlineUsers(): Promise<void> {
    try {
      console.log('🧪 Testing online users collection...');
      
      // Get all documents from online users collection
      const snapshot = await getDocs(collection(db, this.ONLINE_USERS_COLLECTION));
      
      console.log('📊 Online Users Collection Status:', {
        totalDocs: snapshot.size,
        docs: snapshot.docs.map(doc => ({
          id: doc.id,
          data: doc.data()
        }))
      });
      
      // Test adding a manual entry
      const testUserId = 'test-user-' + Date.now();
      await setDoc(doc(db, this.ONLINE_USERS_COLLECTION, testUserId), {
        userId: testUserId,
        name: 'Test User',
        role: 'driver',
        status: 'online',
        lastSeen: serverTimestamp(),
        connectedAt: serverTimestamp()
      });
      
      console.log('✅ Test user added to online collection');
      
      // Clean up test user after 5 seconds
      setTimeout(async () => {
        try {
          await updateDoc(doc(db, this.ONLINE_USERS_COLLECTION, testUserId), {
            status: 'offline'
          });
          console.log('🧹 Test user cleaned up');
        } catch (error) {
          console.warn('Warning: Could not clean up test user:', error);
        }
      }, 5000);
      
    } catch (error) {
      console.error('❌ Error testing online users:', error);
    }
  }
}

export const userService = new UserService();

// Expose userService globally for debugging
if (typeof window !== 'undefined') {
  (window as any).userService = userService;
}

export default userService; 