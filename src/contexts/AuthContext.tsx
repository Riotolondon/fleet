import { createContext, useContext, useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { authService, User } from '../services/authService';
import { userService } from '../services/userService';

// Re-export User interface for backward compatibility
export type { User } from '../services/authService';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role: 'owner' | 'driver', phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TEMPORARY: Using real Firebase (hardcoded config)
    console.log('🔐 AuthContext: Initializing with real Firebase...');

    // Real Firebase mode - Listen to authentication state changes
    const unsubscribe = authService.onAuthStateChanged(async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // User is signed in, get their data from Firestore
        console.log('👤 AuthContext: Firebase user found, loading data...', firebaseUser.uid);
        const userData = await authService.getUserData(firebaseUser.uid);
        setUser(userData);
        
        // Start presence tracking for the user
        if (userData) {
          try {
            // Ensure user profile exists in userService first (skip for admin users)
            if (userData.role !== 'admin') {
              const existingProfile = await userService.getUserProfile(userData.id);
              if (!existingProfile) {
                console.log('🔄 AuthContext: User profile not found, initializing...');
                await userService.initializeUserProfile(userData.id, {
                  name: userData.name,
                  email: userData.email,
                  role: userData.role,
                  phone: userData.phone
                });
              }
            }
            
            await userService.startPresenceTracking(userData.id, userData.name);
            console.log('✅ AuthContext: Presence tracking started');
          } catch (error) {
            console.warn('⚠️ AuthContext: Failed to start presence tracking:', error);
          }
        }
      } else {
        // User is signed out
        console.log('🚪 AuthContext: No Firebase user found');
        
        // Stop presence tracking
        try {
          await userService.stopPresenceTracking();
          console.log('✅ AuthContext: Presence tracking stopped');
        } catch (error) {
          console.warn('⚠️ AuthContext: Failed to stop presence tracking:', error);
        }
        
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    console.log('🔐 AuthContext: Starting login...', { email });
    setLoading(true);
    try {
      const userData = await authService.signIn(email, password);
      console.log('✅ AuthContext: Login successful, setting user:', userData);
      setUser(userData);
      
      // Start presence tracking
      try {
        // Ensure user profile exists in userService first (skip for admin users)
        if (userData.role !== 'admin') {
          const existingProfile = await userService.getUserProfile(userData.id);
          if (!existingProfile) {
            console.log('🔄 AuthContext: User profile not found during login, initializing...');
            await userService.initializeUserProfile(userData.id, {
              name: userData.name,
              email: userData.email,
              role: userData.role,
              phone: userData.phone
            });
          }
        }
        
        await userService.startPresenceTracking(userData.id, userData.name);
        console.log('✅ AuthContext: Presence tracking started for login');
      } catch (error) {
        console.warn('⚠️ AuthContext: Failed to start presence tracking on login:', error);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('❌ AuthContext: Login failed:', error);
      setLoading(false);
      throw error;
    }
  };

  const signup = async (
    email: string, 
    password: string, 
    name: string, 
    role: 'owner' | 'driver',
    phone?: string
  ): Promise<void> => {
    console.log('🔐 AuthContext: Starting signup...', { email, name, role });
    setLoading(true);
    try {
      const userData = await authService.signUp(email, password, name, role, phone);
      console.log('✅ AuthContext: Signup successful, setting user:', userData);
      setUser(userData);
      
      // Initialize user profile in userService and start presence tracking
      try {
        // Only initialize user profile for non-admin users
        if (userData.role !== 'admin') {
          await userService.initializeUserProfile(userData.id, {
            name: userData.name,
            email: userData.email,
            role: userData.role,
            phone: userData.phone
          });
        }
        
        await userService.startPresenceTracking(userData.id, userData.name);
        console.log('✅ AuthContext: User profile initialized and presence tracking started');
      } catch (error) {
        console.warn('⚠️ AuthContext: Failed to initialize user profile or start presence:', error);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('❌ AuthContext: Signup failed:', error);
      setLoading(false);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('🚪 AuthContext: Signing out...');
      
      // Stop presence tracking first
      try {
        await userService.stopPresenceTracking();
        console.log('✅ AuthContext: Presence tracking stopped for logout');
      } catch (error) {
        console.warn('⚠️ AuthContext: Failed to stop presence tracking on logout:', error);
      }
      
      await authService.signOut();
      setUser(null);
      console.log('✅ AuthContext: Logout successful');
    } catch (error) {
      console.error('❌ AuthContext: Logout failed:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<void> => {
    if (!user) {
      throw new Error('No user is currently signed in');
    }

    console.log('👤 AuthContext: Starting profile update...', updates);
    try {
      const updatedUser = await authService.updateProfile(user.id, updates);
      console.log('✅ AuthContext: Profile update successful, updating user state:', updatedUser);
      setUser(updatedUser);
    } catch (error) {
      console.error('❌ AuthContext: Profile update failed:', error);
      throw error;
    }
  };

  const value = {
    user,
    login,
    signup,
    logout,
    updateProfile,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};