import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth } from '../config/firebase';
import { db } from '../config/firebase';

// Function to setup admin user
export const setupAdminUser = async (uid: string, email: string) => {
  try {
    console.log('🔧 Setting up admin user...', { uid, email });
    
    const adminData = {
      id: uid,
      email: email,
      name: 'Administrator',
      role: 'admin',
      verified: true,
      isAdmin: true,
      createdAt: new Date().toISOString()
    };
    
    // Set the document (this will create or overwrite)
    await setDoc(doc(db, 'users', uid), adminData);
    console.log('✅ Admin user profile created/updated successfully');
    
    return adminData;
  } catch (error) {
    console.error('❌ Error setting up admin user:', error);
    throw error;
  }
};

// Function to check current user status
export const checkUserStatus = async (uid: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('👤 Current user data:', userData);
      return userData;
    } else {
      console.log('❌ User document does not exist');
      return null;
    }
  } catch (error) {
    console.error('❌ Error checking user status:', error);
    throw error;
  }
};

// Convenient function to fix admin access for current user
export const fixAdminAccess = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('❌ No user is currently logged in');
      return false;
    }
    
    if (currentUser.email !== 'admin@yow.com') {
      console.error('❌ Current user is not the admin email (admin@yow.com)');
      return false;
    }
    
    console.log('🔧 Fixing admin access for current user...');
    await setupAdminUser(currentUser.uid, currentUser.email);
    console.log('✅ Admin access fixed! Please log out and log back in.');
    return true;
  } catch (error) {
    console.error('❌ Error fixing admin access:', error);
    return false;
  }
};

// Make functions available globally for console access
if (typeof window !== 'undefined') {
  (window as any).setupAdminUser = setupAdminUser;
  (window as any).checkUserStatus = checkUserStatus;
  (window as any).fixAdminAccess = fixAdminAccess;
} 