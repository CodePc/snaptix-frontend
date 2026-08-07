-- SnapTix Database Schema Flyway Migration V1
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'ATTENDEE',
    persona VARCHAR(30) NOT NULL DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY,
    organizer_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    city VARCHAR(100) NOT NULL,
    venue VARCHAR(255) NOT NULL,
    image_url TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'draft',
    created_by_persona VARCHAR(30) NOT NULL DEFAULT 'admin',
    event_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ticket_tiers (
    id UUID PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    capacity INTEGER NOT NULL DEFAULT 100,
    tickets_sold INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_status VARCHAR(30) NOT NULL DEFAULT 'COMPLETED',
    transaction_ref VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ticket_passes (
    id UUID PRIMARY KEY,
    order_id UUID REFERENCES orders(id),
    tier_id UUID REFERENCES ticket_tiers(id),
    user_id UUID REFERENCES users(id),
    pass_status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    secret_hmac_key VARCHAR(255) NOT NULL,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS resale_listings (
    id UUID PRIMARY KEY,
    pass_id UUID REFERENCES ticket_passes(id),
    seller_id UUID REFERENCES users(id),
    buyer_id UUID REFERENCES users(id),
    listing_price NUMERIC(10, 2) NOT NULL,
    original_face_value NUMERIC(10, 2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
