# Schema Verification & Refresh Guide

If you see the error **"could not find public.body_weight_logs in schema cache"**, follow these steps:

### 1. Re-run the SQL Script
Copy and run the updated [body_weight_table.sql](file:///Users/ztlab92/Desktop/FitReps/body_weight_table.sql) in your Supabase SQL Editor. 
I added a `UNIQUE` constraint that was missing and is required for the weight logging feature to work correctly.

### 2. Reload Schema Cache
Supabase usually reloads the schema automatically, but if it's stuck:
1. Go to your **Supabase Dashboard**.
2. Navigate to **Project Settings** (gear icon) -> **API**.
3. Scroll down to the **PostgREST Config** section.
4. Click **"Reload PostgREST config"** (this force-refreshes the schema cache).

### 3. Verify Table Existence
In the Supabase SQL Editor, run this query:
```sql
select * from public.body_weight_logs limit 1;
```
If it returns "Success" (even with 0 rows), the table is correctly indexed in the cache.

### 4. Restart the App
Sometimes the local development server or the Supabase client state needs a quick refresh. Close and restart your Expo app.
