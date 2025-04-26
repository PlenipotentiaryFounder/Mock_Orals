-- SQL script to add user_id column to students table and set up RLS

-- 1. Add the user_id column
ALTER TABLE public.students 
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- 2. Enable RLS on the students table (if not already enabled)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- 3. Create a policy for students table to allow users to select only their own students
CREATE POLICY select_own_students ON public.students
    FOR SELECT 
    USING (auth.uid() = user_id);

-- 4. Create a policy for students table to allow users to insert their own students
CREATE POLICY insert_own_students ON public.students
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- 5. Create a policy for students table to allow users to update only their own students
CREATE POLICY update_own_students ON public.students
    FOR UPDATE 
    USING (auth.uid() = user_id);

-- 6. Create a policy for students table to allow users to delete only their own students
CREATE POLICY delete_own_students ON public.students
    FOR DELETE 
    USING (auth.uid() = user_id);

-- 7. Set the user_id for the existing student record
-- Replace 'YOUR_USER_ID' with your actual user ID
-- UPDATE public.students 
-- SET user_id = 'YOUR_USER_ID'
-- WHERE id = '2ad7edf3-46f3-4677-babb-ef1d950693cf'; 