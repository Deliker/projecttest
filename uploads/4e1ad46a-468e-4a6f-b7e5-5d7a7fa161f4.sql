-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 15, 2025 at 09:33 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `taskmaster`
--

-- --------------------------------------------------------

--
-- Table structure for table `achievements`
--

CREATE TABLE `achievements` (
  `id` bigint(20) NOT NULL,
  `achievement_id` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `icon` varchar(255) NOT NULL,
  `points` int(11) NOT NULL,
  `category` varchar(255) NOT NULL,
  `unlocked_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `user_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `achievements`
--

INSERT INTO `achievements` (`id`, `achievement_id`, `title`, `description`, `icon`, `points`, `category`, `unlocked_at`, `user_id`) VALUES
(1, 'beginner', 'First Step', 'Complete your first task', '🎯', 10, 'daily', '2025-04-23 07:33:40', 1),
(2, 'multitasker', 'Multitasker', 'Complete tasks in 5 different categories', '🎭', 50, 'special', '2025-04-23 07:33:40', 1),
(3, 'beginner', 'First Step', 'Complete your first task', '🎯', 10, 'daily', '2025-05-13 05:01:36', 4),
(4, 'multitasker', 'Multitasker', 'Complete tasks in 5 different categories', '🎭', 50, 'special', '2025-05-13 05:01:37', 4);

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `id` bigint(20) NOT NULL,
  `description` varchar(255) NOT NULL,
  `category` varchar(255) NOT NULL,
  `priority` varchar(255) NOT NULL,
  `year` int(11) NOT NULL,
  `month` int(11) NOT NULL,
  `day` int(11) NOT NULL,
  `duration` int(11) DEFAULT NULL,
  `completed` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `completed_at` timestamp NULL DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`id`, `description`, `category`, `priority`, `year`, `month`, `day`, `duration`, `completed`, `created_at`, `completed_at`, `user_id`) VALUES
(8, '321321321', 'study', 'medium', 2025, 4, 12, 10080, 0, '2025-05-12 07:05:20', NULL, 4),
(9, '1231312', 'study', 'high', 2025, 4, 13, 10080, 0, '2025-05-13 04:02:56', NULL, 4),
(10, '1231312', 'study', 'medium', 2025, 4, 13, 10080, 0, '2025-05-13 04:03:17', NULL, 4),
(11, '1231312', 'work', 'medium', 2025, 4, 13, 10080, 0, '2025-05-13 04:03:21', NULL, 4),
(12, 'цу2312', 'study', 'medium', 2025, 4, 13, 10080, 0, '2025-05-13 04:13:20', NULL, 4),
(13, 'dsadsdasdsa', 'study', 'medium', 2025, 4, 13, 10080, 0, '2025-05-13 04:13:55', NULL, 4),
(14, '213231', 'shopping', 'medium', 2025, 4, 13, 10080, 0, '2025-05-13 04:18:26', NULL, 4),
(15, 'first task', 'shopping', 'medium', 2025, 4, 13, 10080, 0, '2025-05-13 04:20:43', NULL, 4),
(16, 'task21321', 'personal', 'medium', 2025, 4, 13, 0, 0, '2025-05-13 04:37:15', NULL, 4),
(17, '231321', 'other', 'high', 2025, 4, 13, 10080, 0, '2025-05-13 04:37:54', NULL, 4),
(18, '12432', 'shopping', 'medium', 2025, 4, 13, 0, 0, '2025-05-13 04:46:23', NULL, 4),
(19, '43432432', 'shopping', 'medium', 2025, 4, 13, 0, 0, '2025-05-13 04:46:58', NULL, 4),
(20, '321321321321', 'shopping', 'medium', 2025, 4, 13, 0, 0, '2025-05-13 04:51:19', NULL, 4),
(22, '32132132132132434', 'work', 'medium', 2025, 4, 13, 0, 1, '2025-05-13 05:01:28', '2025-05-13 05:01:36', 4);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `bio` text DEFAULT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `theme` varchar(255) DEFAULT NULL,
  `last_active` timestamp NULL DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `job_title` varchar(255) DEFAULT NULL,
  `role` enum('ADMIN','USER') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `created_at`, `bio`, `avatar_url`, `theme`, `last_active`, `location`, `job_title`, `role`) VALUES
(1, 'Test User', 'test@example.com', '$2a$10$aCvAGxXhYSMmXs7yN2gP0.Tln5UBUbj56AYxgzrKa/AuWnf5zTXeS', '2025-04-23 07:33:40', NULL, NULL, 'dark', NULL, NULL, NULL, 'ADMIN'),
(2, '123', '123@gmail.com', '$2a$10$o67Rj8kYgWafFR9GZ5R1EuYpUiPuRFwBiARpfiYKIT8Sh.Q4xUrBG', '2025-04-23 07:37:04', NULL, NULL, 'dark', NULL, NULL, NULL, 'ADMIN'),
(3, 'Artjoms', 'artjoms.harkins@gmail.com', '$2a$10$djJ74Xuk6Sc24eRobRgiq.1IpxSwFAz4JGF5ONJYhfn9E2GJbDnxy', '2025-04-23 11:35:34', NULL, NULL, 'dark', NULL, NULL, NULL, 'ADMIN'),
(4, 'Jegors', 'jegors@gmail.com', '$2a$10$NNnzzSdUTMjFzd4Wyqll4.IGWpDahrMKNhCNEK8VH0nDysnBkiFG2', '2025-04-23 11:41:35', '3321321321', '/api/uploads/avatars/cbf9072e-9a1c-4f4b-bdd7-03f7cfc27a36.jpg', 'light', '2025-05-15 03:32:20', '', '', 'ADMIN');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `achievements`
--
ALTER TABLE `achievements`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_achievement` (`user_id`,`achievement_id`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `achievements`
--
ALTER TABLE `achievements`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `achievements`
--
ALTER TABLE `achievements`
  ADD CONSTRAINT `achievements_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
