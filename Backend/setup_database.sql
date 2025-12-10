-- ===========================================
-- BuckGet Database Setup Script for TiDB
-- ===========================================

-- Create database
CREATE DATABASE IF NOT EXISTS buckget;
USE buckget;

-- ===========================================
-- Create Tables
-- ===========================================

-- Roles table (must be created first for foreign key)
CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    permissions JSON DEFAULT '[]',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    ic_number VARCHAR(20),
    phone VARCHAR(20),
    hourly_rate FLOAT DEFAULT 0.0,
    current_available FLOAT DEFAULT 0.0,
    total_saved FLOAT DEFAULT 0.0,
    role_id VARCHAR(36),
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    INDEX idx_users_email (email)
);

-- Buckets table
CREATE TABLE IF NOT EXISTS buckets (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    target FLOAT NOT NULL,
    current FLOAT DEFAULT 0.0,
    icon VARCHAR(50) DEFAULT 'DollarSign',
    color VARCHAR(50) DEFAULT 'bg-[#FF44EC]',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_buckets_user (user_id)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    type ENUM('unlock', 'stash', 'transfer') NOT NULL,
    amount FLOAT NOT NULL,
    description VARCHAR(255),
    bucket_id VARCHAR(36),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (bucket_id) REFERENCES buckets(id) ON DELETE SET NULL,
    INDEX idx_transactions_user (user_id)
);

-- User Settings table
CREATE TABLE IF NOT EXISTS user_settings (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    theme VARCHAR(20) DEFAULT 'dark',
    language VARCHAR(10) DEFAULT 'en',
    tier VARCHAR(50) DEFAULT 'basic',
    save_percentage FLOAT DEFAULT 10.0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- AI Conversations table
CREATE TABLE IF NOT EXISTS ai_conversations (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_ai_conversations_user (user_id)
);

-- ===========================================
-- Insert Default Roles
-- ===========================================

INSERT INTO roles (id, name, permissions) VALUES
('role-admin-001', 'admin', '["all"]'),
('role-user-001', 'user', '["read", "write"]'),
('role-viewer-001', 'viewer', '["read"]')
ON DUPLICATE KEY UPDATE name = name;

-- ===========================================
-- Insert Admin User: ahmad@buckget.com
-- Password: 123456 (hashed with bcrypt)
-- ===========================================

-- Note: This hash is for password "123456"
-- Generated with: bcrypt.hashpw("123456".encode(), bcrypt.gensalt())
INSERT INTO users (id, email, password_hash, full_name, ic_number, phone, hourly_rate, current_available, total_saved, role_id, is_active) VALUES
('user-ahmad-001', 'ahmad@buckget.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4yPvHk7H4QKJXW4W', 'Ahmad', '990101-14-5678', '+60123456789', 25.00, 84.00, 1250.00, 'role-admin-001', TRUE)
ON DUPLICATE KEY UPDATE email = email;

-- ===========================================
-- Insert User Settings
-- ===========================================

INSERT INTO user_settings (id, user_id, notifications_enabled, theme, language, tier, save_percentage) VALUES
('settings-ahmad-001', 'user-ahmad-001', TRUE, 'dark', 'en', 'steady', 30.0)
ON DUPLICATE KEY UPDATE user_id = user_id;

-- ===========================================
-- Insert Sample Buckets (Savings Goals)
-- ===========================================

INSERT INTO buckets (id, user_id, name, target, current, icon, color) VALUES
('bucket-001', 'user-ahmad-001', 'Emergency Fund', 5000.00, 450.00, 'Shield', 'bg-[#FF44EC]'),
('bucket-002', 'user-ahmad-001', 'Vacation', 3000.00, 820.00, 'Plane', 'bg-white/10'),
('bucket-003', 'user-ahmad-001', 'New Phone', 2500.00, 1200.00, 'Smartphone', 'bg-white/10'),
('bucket-004', 'user-ahmad-001', 'Gaming Setup', 4000.00, 650.00, 'Gamepad2', 'bg-[#FF44EC]'),
('bucket-005', 'user-ahmad-001', 'House Deposit', 20000.00, 3400.00, 'Home', 'bg-white/10'),
('bucket-006', 'user-ahmad-001', 'Education', 6000.00, 2100.00, 'BookOpen', 'bg-white/10')
ON DUPLICATE KEY UPDATE name = name;

-- ===========================================
-- Insert Sample Transactions
-- ===========================================

INSERT INTO transactions (id, user_id, type, amount, description, bucket_id, created_at) VALUES
('txn-001', 'user-ahmad-001', 'unlock', 50.00, 'Wage unlock', NULL, DATE_SUB(NOW(), INTERVAL 5 DAY)),
('txn-002', 'user-ahmad-001', 'stash', 30.00, 'Auto save to Emergency', 'bucket-001', DATE_SUB(NOW(), INTERVAL 4 DAY)),
('txn-003', 'user-ahmad-001', 'stash', 50.00, 'Save to Vacation', 'bucket-002', DATE_SUB(NOW(), INTERVAL 3 DAY)),
('txn-004', 'user-ahmad-001', 'unlock', 75.00, 'Weekly wage', NULL, DATE_SUB(NOW(), INTERVAL 2 DAY)),
('txn-005', 'user-ahmad-001', 'stash', 100.00, 'Bonus to House Deposit', 'bucket-005', DATE_SUB(NOW(), INTERVAL 1 DAY))
ON DUPLICATE KEY UPDATE description = description;

-- ===========================================
-- Verify Data
-- ===========================================

SELECT 'Database setup complete!' AS status;
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS total_buckets FROM buckets;
SELECT COUNT(*) AS total_transactions FROM transactions;

