# Firebase Setup for FleetLink

## Prerequisites
1. Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password provider
3. Create a Firestore database

## Environment Variables
Create a `.env` file in the root directory with the following variables:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
```

## Getting Firebase Configuration
1. Go to your Firebase project settings
2. Scroll down to "Your apps" section
3. Click on the web app icon (</>)
4. Copy the config values to your `.env` file

## Firestore Security Rules
Set up these basic security rules in Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own documents
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Fleet owners can read/write their vehicles
    match /vehicles/{vehicleId} {
      allow read, write: if request.auth != null;
    }
    
    // Allow reading for marketplace functionality
    match /vehicles/{vehicleId} {
      allow read: if request.auth != null;
    }
  }
}
```

## Features Implemented
- ✅ User registration with email/password
- ✅ User login with email/password  
- ✅ User logout
- ✅ Authentication state persistence
- ✅ User profile storage in Firestore
- ✅ Role-based access (owner/driver)

## Next Steps
1. Implement vehicle data storage in Firestore
2. Add real-time updates for vehicle tracking
3. Implement payment integration
4. Add file storage for documents
5. Set up push notifications 