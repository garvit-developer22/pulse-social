# Firebase setup (do this when the app is ready on your side)

You said you will configure Firebase later. Follow this order:

## 1. Create project
1. https://console.firebase.google.com → Add project
2. Disable Google Analytics if you want (optional)

## 2. Register web app
1. Project settings → Your apps → Web
2. Copy config into `.env`:
   - VITE_FIREBASE_API_KEY
   - VITE_FIREBASE_AUTH_DOMAIN
   - VITE_FIREBASE_PROJECT_ID
   - VITE_FIREBASE_STORAGE_BUCKET
   - VITE_FIREBASE_MESSAGING_SENDER_ID
   - VITE_FIREBASE_APP_ID

## 3. Authentication
1. Build → Authentication → Get started
2. Enable **Email/Password**
3. Enable **Google** (add support email)

## 4. Firestore
1. Build → Firestore Database → Create database
2. Start in **production mode**
3. Rules tab → paste `firestore.rules` from this repo → Publish
4. If console asks for indexes, click the link it provides (especially):
   - posts: createdAt DESC
   - posts: mediaType ASC + createdAt DESC
   - posts: authorId ASC + createdAt DESC
   - notifications: recipientId ASC + createdAt DESC
   - conversations: participants ARRAY + updatedAt DESC
   - stories: expiresAt DESC
   - users: username ASC

## 5. Storage
1. Build → Storage → Get started
2. Rules → paste `storage.rules` → Publish

## 6. (Optional) Cloud Functions
Requires **Blaze** plan.
```bash
npm i -g firebase-tools
firebase login
firebase init functions
# use functions/ folder
firebase deploy --only functions
```

## 7. Test checklist
1. Sign up
2. Create post with image
3. Like + comment
4. Create story
5. Follow another test user
6. Send message
7. Check notifications

## Safety for minors / no card
Auth + Firestore + Storage often work on Spark for light use.
Functions/Blaze can wait.
