# FitReps – Project Planning & Phase Breakdown

## Project Vision

FitReps is a clean, offline-first fitness app focused on workout logging, progression, and smart suggestions.

Key principles:

* Extremely clean UI / UX (highest priority)
* Built in very small, controlled phases
* Supabase (free tier) initially, but backend-agnostic by design
* No image or video storage (text + numbers only)
* Logic-first, hype-free (no AI for now)
* Easy future migration to Node.js backend

---

## Core Tech Stack

* Framework: Expo + TypeScript
* Navigation: React Navigation (manual setup)
* Styling: NativeWind (Tailwind)
* State Management: Redux Toolkit
* Backend (initial): Supabase (Auth + DB only)
* Storage: Local-first (AsyncStorage / SQLite later)

---

## Architectural Rules (Non‑Negotiable)

* UI layer must never directly call Supabase
* All backend interaction goes through a service layer
* Auth, domain logic, and UI must be separated
* No premature optimizations or features
* One phase at a time — no leaking into future phases

---

## Suggested Folder Structure (Initial)

src/
├─ app/                 # Screens & navigation
│  ├─ auth/
│  ├─ dashboard/
│  └─ onboarding/
│
├─ components/          # Reusable UI components
│
├─ store/               # Redux store
│  ├─ slices/
│  └─ index.ts
│
├─ services/            # Backend abstraction layer
│  ├─ auth.service.ts
│  └─ session.service.ts
│
├─ domain/              # Pure business logic (no backend)
│  ├─ user/
│  └─ workout/
│
├─ lib/                 # Config & helpers
│  ├─ supabase.ts
│  └─ env.ts
│
└─ ui/                  # Design system primitives

This structure allows swapping Supabase without touching UI or domain logic.

---

# PHASE BREAKDOWN

---

## PHASE 0 – Project Foundation

### Goal

Create a stable, clean foundation with zero business logic.

### Scope

* Project runs correctly
* Navigation works
* Styling system works
* Redux store is connected

### Tasks

* Install and configure React Navigation
* Set up NativeWind
* Configure Redux Toolkit store
* Create basic app layout (SafeArea, status bar)
* Environment variable setup

### Files to Create

* src/store/index.ts
* src/lib/env.ts
* src/ui/Button.tsx
* src/ui/Text.tsx

### Do NOT

* Write auth logic
* Add Supabase logic
* Create dashboard UI

---

## PHASE 1 – Supabase Integration Layer

### Goal

Connect Supabase safely without exposing it to UI.

### Scope

* Only configuration and service abstraction

### Tasks

* Create Supabase client
* Wrap Supabase auth methods inside services
* No UI usage yet

### Files to Create

* src/lib/supabase.ts
* src/services/auth.service.ts
* src/services/session.service.ts

### Do NOT

* Call Supabase directly from screens
* Store sessions globally yet

---

## PHASE 2 – Authentication State & Session Handling

### Goal

Correctly manage user auth state across app lifecycle.

### Scope

* Redux-based auth state
* Session persistence

### Tasks

* Create auth slice (user, session, loading, error)
* Restore session on app launch
* Handle logout cleanup

### Files to Create

* src/store/slices/authSlice.ts
* src/services/session.service.ts (expanded)

### Do NOT

* Build UI screens yet
* Add password reset flows

---

## PHASE 3 – Authentication UI (Login & Register)

### Goal

Allow users to sign up and log in securely.

### Scope

* Email + Password auth only
* Clean, minimal UI

### Tasks

* Login screen UI
* Register screen UI
* Form validation
* Error handling states

### Files to Create

* src/app/auth/LoginScreen.tsx
* src/app/auth/RegisterScreen.tsx

### Do NOT

* Add OTP or forgot password yet
* Navigate to dashboard

---

## PHASE 4 – Forgot Password + OTP Flow

### Goal

Full password recovery using Supabase OTP via email.

### Scope

* Forgot password request
* OTP verification
* New password creation

### Tasks

* Forgot password screen
* OTP input screen
* New password screen
* Success + failure states

### Files to Create

* src/app/auth/ForgotPasswordScreen.tsx
* src/app/auth/OtpVerificationScreen.tsx
* src/app/auth/NewPasswordScreen.tsx

### Do NOT

* Improve UI polish
* Add animations

---

## PHASE 5 – Auth Flow Integration

### Goal

Correctly route users based on auth state.

### Scope

* Navigation guards
* Auth vs app stacks

### Tasks

* Create AuthStack and AppStack
* Redirect unauthenticated users
* Handle session expiration

### Files to Create

* src/app/navigation/AuthNavigator.tsx
* src/app/navigation/AppNavigator.tsx

### Do NOT

* Build dashboard features

---

## PHASE 6 – Basic Dashboard (Skeleton)

### Goal

Create a simple post-login landing screen.

### Scope

* Static dashboard
* Placeholder content

### Tasks

* Dashboard screen
* Header with user info
* Logout button

### Files to Create

* src/app/dashboard/DashboardScreen.tsx

### Do NOT

* Add workout logic
* Persist user data

---

## PHASE 7 – Clean UI & Design System

### Goal

Make the app feel premium and consistent.

### Scope

* UI polish only
* No logic changes

### Tasks

* Refine spacing, colors, typography
* Improve buttons and inputs
* Error & loading states

### Files to Update

* src/ui/*
* src/components/*

### Do NOT

* Add new features

---

## PHASE 8 – Local Data Models (Preparation Phase)

### Goal

Prepare foundation for workout logic.

### Scope

* Data structures only

### Tasks

* Define Workout, Exercise, Set models
* Local storage abstraction

### Files to Create

* src/domain/workout/models.ts
* src/domain/workout/storage.ts

### Do NOT

* Implement workout screens
* Add progression logic

---

## Final Notes

* Each phase must be completed and stable before moving on
* Never skip phases
* Never mix concerns across phases
* Keep commits small and meaningful

This document is the single source of truth for FitReps development.
