# Firebase Configuration for Push Notifications

## Required Environment Variables

Add these to your `.env.local` file:

```bash
# Firebase Configuration
# Get these values from Firebase Console > Project Settings > General
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# VAPID Key for Web Push
# Generate this in Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key_here

# API URL
NEXT_PUBLIC_API_URL=http://localhost:3003/api
```

## Setup Instructions

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (viora-887d7)
3. Go to Project Settings > General
4. Copy the Firebase configuration values
5. Go to Project Settings > Cloud Messaging
6. Generate a new Web Push certificate (VAPID key)
7. Update `public/firebase-messaging-sw.js` with your Firebase config
8. Add all values to `.env.local`
