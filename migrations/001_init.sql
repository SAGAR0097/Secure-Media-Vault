-- Drop tables with dependencies safely
DROP TABLE IF EXISTS asset CASCADE;
DROP TABLE IF EXISTS assetshare CASCADE;
DROP TABLE IF EXISTS uploadticket CASCADE;
DROP TABLE IF EXISTS downloadaudit CASCADE;

-- Recreate asset table
CREATE TABLE IF NOT EXISTS asset (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recreate dependent tables similarly with correct foreign keys
CREATE TABLE IF NOT EXISTS assetshare (
    id SERIAL PRIMARY KEY,
    assetid INT NOT NULL REFERENCES asset(id) ON DELETE CASCADE,
    user_id INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS uploadticket (
    id SERIAL PRIMARY KEY,
    assetid INT NOT NULL REFERENCES asset(id) ON DELETE CASCADE,
    ticket_code VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS downloadaudit (
    id SERIAL PRIMARY KEY,
    assetid INT NOT NULL REFERENCES asset(id) ON DELETE CASCADE,
    download_time TIMESTAMPTZ DEFAULT NOW()
);

-- Continue for other tables as needed
