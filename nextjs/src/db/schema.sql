-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    firebase_uid VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Financial Information table
CREATE TABLE IF NOT EXISTS user_financial_info (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    birthdate DATE,
    estimated_salary DECIMAL(20,2),
    country VARCHAR(100),
    domicile VARCHAR(255),
    active_loan DECIMAL(10,0) DEFAULT 0,
    bi_checking_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Chats table
CREATE TABLE IF NOT EXISTS chats (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table (without vector column for now)
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER REFERENCES chats(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Summaries table
CREATE TABLE IF NOT EXISTS summaries (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER REFERENCES chats(id) ON DELETE CASCADE,
    summary TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_user_financial_info_user_id ON user_financial_info(user_id);
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_summaries_chat_id ON summaries(chat_id);
CREATE INDEX IF NOT EXISTS idx_summaries_created_at ON summaries(created_at);

-- Migration: Ensure active_loan is DECIMAL(10,0) and estimated_salary is DECIMAL(20,2)
DO $$
BEGIN
  -- Handle boolean to decimal conversion for active_loan
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='user_financial_info' AND column_name='active_loan' AND data_type='boolean'
  ) THEN
    ALTER TABLE user_financial_info ALTER COLUMN active_loan DROP DEFAULT;
    ALTER TABLE user_financial_info ALTER COLUMN active_loan TYPE DECIMAL(10,0) USING (CASE WHEN active_loan THEN 1 ELSE 0 END);
    ALTER TABLE user_financial_info ALTER COLUMN active_loan SET DEFAULT 0;
  END IF;
  
  -- Handle precision increase for active_loan if it's smaller than DECIMAL(10,0)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='user_financial_info' AND column_name='active_loan' 
    AND data_type='numeric' AND numeric_precision < 10
  ) THEN
    ALTER TABLE user_financial_info ALTER COLUMN active_loan TYPE DECIMAL(10,0);
  END IF;
  
  -- Handle precision increase for estimated_salary if it's smaller than DECIMAL(20,2)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='user_financial_info' AND column_name='estimated_salary' 
    AND data_type='numeric' AND numeric_precision < 20
  ) THEN
    ALTER TABLE user_financial_info ALTER COLUMN estimated_salary TYPE DECIMAL(20,2);
  END IF;
END$$; 