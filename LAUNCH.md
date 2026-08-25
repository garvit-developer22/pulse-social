# Pulse — Web launch guide (React + Firebase)

Yeh **zip / React project** hai. Sab users ke liye shared app yahi path hai.
HTML single-file alag demo tha — usse multi-user launch mat karo.

## Tumhe kya chahiye
1. Laptop / PC (Node.js 18+)
2. Firebase project (free Spark se start)
3. Netlify account (free)

## Phase 1 — Local chalana
```bash
unzip pulse-social.zip
cd pulse-social
npm install
cp .env.example .env
```
`.env` mein Firebase **web** keys bharo (Console → Project settings → Your apps).

```bash
npm run dev
```
Browser: http://localhost:5173

## Phase 2 — Firebase (zaroori multi-user ke liye)
1. Authentication → Email/Password + Google ON
2. Firestore → create database
3. Storage → enable
4. `firestore.rules` + `storage.rules` publish
5. Indexes: console jo link de, Allow

Detail: `FIREBASE_SETUP.md`

## Phase 3 — Netlify web launch
```bash
npm run build
```
Netlify:
- New site → import ya drag `dist` folder
- Ya Git connect: build `npm run build`, publish `dist`
- `netlify.toml` already SPA redirects handle karta hai

Env vars Netlify pe bhi same `VITE_FIREBASE_*` set karo.

## Phase 4 — Baad mein app
Web stable ke baad:
- PWA (manifest pehle se hai)
- Capacitor / TWA se Android wrapper
- Play Store alag process (privacy policy, signing)

## Honest status
Working now (with Firebase):
- Auth, feed, create post, likes/comments/saves
- Stories upload, explore, reels list, messages, notifications, follow

Still improve over time:
- Admin dashboard UI
- Push notifications (FCM)
- Heavy moderation Cloud Functions (Blaze)

## Rule
Isi **pulse-social** folder pe kaam karo.
`pulse-index.html` sirf offline demo tha — launch ke liye React zip use karo.


## Images: Cloudinary (no Firebase Storage needed)
.env already has:
- VITE_CLOUDINARY_CLOUD_NAME
- VITE_CLOUDINARY_UPLOAD_PRESET (unsigned)

Create post / story uploads go to Cloudinary; Firestore stores the image URL.
