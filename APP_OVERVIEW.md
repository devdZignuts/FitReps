# FitReps – App Features & Detailed User Flow

FitReps is a premium, logic-first fitness application designed for serious trainees who want a streamlined, data-driven experience for logging workouts and managing training programs.

---

## 🚀 Key Features

### 1. Unified User Onboarding
- **Personalized Setup**: A multi-step flow that captures:
    - **Primary Goal**: (Lose Fat, Build Muscle, Body Recomp, Strength, General Fitness).
    - **Experience Level**: (Beginner, Intermediate, Advanced) to tailor volume.
    - **Personal Metrics**: Gender, Date of Birth, Weight (kg), and Height (cm).
- **Auto-Routing**: New users are automatically funnelled into onboarding, while returning users land straight on the Dashboard.

### 2. Intelligent Dashboard (Daily Hub)
- **Snapshot Progress**: View cumulative stats, active program name, and weight trends.
- **Dynamic "Today's Focus"**: Displays the scheduled workout for the current day.
- **Pulsing Play Button**: A high-visibility, animated button that takes you directly into your active workout session.
- **Quick Weight Logging**: Fast entry for daily body weight tracking.

### 3. Advanced Program Builder
- **Science-Based Splits**: Choose from pre-defined "Official Programs" (e.g., Push/Pull/Legs).
- **Custom Weekly Builder**: Design your own 7-day training pattern (e.g., custom rest days and workout types).
- **Schedule Generation**: Automatically generates a multi-week calendar of workouts based on your chosen split.
- **Program Abortion**: Safely end a current program to start a new one, with automatic cleanup of future scheduled sessions.

### 4. Direct & Manual Workout Logging
- **Routine-Based Auto-Fill**: Starts a workout with pre-selected exercises based on your program's daily focus (e.g., "Legs - Quad Focus").
- **Manual Construction**: Build a workout on the fly by selecting muscle groups (interactive body map) and specific exercises.
- **Progression Tracking**: Views your "Last Set" performance (weight/reps) while logging new sets to ensure progressive overload.

### 5. Profile & Goals Management
- **Detailed Profile**: A centralized view of all your onboarding data.
- **Direct Goal Editing**: Update your primary fitness objective at any time.
- **Secure Authentication**: Robust session management and conditional navigation.

---

## 🔄 Detailed User Flow

### Phase 1: Authentication & Entry
1.  **Launch**: App checks for an existing session via `sessionService`.
2.  **Auth Path**: If not logged in, user sees `Login` / `Register`.
3.  **Onboarding Logic**: Once logged in, the `AppNavigator` checks the `is_onboarded` flag in the user profile.
    -   **New User**: Directed to `OnboardingScreen`. Steps through Goal -> Experience -> Metrics.
    -   **Returning User**: Directed immediately to `DashboardScreen`.

### Phase 2: The Daily Hub (Dashboard)
1.  **Assessment**: User sees their "Progress" card at the top.
2.  **Action Choice**:
    -   **Scheduled Workout**: Tap the **Pulsing Play Button** to open `WorkoutDetailScreen` for today’s pre-planned session.
    -   **Manual Session**: Tap "Log Manual Workout" to go to `TemplateSelect` or `MuscleSelect`.
    -   **Weight Log**: Enter body weight in the quick-log component.
    -   **Profile**: Tap "Profile" in the header to view settings.

### Phase 3: Building a Program
1.  **Trigger**: User navigates to the **Program Builder** (from Sidebar or Dashboard).
2.  **Split Selection**: User chooses a split (e.g., "Upper/Lower").
3.  **Customization**:
    -   If "Custom" is chosen, user defines Mo-Su (Workout Type or Rest).
3.  **Duration**: Select program length (4, 8, or 12 weeks).
4.  **Finalize**: Engine generates the 100% accurate schedule in the database and redirects user to the Dashboard.

### Phase 4: The Workout Session
1.  **Navigation**: User enters `WorkoutDetailScreen`.
2.  **Initialization**: 
    -   If it's a routine workout, the list of exercises is auto-populated.
    -   If manual, user first picks Muscles -> Exercises.
3.  **Logging**: 
    -   User taps an exercise to expand it.
    -   System displays "Last Session" data for that specific exercise.
    -   User taps "Add Set" -> enters Reps/Weight -> "Save".
4.  **Completion**: Once all sets are logged, the workout is marked as finished, contributing to the "Consistency" and "Progression" stats.

### Phase 5: Management & Maintenance
1.  **View History**: User checks `WorkoutList` to see a reverse-chronological list of all logged sessions.
2.  **Update Profile**: User goes to `ProfileScreen` to change weight or update their primary goal.
3.  **Logout**: Accessible via the bottom of the `ProfileScreen`.
