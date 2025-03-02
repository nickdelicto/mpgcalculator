-- Main tracking table
CREATE TABLE IF NOT EXISTS embed_tracking (
    id SERIAL PRIMARY KEY,
    referrer_domain TEXT UNIQUE,
    first_seen TIMESTAMP DEFAULT NOW(),
    last_seen TIMESTAMP DEFAULT NOW(),
    total_loads INTEGER DEFAULT 1
);

-- Daily loads tracking
CREATE TABLE IF NOT EXISTS embed_daily_loads (
    id SERIAL PRIMARY KEY,
    referrer_domain TEXT,
    date DATE NOT NULL,
    loads INTEGER DEFAULT 1,
    UNIQUE(referrer_domain, date)
); 