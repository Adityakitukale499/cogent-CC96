# TripVerse — Travel booking app (React + TS + Firebase)

A MakeMyTrip-style travel booking demo with **customer** and **vendor** roles, built with **React + TypeScript + Vite + Tailwind + Firebase**.

## Features (matches the brief)

1. **Customer can sign up, log in, and book a service.**
   Sign-up flow uses Firebase **phone OTP** verification. After login, customers browse hotels / flights / cabs / packages and place bookings.
2. **Vendor can accept a booking and mark it delivered.**
   Vendors get a dashboard with status tabs (Pending / Accepted / Delivered), one-click `Accept` and `Mark delivered`, and an "Add listing" modal.
3. **Customer sign-up uses OTP** — Firebase `signInWithPhoneNumber` + invisible reCAPTCHA.

## Tech stack

- **React 18 + TypeScript** with **Vite**
- **Tailwind CSS** for the MakeMyTrip-style UI (gradients, hero search, cards)
- **Firebase Auth** — phone OTP for customers, email/password for vendors
- **Firestore** — `users`, `services`, `bookings` collections (real-time updates via `onSnapshot`)
- **react-router-dom** for routing, **lucide-react** for icons

## Project layout

```
src/
├── components/        Navbar, Hero, ServiceCard, BookingStatusBadge, ProtectedRoute, Footer
├── contexts/          AuthContext — exposes firebaseUser, profile (role), signOut
├── firebase/          config.ts (initializes app, auth, firestore from env vars)
├── pages/             Home, Services, ServiceDetail, Login, CustomerSignup,
│                      VendorLogin, CustomerDashboard, VendorDashboard
├── services/          bookings.ts (Firestore CRUD), seed.ts (sample listings)
├── types/             Shared TS types (UserProfile, Service, Booking)
├── App.tsx            Routes + protected routes
├── main.tsx           Root + AuthProvider + BrowserRouter
└── index.css          Tailwind layers + gradient/utility classes
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Firebase project

1. Go to <https://console.firebase.google.com/> and **create a project**.
2. **Add a Web app** — copy the config snippet.
3. In **Authentication → Sign-in method**, enable:
   - **Phone** (required for customer OTP)
   - **Email/Password** (required for vendor login)
4. In **Authentication → Settings → Authorized domains**, make sure `localhost` is listed.
5. In **Firestore Database → Create database**, start in **test mode** for the demo (or set rules — see below).

### 3. Wire up env variables

```bash
copy .env.example .env.local        # Windows
# or: cp .env.example .env.local    # macOS/Linux
```

Open `.env.local` and paste the values from your Firebase web app config:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 4. Run the dev server

```bash
npm run dev
```

The app will open at <http://localhost:5173>.

> **First run:** the Home / Services pages auto-seed a few demo listings into Firestore so you can see the UI populated.

## Trying the flows

### Customer (phone OTP)

1. Go to **Sign up**.
2. Enter your name and phone number in international format (e.g. `+919999999999`).
3. Firebase sends a 6-digit OTP via SMS — enter it to verify.
4. You'll land on the **Services** page → pick a listing → **Book now**.
5. **My Bookings** shows the live status of every booking you've placed.

> **Tip — testing without real SMS:** in Firebase Console → Authentication → Sign-in method → Phone → **Phone numbers for testing**, add a phone number and a fixed 6-digit code. Use that pair in the app to bypass SMS delivery.

### Vendor (email/password)

1. Go to **List your business** (top-right) → **Register** tab.
2. Create a vendor account with business name + email + password.
3. You'll land on the **Vendor dashboard**:
   - **Add new listing** → publish a hotel / flight / cab / package.
   - Incoming customer bookings appear in **Pending** → click **Accept booking**.
   - Once delivered, click **Mark as delivered**.

The customer's **My Bookings** page reflects all status changes in real time.

## Suggested Firestore security rules (for production)

The seed/demo uses test mode. Before deploying, tighten rules — minimal example:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    match /users/{uid} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == uid;
    }
    match /services/{id} {
      allow read: if true;
      allow create, update, delete:
        if request.auth != null && request.resource.data.vendorId == request.auth.uid;
    }
    match /bookings/{id} {
      allow read: if request.auth != null && (
        resource.data.customerId == request.auth.uid ||
        resource.data.vendorId == request.auth.uid
      );
      allow create: if request.auth != null && request.resource.data.customerId == request.auth.uid;
      allow update: if request.auth != null && resource.data.vendorId == request.auth.uid;
    }
  }
}
```

## Build for production

```bash
npm run build
npm run preview
```

## Notes

- Phone OTP uses an **invisible reCAPTCHA** mounted on the signup/login pages. Make sure `localhost` is in Firebase's authorized domains.
- All Firestore reads on the dashboards are **real-time** — accept a booking as a vendor and watch it update instantly on the customer's screen.
- Demo seed images come from Unsplash; replace with your own assets when going to production.
# cogent-CC96
