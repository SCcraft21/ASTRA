-- ASTRA Supabase Database Schema Migration
-- Copy and paste this script directly into the Supabase SQL Editor (Project -> SQL Editor -> New Query) to initialize your database tables.

-- 1. Users Table (used by the Python backend API)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Context Layers Table (used by the frontend and synced to Supabase)
CREATE TABLE IF NOT EXISTS contexts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    updated TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Insights Table (used by the frontend and synced to Supabase)
CREATE TABLE IF NOT EXISTS insights (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    match INT NOT NULL,
    type TEXT NOT NULL,
    date TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Developer Keys Table (used by the frontend and synced to Supabase)
CREATE TABLE IF NOT EXISTS developer_keys (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    scope TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    created TEXT NOT NULL,
    requests_count INTEGER DEFAULT 0 NOT NULL,
    requests_limit INTEGER DEFAULT 1000 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

