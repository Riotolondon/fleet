import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'driver';
  avatar?: string;
  phone?: string;
  verified: boolean;
  createdAt: string;
}

// TEMPORARY: Using real Firebase (hardcoded config)
const isDemoMode = false;

export const authService = {
  // Sign up with email and password
  async signUp(email: string, password: string, name: string, role: 'owner' | 'driver', phone?: string): Promise<User> {
    console.log('🔥 Starting signup process...', { email, name, role, isDemoMode });
    
    if (isDemoMode) {
      // Demo mode - return mock user
      console.log('📱 Demo mode: creating mock user');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
      return {
        id: Date.now().toString(),
        email,
        name,
        role,
        phone,
        verified: false,
        createdAt: new Date().toISOString()
      };
    }
    
    try {
      console.log('🔥 Creating Firebase user...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      console.log('✅ Firebase user created:', firebaseUser.uid);
      
      // Update the user's display name
      console.log('📝 Updating profile...');
      await updateProfile(firebaseUser, { displayName: name });
      
      // Create user document in Firestore
      const userData: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        name,
        role,
        phone,
        verified: false,
        createdAt: new Date().toISOString()
      };
      
      console.log('💾 Saving user data to Firestore...', userData);
      
      // Add retry logic for Firestore writes
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          await setDoc(doc(db, 'users', firebaseUser.uid), userData);
          console.log('✅ User data saved to Firestore');
          break;
        } catch (firestoreError: any) {
          retryCount++;
          console.warn(`⚠️ Firestore write attempt ${retryCount} failed:`, firestoreError.message);
          
          if (retryCount >= maxRetries) {
            console.error('❌ Failed to save user data after', maxRetries, 'attempts');
            // Still return the user data even if Firestore write fails
            console.log('🔄 Proceeding without Firestore save - user can try again later');
          } else {
            // Wait briefly before retry
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
        }
      }
      
      return userData;
    } catch (error: any) {
      console.error('❌ Signup error:', error);
      throw new Error(error.message);
    }
  },

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<User> {
    if (isDemoMode) {
      // Demo mode - simulate login
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        id: '1',
        email,
        name: email.includes('owner') ? 'Demo Owner' : 'Demo Driver',
        role: email.includes('owner') ? 'owner' : 'driver',
        verified: true,
        createdAt: new Date().toISOString()
      };
    }
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Get user data from Firestore with error handling
      try {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        
        if (!userDoc.exists()) {
          throw new Error('User data not found in Firestore');
        }
        
        return userDoc.data() as User;
      } catch (firestoreError: any) {
        console.error('❌ Failed to get user data from Firestore:', firestoreError.message);
        
        // Fallback: return basic user data from Firebase Auth
        console.log('🔄 Using fallback user data from Firebase Auth');
        return {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          name: firebaseUser.displayName || 'User',
          role: 'driver', // Default role - user may need to update this
          verified: firebaseUser.emailVerified,
          createdAt: firebaseUser.metadata.creationTime || new Date().toISOString()
        };
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Sign out
  async signOut(): Promise<void> {
    if (isDemoMode) {
      // Demo mode - just resolve
      return Promise.resolve();
    }
    
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get user data from Firestore
  async getUserData(uid: string): Promise<User | null> {
    if (isDemoMode) {
      return null; // Let auth state listener handle demo mode
    }
    
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      return userDoc.exists() ? userDoc.data() as User : null;
    } catch (error: any) {
      console.error('❌ Error getting user data from Firestore:', error.message);
      console.log('🔄 This might be due to Firestore security rules or connection issues');
      return null;
    }
  },

  // Update user profile
  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    if (isDemoMode) {
      // Demo mode - return mock updated user
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        id: userId,
        email: 'demo@example.com',
        name: updates.name || 'Demo User',
        role: 'driver',
        phone: updates.phone,
        verified: false,
        createdAt: new Date().toISOString()
      };
    }

    try {
      console.log('👤 Updating user profile...', { userId, updates });
      
      // Get current user data first
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      
      const currentData = userDoc.data() as User;
      
      // Prepare the update data
      const updateData = {
        ...updates,
        // Preserve fields that shouldn't be updated
        id: currentData.id,
        email: currentData.email,
        role: currentData.role,
        verified: currentData.verified,
        createdAt: currentData.createdAt
      };

      // Update Firestore document
      await updateDoc(doc(db, 'users', userId), updateData);
      console.log('✅ Firestore profile updated successfully');

      // Update Firebase Auth profile if name changed
      if (updates.name && auth.currentUser) {
        await updateProfile(auth.currentUser, { 
          displayName: updates.name 
        });
        console.log('✅ Firebase Auth profile updated successfully');
      }

      // Return updated user data
      const updatedData = { ...currentData, ...updateData };
      console.log('👤 Profile update completed:', updatedData);
      return updatedData;

    } catch (error: any) {
      console.error('❌ Profile update failed:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
  },

  // Listen to auth state changes
  onAuthStateChanged: (callback: (user: FirebaseUser | null) => void) => {
    if (isDemoMode) {
      // Demo mode - don't actually listen to Firebase auth
      return () => {}; // Return empty unsubscribe function
    }
    return onAuthStateChanged(auth, callback);
  }
}; 