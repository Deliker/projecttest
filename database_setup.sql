-- Create the database (run this first)
CREATE DATABASE IF NOT EXISTS taskmaster CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE taskmaster;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    priority VARCHAR(20) NOT NULL,
    year INT NOT NULL,
    month INT NOT NULL,
    day INT NOT NULL,
    duration INT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    user_id BIGINT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    achievement_id VARCHAR(50) NOT NULL,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(255) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    points INT NOT NULL,
    category VARCHAR(50) NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id BIGINT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY user_achievement (user_id, achievement_id)
);

-- Insert a test user (password is 'password' encrypted with BCrypt)
INSERT INTO users (name, email, password) VALUES 
('Test User', 'test@example.com', '$2a$10$aCvAGxXhYSMmXs7yN2gP0.Tln5UBUbj56AYxgzrKa/AuWnf5zTXeS');

-- Insert some test tasks for this user
INSERT INTO tasks (description, category, priority, year, month, day, duration, user_id) VALUES
('Complete project proposal', 'work', 'high', 2025, 3, 20, 120, 1),
('Go for a run', 'health', 'medium', 2025, 3, 20, 45, 1),
('Buy groceries', 'shopping', 'low', 2025, 3, 21, 60, 1),
('Prepare presentation', 'work', 'high', 2025, 3, 22, 90, 1),
('Call parents', 'personal', 'medium', 2025, 3, 23, 30, 1);

-- Insert some achievements for this user
INSERT INTO achievements (achievement_id, title, description, icon, points, category, user_id) VALUES
('beginner', 'First Step', 'Complete your first task', '🎯', 10, 'daily', 1),
('multitasker', 'Multitasker', 'Complete tasks in 5 different categories', '🎭', 50, 'special', 1);