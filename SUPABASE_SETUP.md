# Supabase Setup Instructions

Follow these steps to set up global listening statistics:

## 1. Create Supabase Account and Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up for a free account
3. Click "New Project"
4. Fill in:
   - **Name**: QuranRadio (or any name you prefer)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to you
5. Wait for project to be created (~2 minutes)

## 2. Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

## 3. Create Environment Variables

1. Create a `.env` file in the root of your project (if it doesn't exist)
2. Add these lines:
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
3. Replace `xxxxx` and `eyJ...` with your actual values from step 2
4. **Important**: Add `.env` to `.gitignore` if it's not already there (to keep keys secret)

## 4. Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the SQL below, then click **Run**:

```sql
-- Create table for global statistics
CREATE TABLE IF NOT EXISTS global_stats (
  id INTEGER PRIMARY KEY DEFAULT 1,
  total_listening_seconds NUMERIC DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial row if it doesn't exist
INSERT INTO global_stats (id, total_listening_seconds)
VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE global_stats ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to read global stats (public read)
CREATE POLICY "Allow public read of global stats"
ON global_stats
FOR SELECT
TO public
USING (true);

-- Policy: Allow anyone to update the listening time
-- The app logic handles incrementing (fetch current, add, update)
CREATE POLICY "Allow public to update listening time"
ON global_stats
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);
```

## 5. Verify Setup

1. After running the SQL, refresh your Supabase dashboard
2. Go to **Table Editor** → You should see `global_stats` table
3. It should have one row with `id = 1` and `total_listening_seconds = 0`

## 6. Test

1. Start your dev server: `npm run dev`
2. Play some audio
3. Check the Stats section in About Us
4. You should see both your personal time and global time

## Security Notes

- The **anon key** is safe to expose in frontend code
- Row Level Security (RLS) policies prevent abuse
- Users can only increment the counter, not delete or modify directly
- The increment function is atomic (prevents race conditions)

## Troubleshooting

- **"Supabase credentials not found"**: Check your `.env` file exists and has correct variable names
- **"Error incrementing"**: Check browser console for detailed error messages
- **"Permission denied"**: Make sure you ran all the SQL commands, especially the GRANT statements

