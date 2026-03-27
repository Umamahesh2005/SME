-- Create transactions table
CREATE TABLE transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  payment text NOT NULL CHECK (payment IN ('cash', 'digital')),
  amount numeric NOT NULL,
  "desc" text NOT NULL,
  cat text NOT NULL,
  party text,
  ref text,
  notes text,
  date date NOT NULL DEFAULT current_date,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on Row Level Security (RLS)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own transactions
CREATE POLICY "Users can manage their own transactions" 
  ON transactions FOR ALL 
  USING (auth.uid() = user_id);
