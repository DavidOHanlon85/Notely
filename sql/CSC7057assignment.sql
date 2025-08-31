-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:8889
-- Generation Time: Aug 31, 2025 at 11:33 AM
-- Server version: 8.0.35
-- PHP Version: 8.2.20

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `CSC7057assignment`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `admin_id` int NOT NULL,
  `admin_first_name` varchar(100) NOT NULL,
  `admin_last_name` varchar(100) NOT NULL,
  `admin_email` varchar(255) NOT NULL,
  `admin_username` varchar(100) NOT NULL,
  `admin_password` varchar(255) NOT NULL,
  `admin_password_reset_token` varchar(255) DEFAULT NULL,
  `admin_password_reset_expires` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`admin_id`, `admin_first_name`, `admin_last_name`, `admin_email`, `admin_username`, `admin_password`, `admin_password_reset_token`, `admin_password_reset_expires`, `created_at`) VALUES
(1, 'Admin', 'User', 'davidohanlon85@googlemail.com', 'adminuser', '$2b$12$c1qspRgNZpy1.FEkX4ptq.QjyeLaW1jIiK/ut9FimWg25LlAErFuW', NULL, NULL, '2025-07-24 19:24:09');

-- --------------------------------------------------------

--
-- Table structure for table `availability`
--

CREATE TABLE `availability` (
  `availability_id` int NOT NULL,
  `tutor_id` int NOT NULL,
  `day_of_week` enum('Mon','Tue','Wed','Thu','Fri','Sat','Sun') NOT NULL,
  `time_slot` enum('Morning','Afternoon','After School','Evening') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `is_available` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `availability`
--

INSERT INTO `availability` (`availability_id`, `tutor_id`, `day_of_week`, `time_slot`, `is_available`) VALUES
(1, 1, 'Tue', 'Morning', 1),
(2, 1, 'Wed', 'Morning', 1),
(3, 1, 'Fri', 'Morning', 1),
(4, 1, 'Sat', 'Morning', 0),
(5, 1, 'Sun', 'Morning', 0),
(6, 1, 'Mon', 'Afternoon', 1),
(7, 1, 'Tue', 'Afternoon', 1),
(8, 1, 'Wed', 'Afternoon', 1),
(9, 1, 'Thu', 'Afternoon', 1),
(10, 1, 'Fri', 'Afternoon', 1),
(11, 1, 'Mon', 'After School', 1),
(12, 1, 'Tue', 'After School', 1),
(13, 1, 'Wed', 'After School', 1),
(14, 1, 'Thu', 'After School', 1),
(15, 1, 'Fri', 'After School', 1),
(16, 1, 'Sat', 'After School', 0),
(17, 1, 'Sun', 'After School', 0),
(18, 1, 'Mon', 'Evening', 1),
(19, 1, 'Wed', 'Evening', 1),
(20, 1, 'Fri', 'Evening', 0),
(21, 1, 'Sat', 'Evening', 0),
(22, 1, 'Sun', 'Evening', 0),
(23, 2, 'Mon', 'Morning', 1),
(24, 2, 'Mon', 'Afternoon', 1),
(25, 2, 'Tue', 'Morning', 1),
(26, 2, 'Tue', 'After School', 1),
(27, 2, 'Wed', 'Morning', 1),
(28, 2, 'Wed', 'Afternoon', 1),
(29, 2, 'Thu', 'Morning', 1),
(30, 2, 'Thu', 'After School', 1),
(31, 2, 'Fri', 'Morning', 1),
(32, 2, 'Fri', 'Afternoon', 1),
(33, 3, 'Mon', 'Afternoon', 1),
(34, 3, 'Mon', 'After School', 1),
(35, 3, 'Tue', 'Afternoon', 1),
(36, 3, 'Tue', 'Evening', 1),
(37, 3, 'Wed', 'Morning', 1),
(38, 3, 'Thu', 'After School', 1),
(39, 3, 'Fri', 'Afternoon', 1),
(40, 3, 'Sat', 'Morning', 1),
(41, 3, 'Sat', 'Afternoon', 1),
(42, 3, 'Sun', 'Morning', 1),
(43, 3, 'Sun', 'After School', 1),
(44, 4, 'Thu', 'Evening', 1),
(45, 4, 'Fri', 'After School', 1),
(46, 4, 'Fri', 'Evening', 1),
(47, 4, 'Sat', 'Morning', 1),
(48, 4, 'Sat', 'After School', 1),
(49, 4, 'Sat', 'Evening', 1),
(50, 4, 'Sun', 'Afternoon', 1),
(51, 4, 'Sun', 'Evening', 1),
(52, 5, 'Mon', 'After School', 1),
(53, 5, 'Mon', 'Evening', 1),
(54, 5, 'Tue', 'Morning', 1),
(55, 5, 'Tue', 'Afternoon', 1),
(56, 5, 'Wed', 'Morning', 1),
(57, 5, 'Wed', 'After School', 1),
(58, 5, 'Thu', 'Afternoon', 1),
(59, 5, 'Fri', 'Morning', 1),
(60, 5, 'Fri', 'After School', 1),
(61, 5, 'Sat', 'Afternoon', 1),
(62, 5, 'Sat', 'Evening', 1),
(63, 6, 'Mon', 'Morning', 1),
(64, 6, 'Mon', 'Afternoon', 1),
(65, 6, 'Tue', 'Morning', 1),
(66, 6, 'Tue', 'Afternoon', 1),
(67, 6, 'Wed', 'Morning', 1),
(68, 6, 'Wed', 'Afternoon', 1),
(69, 6, 'Thu', 'Morning', 0),
(70, 6, 'Fri', 'Morning', 1),
(71, 6, 'Sat', 'Afternoon', 1),
(72, 6, 'Sun', 'Morning', 1),
(73, 7, 'Mon', 'After School', 1),
(74, 7, 'Tue', 'Evening', 1),
(75, 7, 'Wed', 'After School', 1),
(76, 7, 'Thu', 'Evening', 1),
(77, 7, 'Fri', 'After School', 1),
(78, 7, 'Sat', 'Evening', 1),
(79, 7, 'Sun', 'Afternoon', 1),
(80, 7, 'Sun', 'Evening', 1),
(81, 8, 'Sat', 'Morning', 1),
(82, 8, 'Sat', 'Afternoon', 1),
(83, 8, 'Sat', 'Evening', 1),
(84, 8, 'Sun', 'Morning', 1),
(85, 8, 'Sun', 'Afternoon', 1),
(86, 8, 'Sun', 'Evening', 1),
(87, 8, 'Wed', 'Evening', 1),
(88, 8, 'Thu', 'After School', 1),
(89, 9, 'Mon', 'Morning', 1),
(90, 9, 'Mon', 'Afternoon', 1),
(91, 9, 'Mon', 'After School', 1),
(92, 9, 'Tue', 'Morning', 1),
(93, 9, 'Tue', 'After School', 1),
(94, 9, 'Wed', 'Morning', 1),
(95, 9, 'Thu', 'Morning', 1),
(96, 9, 'Fri', 'Afternoon', 1),
(97, 10, 'Mon', 'Afternoon', 1),
(98, 10, 'Mon', 'After School', 1),
(99, 10, 'Tue', 'Afternoon', 1),
(100, 10, 'Tue', 'Evening', 1),
(101, 10, 'Thu', 'After School', 1),
(102, 10, 'Fri', 'Morning', 1),
(103, 10, 'Sat', 'Afternoon', 1),
(104, 10, 'Sun', 'Morning', 1),
(109, 18, 'Mon', 'Morning', 1),
(110, 18, 'Mon', 'Afternoon', 1),
(111, 18, 'Tue', 'Morning', 1),
(112, 18, 'Tue', 'Afternoon', 1);

-- --------------------------------------------------------

--
-- Table structure for table `booking`
--

CREATE TABLE `booking` (
  `booking_id` int NOT NULL,
  `booking_date` date NOT NULL,
  `booking_time` time NOT NULL,
  `booking_status` int NOT NULL DEFAULT '1',
  `booking_notes` varchar(200) NOT NULL,
  `booking_created_at` timestamp NOT NULL,
  `booking_updated_at` timestamp NOT NULL,
  `student_id` int NOT NULL,
  `tutor_id` int NOT NULL,
  `reminder_sent` tinyint(1) DEFAULT '0',
  `booking_link` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `booking`
--

INSERT INTO `booking` (`booking_id`, `booking_date`, `booking_time`, `booking_status`, `booking_notes`, `booking_created_at`, `booking_updated_at`, `student_id`, `tutor_id`, `reminder_sent`, `booking_link`) VALUES
(93, '2025-07-21', '08:00:00', 2, 'Testing', '2025-07-20 18:35:20', '2025-07-20 18:35:26', 1, 9, 0, NULL),
(94, '2025-07-25', '08:00:00', 2, '', '2025-07-21 12:20:18', '2025-07-21 12:21:51', 1, 2, 0, NULL),
(96, '2025-07-28', '14:00:00', 2, '', '2025-07-28 10:39:42', '2025-07-28 10:39:47', 1, 1, 0, NULL),
(97, '2025-07-29', '09:00:00', 2, '', '2025-07-28 12:06:02', '2025-07-28 12:09:29', 1, 2, 0, NULL),
(102, '2025-08-05', '15:00:00', 2, 'Student prefers classical pieces.', '2025-07-31 11:35:01', '2025-07-31 11:35:01', 1, 6, 0, 'https://notely.app/session/201'),
(103, '2025-08-06', '10:00:00', 2, 'Needs help with Grade 5 exam prep.', '2025-07-31 11:35:01', '2025-07-31 11:35:01', 2, 7, 0, 'https://notely.app/session/202'),
(104, '2025-08-07', '17:30:00', 2, 'Focus on sight reading.', '2025-07-31 11:35:01', '2025-07-31 11:35:01', 3, 8, 0, 'https://notely.app/session/203'),
(105, '2025-08-05', '10:00:00', 2, 'Lesson on scales', '2025-07-31 11:41:53', '2025-07-31 11:41:53', 17, 6, 0, 'https://notely.app/class/abc123'),
(109, '2025-02-10', '10:00:00', 2, 'Lesson on scales', '2025-07-31 15:01:10', '2025-07-31 15:01:10', 17, 6, 0, NULL),
(112, '2025-04-03', '09:00:00', 2, 'Beginner exercises', '2025-07-31 15:01:10', '2025-07-31 15:01:10', 17, 6, 0, NULL),
(116, '2025-06-22', '12:00:00', 2, 'Final prep', '2025-07-31 15:01:10', '2025-07-31 15:01:10', 17, 6, 0, NULL),
(120, '2025-07-01', '10:00:00', 2, 'Guitar lesson', '2025-08-01 18:23:25', '2025-08-01 18:23:25', 17, 1, 0, NULL),
(121, '2025-07-02', '11:00:00', 2, 'Guitar lesson', '2025-08-01 18:23:25', '2025-08-01 18:23:25', 17, 1, 0, NULL),
(122, '2025-07-03', '12:00:00', 2, 'Guitar lesson', '2025-08-01 18:23:25', '2025-08-01 18:23:25', 17, 1, 0, NULL),
(123, '2025-07-04', '13:00:00', 2, 'Guitar lesson', '2025-08-01 18:23:25', '2025-08-01 18:23:25', 17, 1, 0, NULL),
(124, '2025-07-05', '14:00:00', 2, 'Guitar lesson', '2025-08-01 18:23:25', '2025-08-01 18:23:25', 17, 1, 0, NULL),
(125, '2025-07-06', '15:00:00', 2, 'Guitar lesson', '2025-08-01 18:23:25', '2025-08-01 18:23:25', 17, 1, 0, NULL),
(126, '2025-07-07', '16:00:00', 2, 'Guitar lesson', '2025-08-01 18:23:25', '2025-08-01 18:23:25', 17, 1, 0, NULL),
(127, '2025-07-08', '17:00:00', 2, 'Guitar lesson', '2025-08-01 18:23:25', '2025-08-01 18:23:25', 17, 1, 0, NULL),
(128, '2025-07-09', '18:00:00', 2, 'Guitar lesson', '2025-08-01 18:23:25', '2025-08-01 18:23:25', 17, 1, 0, NULL),
(129, '2025-07-10', '19:00:00', 2, 'Guitar lesson', '2025-08-01 18:23:25', '2025-08-01 18:23:25', 17, 1, 0, NULL),
(130, '2025-06-15', '10:00:00', 2, 'Lesson within 1 year', '2025-08-01 18:25:31', '2025-08-01 18:25:31', 17, 1, 0, NULL),
(131, '2025-06-01', '11:00:00', 2, 'Lesson within 1 year', '2025-08-01 18:25:31', '2025-08-01 18:25:31', 17, 1, 0, NULL),
(132, '2025-05-20', '12:00:00', 2, 'Lesson within 1 year', '2025-08-01 18:25:31', '2025-08-01 18:25:31', 17, 1, 0, NULL),
(133, '2025-04-10', '13:00:00', 2, 'Lesson within 1 year', '2025-08-01 18:25:31', '2025-08-01 18:25:31', 17, 1, 0, NULL),
(134, '2025-03-15', '14:00:00', 2, 'Lesson within 1 year', '2025-08-01 18:25:31', '2025-08-01 18:25:31', 17, 1, 0, NULL),
(135, '2025-02-28', '15:00:00', 2, 'Lesson within 1 year', '2025-08-01 18:25:31', '2025-08-01 18:25:31', 17, 1, 0, NULL),
(136, '2025-01-10', '16:00:00', 2, 'Lesson within 1 year', '2025-08-01 18:25:31', '2025-08-01 18:25:31', 17, 1, 0, NULL),
(137, '2024-12-01', '17:00:00', 2, 'Lesson within 1 year', '2025-08-01 18:25:31', '2025-08-01 18:25:31', 17, 1, 0, NULL),
(138, '2024-11-15', '18:00:00', 2, 'Lesson within 1 year', '2025-08-01 18:25:31', '2025-08-01 18:25:31', 17, 1, 0, NULL),
(139, '2024-08-01', '19:00:00', 2, 'Lesson within 1 year', '2025-08-01 18:25:31', '2025-08-01 18:25:31', 17, 1, 0, NULL),
(140, '2024-07-15', '10:00:00', 2, 'Lesson over a year ago', '2025-08-01 18:25:47', '2025-08-01 18:25:47', 17, 1, 0, NULL),
(141, '2024-06-10', '11:00:00', 2, 'Lesson over a year ago', '2025-08-01 18:25:47', '2025-08-01 18:25:47', 17, 1, 0, NULL),
(142, '2024-05-01', '12:00:00', 2, 'Lesson over a year ago', '2025-08-01 18:25:47', '2025-08-01 18:25:47', 17, 1, 0, NULL),
(143, '2024-04-20', '13:00:00', 2, 'Lesson over a year ago', '2025-08-01 18:25:47', '2025-08-01 18:25:47', 17, 1, 0, NULL),
(144, '2024-03-15', '14:00:00', 2, 'Lesson over a year ago', '2025-08-01 18:25:47', '2025-08-01 18:25:47', 17, 1, 0, NULL),
(145, '2024-02-10', '15:00:00', 2, 'Lesson over a year ago', '2025-08-01 18:25:47', '2025-08-01 18:25:47', 17, 1, 0, NULL),
(146, '2024-01-01', '16:00:00', 2, 'Lesson over a year ago', '2025-08-01 18:25:47', '2025-08-01 18:25:47', 17, 1, 0, NULL),
(147, '2023-12-05', '17:00:00', 2, 'Lesson over a year ago', '2025-08-01 18:25:47', '2025-08-01 18:25:47', 17, 1, 0, NULL),
(148, '2023-11-10', '18:00:00', 2, 'Lesson over a year ago', '2025-08-01 18:25:47', '2025-08-01 18:25:47', 17, 1, 0, NULL),
(149, '2023-10-01', '19:00:00', 2, 'Lesson over a year ago', '2025-08-01 18:25:47', '2025-08-01 18:25:47', 17, 1, 0, NULL),
(150, '2025-05-02', '15:00:00', 2, 'Auto-generated booking', '2025-08-01 18:28:46', '2025-08-01 18:28:46', 17, 1, 0, NULL),
(151, '2023-08-27', '19:00:00', 2, 'Auto-generated booking', '2025-08-01 18:28:46', '2025-08-01 18:28:46', 17, 1, 0, NULL),
(152, '2024-08-22', '14:00:00', 2, 'Auto-generated booking', '2025-08-01 18:28:46', '2025-08-01 18:28:46', 17, 1, 0, NULL),
(153, '2025-06-22', '18:00:00', 2, 'Auto-generated booking', '2025-08-01 18:28:46', '2025-08-01 18:28:46', 17, 1, 0, NULL),
(154, '2024-09-13', '16:00:00', 2, 'Auto-generated booking', '2025-08-01 18:28:46', '2025-08-01 18:28:46', 17, 1, 0, NULL),
(155, '2024-05-21', '10:00:00', 2, 'Auto-generated booking', '2025-08-01 18:28:46', '2025-08-01 18:28:46', 17, 1, 0, NULL),
(156, '2024-01-14', '18:00:00', 2, 'Auto-generated booking', '2025-08-01 18:28:46', '2025-08-01 18:28:46', 17, 1, 0, NULL),
(157, '2025-06-23', '11:00:00', 2, 'Auto-generated booking', '2025-08-01 18:28:46', '2025-08-01 18:28:46', 17, 1, 0, NULL),
(158, '2025-06-02', '12:00:00', 2, 'Auto-generated booking', '2025-08-01 18:28:46', '2025-08-01 18:28:46', 17, 1, 0, NULL),
(159, '2025-05-02', '15:00:00', 2, 'Auto-generated booking', '2025-08-01 18:29:01', '2025-08-01 18:29:01', 17, 1, 0, NULL),
(160, '2023-08-27', '19:00:00', 2, 'Auto-generated booking', '2025-08-01 18:29:01', '2025-08-01 18:29:01', 17, 1, 0, NULL),
(161, '2024-08-22', '14:00:00', 2, 'Auto-generated booking', '2025-08-01 18:29:01', '2025-08-01 18:29:01', 17, 1, 0, NULL),
(162, '2025-06-22', '18:00:00', 2, 'Auto-generated booking', '2025-08-01 18:29:01', '2025-08-01 18:29:01', 17, 1, 0, NULL),
(163, '2024-09-13', '16:00:00', 2, 'Auto-generated booking', '2025-08-01 18:29:01', '2025-08-01 18:29:01', 17, 1, 0, NULL),
(164, '2024-05-21', '10:00:00', 2, 'Auto-generated booking', '2025-08-01 18:29:01', '2025-08-01 18:29:01', 17, 1, 0, NULL),
(165, '2024-01-14', '18:00:00', 2, 'Auto-generated booking', '2025-08-01 18:29:01', '2025-08-01 18:29:01', 17, 1, 0, NULL),
(166, '2025-06-23', '11:00:00', 2, 'Auto-generated booking', '2025-08-01 18:29:01', '2025-08-01 18:29:01', 17, 1, 0, NULL),
(167, '2025-06-02', '12:00:00', 2, 'Auto-generated booking', '2025-08-01 18:29:01', '2025-08-01 18:29:01', 17, 1, 0, NULL),
(168, '2023-05-15', '17:00:00', 2, 'Auto-generated booking', '2025-08-01 18:29:01', '2025-08-01 18:29:01', 17, 1, 0, NULL),
(169, '2025-07-01', '14:00:00', 2, 'Auto-generated booking', '2025-08-01 18:29:01', '2025-08-01 18:29:01', 17, 1, 0, NULL),
(170, '2024-06-30', '09:00:00', 2, 'Auto-generated booking', '2025-08-01 18:29:01', '2025-08-01 18:29:01', 17, 1, 0, NULL),
(171, '2023-11-03', '10:00:00', 2, 'Auto-generated booking', '2025-08-01 18:29:01', '2025-08-01 18:29:01', 17, 1, 0, NULL),
(172, '2024-10-07', '13:00:00', 2, 'Auto-generated booking', '2025-08-01 18:29:01', '2025-08-01 18:29:01', 17, 1, 0, NULL),
(173, '2024-12-05', '15:00:00', 2, 'Auto-generated booking', '2025-08-01 18:29:01', '2025-08-01 18:29:01', 17, 1, 0, NULL),
(174, '2024-03-25', '14:00:00', 2, 'Auto-generated booking', '2025-08-01 18:29:01', '2025-08-01 18:29:01', 17, 1, 0, NULL),
(175, '2024-04-10', '13:30:00', 2, 'Auto-generated booking', '2025-08-01 18:29:01', '2025-08-01 18:29:01', 17, 1, 0, NULL),
(176, '2023-09-11', '10:30:00', 2, 'Auto-generated booking', '2025-08-01 18:29:01', '2025-08-01 18:29:01', 17, 1, 0, NULL),
(177, '2024-11-12', '11:00:00', 2, 'Auto-generated booking', '2025-08-01 18:29:01', '2025-08-01 18:29:01', 17, 1, 0, NULL),
(178, '2025-04-16', '17:30:00', 2, 'Auto-generated booking', '2025-08-01 18:29:01', '2025-08-01 18:29:01', 17, 1, 0, NULL),
(179, '2025-01-05', '09:30:00', 2, 'Auto-generated booking', '2025-08-01 18:29:01', '2025-08-01 18:29:01', 17, 1, 0, NULL),
(180, '2023-07-15', '15:30:00', 2, 'Auto-generated booking', '2025-08-01 18:29:01', '2025-08-01 18:29:01', 17, 1, 0, NULL),
(181, '2024-02-10', '12:30:00', 2, 'Auto-generated booking', '2025-08-01 18:29:01', '2025-08-01 18:29:01', 17, 1, 0, NULL),
(182, '2023-10-06', '13:45:00', 2, 'Auto-generated booking', '2025-08-01 18:29:01', '2025-08-01 18:29:01', 17, 1, 0, NULL),
(183, '2025-02-14', '16:15:00', 2, 'Auto-generated booking', '2025-08-01 18:29:01', '2025-08-01 18:29:01', 17, 1, 0, NULL),
(184, '2024-07-21', '18:15:00', 2, 'Auto-generated booking', '2025-08-01 18:29:01', '2025-08-01 18:29:01', 17, 1, 0, NULL),
(185, '2023-06-18', '10:15:00', 2, 'Auto-generated booking', '2025-08-01 18:29:01', '2025-08-01 18:29:01', 17, 1, 0, NULL),
(186, '2024-08-28', '15:45:00', 2, 'Auto-generated booking', '2025-08-01 18:29:01', '2025-08-01 18:29:01', 17, 1, 0, NULL),
(187, '2024-01-29', '16:30:00', 2, 'Auto-generated booking', '2025-08-01 18:29:01', '2025-08-01 18:29:01', 17, 1, 0, NULL),
(188, '2023-04-01', '17:00:00', 2, 'Auto-generated booking', '2025-08-01 18:29:01', '2025-08-01 18:29:01', 17, 1, 0, NULL),
(189, '2025-03-03', '14:30:00', 2, 'Auto-generated booking', '2025-08-01 18:29:01', '2025-08-01 18:29:01', 17, 1, 0, NULL),
(190, '2024-06-04', '09:30:00', 2, 'Auto-generated booking', '2025-08-01 18:29:01', '2025-08-01 18:29:01', 17, 1, 0, NULL),
(191, '2024-10-20', '11:15:00', 2, 'Auto-generated booking', '2025-08-01 18:29:01', '2025-08-01 18:29:01', 17, 1, 0, NULL),
(192, '2023-12-11', '13:15:00', 2, 'Auto-generated booking', '2025-08-01 18:29:01', '2025-08-01 18:29:01', 17, 1, 0, NULL),
(193, '2023-03-22', '14:15:00', 2, 'Auto-generated booking', '2025-08-01 18:29:01', '2025-08-01 18:29:01', 17, 1, 0, NULL),
(194, '2025-05-12', '10:45:00', 2, 'Auto-generated booking', '2025-08-01 18:29:01', '2025-08-01 18:29:01', 17, 1, 0, NULL),
(195, '2023-08-19', '16:45:00', 2, 'Auto-generated booking', '2025-08-01 18:29:01', '2025-08-01 18:29:01', 17, 1, 0, NULL),
(196, '2024-05-17', '15:30:00', 2, 'Auto-generated booking', '2025-08-01 18:29:01', '2025-08-01 18:29:01', 17, 1, 0, NULL),
(197, '2024-07-12', '12:45:00', 2, 'Auto-generated booking', '2025-08-01 18:29:01', '2025-08-01 18:29:01', 17, 1, 0, NULL),
(198, '2023-10-02', '11:30:00', 2, 'Auto-generated booking', '2025-08-01 18:29:01', '2025-08-01 18:29:01', 17, 1, 0, NULL),
(199, '2024-11-25', '14:45:00', 2, 'Auto-generated booking', '2025-08-01 18:29:01', '2025-08-01 18:29:01', 17, 1, 0, NULL),
(200, '2025-06-14', '10:30:00', 2, 'Auto-generated booking', '2025-08-01 18:29:01', '2025-08-01 18:29:01', 17, 1, 0, NULL),
(201, '2023-05-05', '09:00:00', 2, 'Auto-generated booking', '2025-08-01 18:29:01', '2025-08-01 18:29:01', 17, 1, 0, NULL),
(202, '2024-12-03', '10:45:00', 2, 'Auto-generated booking', '2025-08-01 18:29:01', '2025-08-01 18:29:01', 17, 1, 0, NULL),
(203, '2025-07-10', '15:15:00', 2, 'Auto-generated booking', '2025-08-01 18:29:01', '2025-08-01 18:29:01', 17, 1, 0, NULL),
(204, '2024-03-15', '11:15:00', 2, 'Auto-generated booking', '2025-08-01 18:29:01', '2025-08-01 18:29:01', 17, 1, 0, NULL),
(205, '2024-02-08', '12:15:00', 2, 'Auto-generated booking', '2025-08-01 18:29:01', '2025-08-01 18:29:01', 17, 1, 0, NULL),
(206, '2023-09-26', '16:00:00', 2, 'Auto-generated booking', '2025-08-01 18:29:01', '2025-08-01 18:29:01', 17, 1, 0, NULL),
(207, '2024-04-08', '13:00:00', 2, 'Auto-generated booking', '2025-08-01 18:29:01', '2025-08-01 18:29:01', 17, 1, 0, NULL),
(208, '2023-06-06', '14:00:00', 2, 'Auto-generated booking', '2025-08-01 18:29:01', '2025-08-01 18:29:01', 17, 1, 0, NULL),
(219, '2025-08-02', '10:00:00', 2, 'Piano lesson', '2025-08-02 15:53:36', '2025-08-02 15:53:36', 1, 1, 0, 'https://notely.app/class/201'),
(220, '2025-08-03', '14:00:00', 2, 'Violin session', '2025-08-02 15:53:36', '2025-08-02 15:53:36', 2, 1, 0, 'https://notely.app/class/202'),
(221, '2025-08-04', '16:00:00', 2, 'Guitar feedback', '2025-08-02 15:53:36', '2025-08-02 15:53:36', 3, 1, 0, 'https://notely.app/class/203'),
(224, '2025-08-07', '11:00:00', 2, 'Clarinet techniques', '2025-08-02 15:53:36', '2025-08-02 15:53:36', 7, 1, 0, 'https://notely.app/class/206'),
(225, '2025-08-08', '15:00:00', 2, 'Music theory basics', '2025-08-02 15:53:36', '2025-08-02 15:53:36', 7, 1, 0, 'https://notely.app/class/207'),
(226, '2025-08-09', '13:00:00', 2, 'Sight reading', '2025-08-02 15:53:36', '2025-08-02 15:53:36', 8, 1, 1, 'https://notely.app/class/208'),
(228, '2025-08-11', '16:30:00', 2, 'Advanced chord progressions', '2025-08-02 15:53:36', '2025-08-02 15:53:36', 1, 1, 0, 'https://notely.app/class/210'),
(229, '2025-08-04', '13:00:00', 2, 'Guitar Lesson', '2025-08-04 09:57:10', '2025-08-04 09:57:10', 17, 1, 0, 'https://meet.jit.si'),
(230, '2025-08-07', '10:00:00', 2, '', '2025-08-04 10:08:49', '2025-08-04 10:08:49', 17, 1, 0, 'https://meet.jit.si'),
(232, '2025-08-09', '14:00:00', 2, '', '2025-08-07 17:20:47', '2025-08-07 17:20:47', 17, 1, 1, NULL),
(233, '2025-08-08', '10:00:00', 2, '', '2025-08-07 17:58:52', '2025-08-07 17:58:52', 17, 1, 0, 'jitsu'),
(234, '2025-08-11', '12:00:00', 2, 'Testing with JWT student id', '2025-08-10 15:21:41', '2025-08-10 15:21:47', 17, 1, 0, NULL),
(235, '2025-08-12', '07:00:00', 2, '', '2025-08-10 15:23:54', '2025-08-10 15:23:59', 17, 1, 0, NULL),
(236, '2025-08-15', '09:00:00', 3, '', '2025-08-11 10:23:26', '2025-08-12 11:10:23', 17, 1, 0, NULL),
(237, '2025-08-14', '16:00:00', 2, '', '2025-08-11 10:24:54', '2025-08-11 10:25:00', 17, 10, 0, NULL),
(238, '2025-08-14', '12:00:00', 2, '', '2025-08-11 16:50:35', '2025-08-11 16:50:41', 17, 1, 0, NULL),
(239, '2025-08-26', '09:00:00', 3, '', '2025-08-12 12:05:33', '2025-08-12 12:12:34', 17, 18, 0, NULL),
(240, '2025-08-13', '14:00:00', 2, '', '2025-08-12 12:12:13', '2025-08-12 12:12:18', 17, 1, 0, NULL),
(241, '2025-08-15', '13:00:00', 3, '', '2025-08-12 12:15:13', '2025-08-12 12:15:30', 17, 9, 0, NULL),
(242, '2025-08-14', '15:00:00', 2, '', '2025-08-12 14:56:11', '2025-08-12 14:56:17', 17, 10, 0, NULL),
(243, '2025-08-16', '13:00:00', 2, '', '2025-08-15 18:09:59', '2025-08-15 18:12:27', 17, 10, 0, NULL),
(244, '2025-08-18', '09:00:00', 2, '', '2025-08-15 20:36:45', '2025-08-15 20:36:51', 17, 9, 0, NULL),
(245, '2025-08-17', '18:00:00', 2, '', '2025-08-15 20:37:11', '2025-08-15 20:37:15', 17, 1, 0, NULL),
(247, '2025-08-31', '09:00:00', 2, '', '2025-08-28 11:46:53', '2025-08-28 11:47:00', 17, 1, 1, NULL),
(248, '2025-09-10', '14:00:00', 2, '', '2025-08-28 13:26:15', '2025-08-28 13:26:15', 1, 18, 0, NULL),
(249, '2025-09-10', '14:00:00', 2, '', '2025-08-28 13:26:26', '2025-08-28 13:26:26', 2, 18, 0, NULL),
(250, '2025-08-10', '14:00:00', 2, '', '2025-08-28 13:27:35', '2025-08-28 13:27:35', 2, 18, 0, NULL),
(252, '2025-09-04', '14:00:00', 2, '', '2025-08-29 16:01:17', '2025-08-29 16:01:36', 17, 1, 0, NULL),
(253, '2025-08-31', '09:00:00', 2, '', '2025-08-29 17:04:51', '2025-08-29 17:04:57', 17, 9, 0, NULL),
(254, '2025-08-30', '13:00:00', 2, '', '2025-08-29 17:05:17', '2025-08-29 17:05:22', 17, 10, 0, NULL),
(255, '2025-09-10', '14:00:00', 3, '', '2025-08-30 12:06:39', '2025-08-30 12:06:39', 4, 1, 0, NULL),
(256, '2025-08-15', '13:00:00', 2, '', '2025-08-30 12:09:32', '2025-08-30 12:09:32', 1, 1, 1, NULL),
(257, '2025-08-16', '14:00:00', 2, '', '2025-08-30 12:09:32', '2025-08-30 12:09:32', 2, 1, 1, NULL),
(258, '2025-08-17', '15:30:00', 2, '', '2025-08-30 12:09:32', '2025-08-30 12:09:32', 3, 1, 1, NULL),
(259, '2025-08-19', '10:00:00', 2, '', '2025-08-30 12:09:32', '2025-08-30 12:09:32', 4, 1, 1, NULL),
(260, '2025-08-20', '16:00:00', 2, '', '2025-08-30 12:09:32', '2025-08-30 12:09:32', 5, 1, 1, NULL),
(261, '2025-08-22', '11:30:00', 2, '', '2025-08-30 12:09:32', '2025-08-30 12:09:32', 7, 1, 1, NULL),
(262, '2025-08-24', '09:00:00', 2, '', '2025-08-30 12:09:32', '2025-08-30 12:09:32', 8, 1, 1, NULL),
(263, '2025-08-26', '14:00:00', 2, '', '2025-08-30 12:09:32', '2025-08-30 12:09:32', 9, 1, 1, NULL),
(264, '2025-08-28', '12:00:00', 2, '', '2025-08-30 12:09:32', '2025-08-30 12:09:32', 11, 1, 1, NULL),
(265, '2025-08-30', '13:00:00', 2, '', '2025-08-30 12:09:32', '2025-08-30 12:09:32', 3, 1, 0, NULL),
(266, '2025-08-30', '15:00:00', 2, '', '2025-08-30 12:09:32', '2025-08-30 12:09:32', 2, 1, 0, NULL),
(267, '2025-09-03', '10:00:00', 2, '', '2025-08-30 12:09:32', '2025-08-30 12:09:32', 1, 1, 0, NULL),
(268, '2025-09-06', '11:00:00', 2, '', '2025-08-30 12:09:32', '2025-08-30 12:09:32', 5, 1, 0, NULL),
(269, '2025-09-08', '16:00:00', 2, '', '2025-08-30 12:09:32', '2025-08-30 12:09:32', 7, 1, 0, NULL),
(270, '2025-09-10', '14:00:00', 2, '', '2025-08-30 12:09:32', '2025-08-30 12:09:32', 4, 1, 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `booking_status`
--

CREATE TABLE `booking_status` (
  `booking_status_id` int NOT NULL,
  `booking_status_name` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `booking_status`
--

INSERT INTO `booking_status` (`booking_status_id`, `booking_status_name`) VALUES
(1, 'pending'),
(2, 'confirmed'),
(3, 'cancelled'),
(4, 'Completed'),
(5, 'Rescheduled'),
(6, 'No Show');

-- --------------------------------------------------------

--
-- Table structure for table `certification`
--

CREATE TABLE `certification` (
  `certification_id` int NOT NULL,
  `certification` varchar(100) NOT NULL,
  `year` year NOT NULL,
  `tutor_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `certification`
--

INSERT INTO `certification` (`certification_id`, `certification`, `year`, `tutor_id`) VALUES
(1, 'ABRSM Grade 8 Guitar', '2014', 1),
(2, 'Level 3 Certificate in Graded Music Teaching', '2016', 1),
(3, 'Diploma in Music Pedagogy', '2018', 1),
(4, 'Safeguarding & Child Protection Training', '2021', 1),
(5, 'ABRSM Grade 8 Piano', '2007', 2),
(6, 'Level 3 Certificate in Teaching Music', '2011', 2),
(7, 'Safeguarding Children in Education (Level 2)', '2012', 2),
(8, 'ABRSM Grade 8 Violin', '2008', 3),
(9, 'Certificate in Kodály Music Education', '2013', 3),
(10, 'Level 3 Award in Education and Training (QCF)', '2014', 3),
(11, 'Rockschool Grade 8 Electric Guitar', '2007', 4),
(12, 'Diploma in Jazz Improvisation', '2010', 4),
(13, 'Child Protection in Music Settings', '2013', 4),
(14, 'Trinity Guildhall Grade 8 Drum Kit', '2009', 5),
(15, 'Level 3 Certificate in Inclusive Music Education', '2016', 5),
(16, 'Certificate in Special Needs Music Facilitation', '2018', 5),
(17, 'Child Safeguarding and SEN Awareness', '2021', 5),
(18, 'ABRSM Grade 8 Flute', '2009', 6),
(19, 'Level 3 Certificate in Music Therapy Practice', '2015', 6),
(20, 'ABRSM Grade 8 Saxophone', '2007', 7),
(21, 'Diploma in Instrumental Teaching (DipABRSM)', '2009', 7),
(22, 'Trinity Guildhall Grade 8 Piano', '2012', 8),
(23, 'Child Protection & Safeguarding in Music Education', '2020', 8),
(24, 'Rockschool Grade 8 Electric Guitar', '2008', 9),
(25, 'SEN Music Inclusion Training', '2019', 9),
(26, 'ABRSM Grade 8 Clarinet', '2010', 10),
(27, 'Diploma in Music Production and Performance', '2016', 10),
(29, 'Grade 8 Piano', '2021', 18);

-- --------------------------------------------------------

--
-- Table structure for table `dbs_status`
--

CREATE TABLE `dbs_status` (
  `dbs_status_id` int NOT NULL,
  `dbs_status_label` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `dbs_status`
--

INSERT INTO `dbs_status` (`dbs_status_id`, `dbs_status_label`) VALUES
(0, 'Not DBS Certified'),
(1, 'DBS Certified');

-- --------------------------------------------------------

--
-- Table structure for table `education`
--

CREATE TABLE `education` (
  `education_id` int NOT NULL,
  `qualification` varchar(100) NOT NULL,
  `institution` varchar(100) NOT NULL,
  `year` year NOT NULL,
  `tutor_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `education`
--

INSERT INTO `education` (`education_id`, `qualification`, `institution`, `year`, `tutor_id`) VALUES
(1, 'BA (Hons) Music Performance', 'Dublin City University', '2012', 1),
(2, 'PGCE Secondary Music', 'Ulster University', '2015', 1),
(3, 'MA Music Education', 'Queen’s University Belfast', '2020', 1),
(4, 'BA (Hons) Music and Audio Production', 'Ulster University', '2010', 2),
(5, 'PGCE Secondary Education (Music)', 'Queen’s University Belfast', '2012', 2),
(6, 'BMus (Hons) Music Performance', 'Royal Irish Academy of Music', '2011', 3),
(7, 'MMus Music Education', 'Queen’s University Belfast', '2014', 3),
(8, 'BA (Hons) Jazz Studies', 'Leeds College of Music', '2009', 4),
(9, 'MA Music Composition', 'Ulster University', '2013', 4),
(10, 'BMus (Hons) Percussion & Vocal Studies', 'Guildhall School of Music and Drama', '2012', 5),
(11, 'PGCE Music Education', 'Ulster University', '2015', 5),
(12, 'MA Inclusive Music Practice', 'University of Roehampton', '2019', 5),
(13, 'BA (Hons) Music Performance', 'Ulster University', '2012', 6),
(14, 'MA in Music Therapy', 'Queen’s University Belfast', '2016', 6),
(15, 'BMus Classical Saxophone', 'Royal Conservatoire of Scotland', '2009', 7),
(16, 'PGCE in Secondary Music', 'University of Strathclyde', '2011', 7),
(17, 'BA (Hons) Music Education', 'Dublin City University', '2013', 8),
(18, 'MMus Piano Performance', 'Trinity College Dublin', '2016', 8),
(19, 'BA (Hons) Music and Drama', 'Liverpool Hope University', '2010', 9),
(20, 'BMus Music with Technology', 'University of Manchester', '2014', 10),
(21, 'MA Arts Management', 'Queen’s University Belfast', '2018', 10),
(41, 'BA Music', 'Queen\'s', '2020', 18);

-- --------------------------------------------------------

--
-- Table structure for table `gender`
--

CREATE TABLE `gender` (
  `gender_id` int NOT NULL,
  `gender_label` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `gender`
--

INSERT INTO `gender` (`gender_id`, `gender_label`) VALUES
(0, 'Female'),
(1, 'Male');

-- --------------------------------------------------------

--
-- Table structure for table `instrument`
--

CREATE TABLE `instrument` (
  `instrument_id` int NOT NULL,
  `instrument_name` varchar(50) NOT NULL,
  `instrument_active` tinyint NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `instrument`
--

INSERT INTO `instrument` (`instrument_id`, `instrument_name`, `instrument_active`) VALUES
(1, 'Guitar', 1),
(2, 'Piano', 1),
(3, 'Violin', 1),
(4, 'Drums', 1),
(5, 'Voice', 1),
(6, 'Flute', 1),
(7, 'Saxophone', 0),
(8, 'Trumpet', 1),
(9, 'Cello', 1),
(10, 'Clarinet', 0),
(11, 'Double Bass', 0),
(12, 'Accordion', 0),
(13, 'Bagpipes', 0),
(14, 'Banjo', 0),
(15, 'Baritone Horn', 0),
(16, 'Bass Clarinet', 0),
(17, 'Bass Guitar', 0),
(18, 'Bass Trombone', 0),
(19, 'Bassoon', 0),
(20, 'Bodhrán', 0),
(21, 'Bugle', 0),
(22, 'Castanets', 0),
(23, 'Cello (Electric)', 0),
(24, 'Celtic Harp', 0),
(25, 'Cornet', 0),
(26, 'Didgeridoo', 0),
(27, 'Djembe', 0),
(28, 'Double Bass (Electric)', 0),
(29, 'Dulcimer', 0),
(30, 'Euphonium', 0),
(31, 'Fiddle', 0),
(32, 'French Horn', 0),
(33, 'Glockenspiel', 0),
(34, 'Guzheng', 0),
(35, 'Handpan', 0),
(36, 'Harmonica', 0),
(37, 'Harp', 0),
(38, 'Harpsichord', 0),
(39, 'Irish Flute', 0),
(40, 'Irish Whistle', 0),
(41, 'Kalimba', 0),
(42, 'Lute', 0),
(43, 'Mandolin', 0),
(44, 'Marimba', 0),
(45, 'Melodica', 0),
(46, 'Oboe', 0),
(47, 'Organ', 0),
(48, 'Pan Flute', 0),
(49, 'Percussion', 0),
(50, 'Piccolo', 0),
(51, 'Pipe Organ', 0),
(52, 'Recorder', 0),
(53, 'Shamisen', 0),
(54, 'Sitar', 0),
(55, 'Snare Drum', 0),
(56, 'Steel Drums', 0),
(57, 'Synthesizer', 0),
(58, 'Tabla', 0),
(59, 'Tambourine', 0),
(60, 'Timpani', 0),
(61, 'Tin Whistle', 0),
(62, 'Triangle', 0),
(63, 'Trombone', 0),
(64, 'Trumpet (Piccolo)', 0),
(65, 'Tuba', 0),
(66, 'Ukulele', 0),
(67, 'Viola', 0),
(68, 'Viola da Gamba', 0),
(69, 'Violin (Electric)', 0),
(70, 'Vocal Effects', 0),
(71, 'Washboard', 0),
(72, 'Whistle', 0),
(73, 'Xylophone', 0),
(74, 'Zither', 0),
(75, 'Concertina', 0),
(76, 'Irish Bouzouki', 0),
(77, 'Jazz Drum Kit', 0),
(78, 'Marching Snare', 0),
(79, 'Electric Guitar', 0),
(80, 'Acoustic Guitar', 0),
(81, 'Classical Guitar', 0),
(82, 'Slide Guitar', 0),
(83, 'Flamenco Guitar', 0);

-- --------------------------------------------------------

--
-- Table structure for table `level`
--

CREATE TABLE `level` (
  `level_id` int NOT NULL,
  `level_label` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `level`
--

INSERT INTO `level` (`level_id`, `level_label`) VALUES
(0, 'Beginner'),
(1, 'Intermediate'),
(2, 'Advanced');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `message_id` int NOT NULL,
  `tutor_id` int DEFAULT NULL,
  `student_id` int DEFAULT NULL,
  `sender_role` enum('student','tutor') NOT NULL,
  `message_text` text NOT NULL,
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  `message_read` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`message_id`, `tutor_id`, `student_id`, `sender_role`, `message_text`, `timestamp`, `message_read`) VALUES
(1, 1, 17, 'student', 'Hi Samantha, are you available for a lesson next week?', '2025-07-31 18:41:12', 0),
(2, 1, 17, 'tutor', 'Yes! I have availability on Monday or Wednesday afternoon.', '2025-07-31 18:41:12', 0),
(3, 1, 17, 'student', 'Great! Let’s go for Wednesday at 4pm if that works?', '2025-07-31 18:41:12', 0),
(4, 1, 17, 'tutor', 'Perfect, I’ll send you a booking link shortly.', '2025-07-31 18:41:12', 0),
(8, 1, 17, 'student', 'That sounds fantastic.', '2025-08-29 19:12:31', 0),
(11, 2, 17, 'student', 'Hello James, massively interested in learning the guitar moving forward here.', '2025-07-31 19:53:07', 0),
(12, 2, 17, 'tutor', 'Brilliant David. When suits you to get started?', '2025-07-31 19:54:07', 0),
(16, 7, 17, 'student', 'Hello Lucy. I am looking to enquire about your availability to teach in schools. I see you are DBS certified and a qualified teacher.', '2025-08-01 14:56:40', 0),
(19, 2, 17, 'student', 'Next Friday?', '2025-08-01 15:52:02', 0),
(32, 10, 17, 'student', 'Hi Molly, I got a two star rating and excellent feedback for my lesson performance - was this an error?', '2025-08-29 18:08:06', 0),
(33, 10, 17, 'tutor', 'Apologies! I will amend that now. You are doing great!', '2025-08-29 18:28:17', 0),
(34, 1, 2, 'student', 'Hi Sam - Any availability this Friday?', '2025-08-27 09:03:18', 0),
(35, 1, 3, 'student', 'Can we reschdule Thursday Sam?', '2025-08-27 13:14:18', 0),
(36, 1, 5, 'student', 'What was the name of the book you suggested Sam?', '2025-08-25 15:17:37', 0),
(37, 1, 20, 'student', 'Hi! Just checking what time the lesson is tomorrow?', '2025-08-26 09:15:12', 0),
(38, 1, 21, 'tutor', 'Great progress today — try to review the second page before next week.', '2025-08-25 17:42:33', 0),
(39, 1, 22, 'student', 'Can you remind me what key Piece 3 is in?', '2025-08-27 12:08:19', 0),
(40, 1, 23, 'tutor', 'Don’t forget to bring your scale book on Thursday.', '2025-08-24 10:30:00', 0),
(41, 1, 24, 'student', 'Would it be okay to move our session to Friday?', '2025-08-28 08:54:51', 0),
(42, 1, 25, 'tutor', 'Let me know if you need help accessing the practice tracks.', '2025-08-26 14:11:45', 0),
(43, 1, 26, 'student', 'Hi! I think I left my pencil case in the room — any chance it’s still there?', '2025-08-25 18:03:09', 0),
(44, 1, 27, 'tutor', 'Well done today — your rhythm has improved a lot.', '2025-08-23 16:25:37', 0),
(45, 1, 28, 'student', 'Thanks for the lesson! I’ll try to get more practice in before next time.', '2025-08-27 19:12:04', 0);

-- --------------------------------------------------------

--
-- Table structure for table `qualification_status`
--

CREATE TABLE `qualification_status` (
  `qualification_status_id` int NOT NULL,
  `qualification_status_label` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `qualification_status`
--

INSERT INTO `qualification_status` (`qualification_status_id`, `qualification_status_label`) VALUES
(0, 'Not Qualified'),
(1, 'Qualified');

-- --------------------------------------------------------

--
-- Table structure for table `sen_status`
--

CREATE TABLE `sen_status` (
  `sen_status_id` int NOT NULL,
  `sen_status_label` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `sen_status`
--

INSERT INTO `sen_status` (`sen_status_id`, `sen_status_label`) VALUES
(0, 'Not SEN Qualified'),
(1, 'SEN Qualified');

-- --------------------------------------------------------

--
-- Table structure for table `student`
--

CREATE TABLE `student` (
  `student_id` int NOT NULL,
  `student_username` varchar(30) NOT NULL,
  `student_email` varchar(254) NOT NULL,
  `student_first_name` varchar(35) NOT NULL,
  `student_last_name` varchar(35) NOT NULL,
  `student_password` varchar(255) NOT NULL,
  `student_phone` varchar(20) NOT NULL,
  `student_verified_email` tinyint(1) NOT NULL DEFAULT '0',
  `student_registration_date` date NOT NULL,
  `student_verification_date` datetime DEFAULT NULL,
  `student_password_reset_token` varchar(255) DEFAULT NULL,
  `student_password_reset_expires` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `student`
--

INSERT INTO `student` (`student_id`, `student_username`, `student_email`, `student_first_name`, `student_last_name`, `student_password`, `student_phone`, `student_verified_email`, `student_registration_date`, `student_verification_date`, `student_password_reset_token`, `student_password_reset_expires`) VALUES
(1, 'alice123', 'alice@example.com', 'Alice', 'Taylor', 'hashedpassword', '07900111221', 1, '2025-06-01', '2025-08-06 19:56:48', 'bf6594e2c0cea64ee3b09c23b683ebb19d736433d00093f509adb081deb249d6', '2025-07-23 15:51:08'),
(2, 'benji88', 'ben@example.com', 'Ben', 'Williams', 'hashedpassword', '07900111222', 1, '2025-06-03', '2025-08-06 18:38:13', NULL, NULL),
(3, 'carla456', 'carla@example.com', 'Carla', 'O\'Neill', 'hashedpassword', '07900111223', 1, '2025-06-05', '2025-08-06 18:42:07', NULL, NULL),
(4, 'davidx', 'david@example.com', 'David', 'Nguyen', 'hashedpassword', '07900111224', 1, '2025-06-10', NULL, NULL, NULL),
(5, 'emma_music', 'emma@example.com', 'Emma', 'Brown', 'hashedpassword', '07900111225', 1, '2025-06-12', NULL, NULL, NULL),
(7, 'hshsh', 'emma2@example.com', 'John', 'O\'Dowd', '$2b$12$OUW8CSmeuKpVwgHSveUQKeMTc4AaRcqeTh4AFyc4t6jK6y51A0nRm', '07835478963', 0, '2025-07-21', NULL, NULL, NULL),
(8, 'jdjdjd', 'jddkkd@mc.com', 'John', 'Heloo', '$2b$12$uF/mdK.trSyv7Dw4rK7NrO9KBtrupRLo5d9oSJ/mzSnpPYC6kFgse', '12345678912', 0, '2025-07-21', NULL, NULL, NULL),
(9, 'dhjsbsacjcvj', 'john@john.com', 'John', 'Hamill', '$2b$12$72g3BFTgzKhTM06m/W18k.7RPl28M1E55Zy0onW.orGTt.6ajSXdC', '07835402541', 0, '2025-07-21', NULL, NULL, NULL),
(11, 'UM123', 'unameabh@gmail.com', 'Úna Méabh', 'Uí Anluain', '$2b$12$hIRk3CP.xYQDHPLaLRFqg.Y0n493gB0zdqzZ21IyzKQJn.2YAKn9e', '07835401388', 0, '2025-07-21', NULL, NULL, NULL),
(13, 'Pete', 'pete@pete.com', 'Peter', 'Pan', '$2b$12$iGLXJZv5Cs9669C75ge7XeXW2bjKgQcydO.AIWoi4Jg82jSLhtXnG', '07835401388', 0, '2025-07-21', NULL, NULL, NULL),
(14, 'Jonty123', 'john@john1.com', 'David', 'Johnston', '$2b$12$tTBP6ejIT0s6uY5xioPSXe6.uebAUZiCKfUmAXeCONnXzErCqsJ.C', '07777789789', 0, '2025-07-22', NULL, NULL, NULL),
(15, 'David', 'david@david.com', 'David', 'O\'Hanlon', '$2b$12$gZkC9kpjAtH7DyBxWw0k..yxQLsXtGKxVuNPEsNZe38LhfdVqT69a', '07835401388', 0, '2025-07-23', NULL, NULL, NULL),
(16, 'Test', 'test@test.com', 'Test', 'Test', '$2b$12$Uvawme1/kRaZKksptEhHL.E4uHGWeKtvw8WrfwQ.6/KILCaPRBS7S', '11111111111', 0, '2025-07-23', NULL, NULL, NULL),
(17, 'David123', 'davidohanlon85@googlemail.com', 'David', 'O\'Hanlon', '$2b$12$/ShSdgvhk9Pyd7bYcO0W4e20ZjoMaBiVKNDB9O06D8rIT5uZWS7qm', '07835401251', 0, '2025-07-23', NULL, NULL, NULL),
(18, 'sarah.oldie', 'sarah.oldie@example.com', 'Sarah', 'Oldie', '$2b$10$hashedmockpasshere', '0711111111', 1, '2023-04-15', NULL, NULL, NULL),
(19, 'tom.veteran', 'tom.vet@example.com', 'Tom', 'Veteran', '$2b$10$hashedmockpasshere', '0722222222', 1, '2023-09-10', NULL, NULL, NULL),
(20, 'lisa.legacy', 'lisa.legacy@example.com', 'Lisa', 'Legacy', '$2b$10$hashedmockpasshere', '0733333333', 1, '2023-01-21', NULL, NULL, NULL),
(21, 'kevin.archive', 'kevin.archive@example.com', 'Kevin', 'Archive', '$2b$10$hashedmockpasshere', '0744444444', 1, '2023-07-03', NULL, NULL, NULL),
(22, 'amy.ancient', 'amy.ancient@example.com', 'Amy', 'Ancient', '$2b$10$hashedmockpasshere', '0755555555', 1, '2023-12-11', NULL, NULL, NULL),
(23, 'chris.2024', 'chris.2024@example.com', 'Chris', 'Future', '$2b$10$hashedmockpasshere', '0766666666', 1, '2024-03-18', NULL, NULL, NULL),
(24, 'nina.2024', 'nina.2024@example.com', 'Nina', 'Forward', '$2b$10$hashedmockpasshere', '0777777777', 1, '2024-06-25', NULL, NULL, NULL),
(25, 'ben.2024', 'ben.2024@example.com', 'Ben', 'Leap', '$2b$10$hashedmockpasshere', '0788888888', 1, '2024-10-02', NULL, NULL, NULL),
(26, 'olga.2024', 'olga.2024@example.com', 'Olga', 'Next', '$2b$10$hashedmockpasshere', '0799999999', 1, '2024-01-09', NULL, NULL, NULL),
(27, 'dave.2024', 'dave.2024@example.com', 'Dave', 'Modern', '$2b$10$hashedmockpasshere', '0700000000', 1, '2024-12-19', NULL, NULL, NULL),
(28, 'zoe.july', 'zoe.july@example.com', 'Zoe', 'July', '$2b$10$hashedmockpasshere', '0710101010', 1, '2025-07-02', NULL, NULL, NULL),
(29, 'leo.july', 'leo.july@example.com', 'Leo', 'July', '$2b$10$hashedmockpasshere', '0720202020', 1, '2025-07-10', NULL, NULL, NULL),
(30, 'mia.july', 'mia.july@example.com', 'Mia', 'July', '$2b$10$hashedmockpasshere', '0730303030', 1, '2025-07-16', NULL, NULL, NULL),
(31, 'jack.july', 'jack.july@example.com', 'Jack', 'July', '$2b$10$hashedmockpasshere', '0740404040', 1, '2025-07-23', NULL, NULL, NULL),
(32, 'ella.july', 'ella.july@example.com', 'Ella', 'July', '$2b$10$hashedmockpasshere', '0750505050', 1, '2025-07-30', NULL, NULL, NULL),
(33, 'ruby.aug', 'ruby.aug@example.com', 'Ruby', 'August', '$2b$10$hashedmockpasshere', '0760606060', 1, '2025-08-01', NULL, NULL, NULL),
(34, 'kai.aug', 'kai.aug@example.com', 'Kai', 'August', '$2b$10$hashedmockpasshere', '0770707070', 1, '2025-08-03', NULL, NULL, NULL),
(35, 'finn.aug', 'finn.aug@example.com', 'Finn', 'August', '$2b$10$hashedmockpasshere', '0780808080', 1, '2025-08-04', NULL, NULL, NULL),
(36, 'luna.aug', 'luna.aug@example.com', 'Luna', 'August', '$2b$10$hashedmockpasshere', '0790909090', 1, '2025-08-05', NULL, NULL, NULL),
(37, 'noah.aug', 'noah.aug@example.com', 'Noah', 'August', '$2b$10$hashedmockpasshere', '0707070707', 1, '2025-08-06', NULL, NULL, NULL),
(39, 'Jonny1985', 'j.byres@googlemail.com', 'Jonathon', 'Byres', '$2b$12$gJ2ttwqWUUI7sqAYNklORu6X3fqu3bZa2dodcfufubKfwhMJTw9GK', '07835234511', 0, '2025-08-29', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `student_feedback`
--

CREATE TABLE `student_feedback` (
  `feedback_id` int NOT NULL,
  `feedback_text` varchar(180) NOT NULL,
  `feedback_score` tinyint UNSIGNED NOT NULL,
  `feedback_date` date NOT NULL,
  `tutor_id` int NOT NULL,
  `student_id` int NOT NULL,
  `booking_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `student_feedback`
--

INSERT INTO `student_feedback` (`feedback_id`, `feedback_text`, `feedback_score`, `feedback_date`, `tutor_id`, `student_id`, `booking_id`) VALUES
(6, 'Samantha makes lessons feel relaxed but productive. I finally enjoy practicing again!', 5, '2025-06-18', 1, 1, 93),
(7, 'Her patience and creativity made a big difference. I’m progressing faster than expected.', 5, '2025-06-22', 1, 2, 93),
(8, 'Great teacher. Encouraging, structured and full of positive energy!', 4, '2025-06-25', 1, 3, 93),
(9, 'I was nervous returning to music, but Samantha made me feel at ease right away.', 5, '2025-07-01', 1, 4, 93),
(10, 'Clear, kind, and professional. My confidence and skills have grown massively.', 5, '2025-07-04', 1, 5, 93),
(11, 'Samantha\'s passion shines through every lesson. Highly recommended!', 5, '2025-06-10', 1, 1, 93),
(12, 'She\'s structured and inspiring. My child loves her sessions!', 5, '2025-06-15', 1, 2, 93),
(13, 'Lessons are clear and effective. I\'ve improved quickly.', 4, '2025-06-18', 1, 3, 93),
(14, 'Always encouraging, great for nervous learners like me!', 5, '2025-06-20', 1, 4, 93),
(15, 'Samantha made theory easy to understand. Thanks!', 4, '2025-06-22', 1, 5, 93),
(16, 'James brings energy and fun to every piano session!', 5, '2025-06-11', 2, 1, 93),
(17, 'I returned to piano after 10 years and feel confident now.', 5, '2025-06-16', 2, 2, 93),
(18, 'My daughter loves James’s teaching style. Highly rated!', 4, '2025-06-19', 2, 3, 93),
(19, 'Supportive, friendly, and knowledgeable tutor!', 5, '2025-06-21', 2, 4, 93),
(20, 'James makes each class something to look forward to.', 5, '2025-06-23', 2, 5, 93),
(21, 'Laura’s violin classes are magical. So patient and clear!', 5, '2025-06-09', 3, 1, 93),
(22, 'Her passion is infectious and really motivates me.', 5, '2025-06-13', 3, 2, 93),
(23, 'Laura helped me prepare for a performance — amazing!', 4, '2025-06-17', 3, 3, 93),
(24, 'She\'s gentle but firm. I’ve made great progress!', 5, '2025-06-20', 3, 4, 93),
(25, 'Couldn’t ask for a better violin teacher. Grateful!', 5, '2025-06-22', 3, 5, 93),
(26, 'Aidan’s guitar lessons are dynamic and inspiring!', 5, '2025-06-10', 4, 1, 93),
(27, 'He adapts to your style while teaching key techniques.', 4, '2025-06-14', 4, 2, 93),
(28, 'Fun and challenging lessons that push me forward.', 5, '2025-06-18', 4, 3, 93),
(29, 'Aidan helped me get performance-ready in weeks.', 5, '2025-06-21', 4, 4, 93),
(30, 'Clear, fun, and practical. Learning is effortless!', 5, '2025-06-23', 4, 5, 93),
(31, 'Meera is fantastic with young learners. So patient!', 5, '2025-06-12', 5, 1, 93),
(32, 'Great SEN support and fantastic energy!', 5, '2025-06-15', 5, 2, 93),
(33, 'She explains rhythm in a way that finally makes sense.', 4, '2025-06-17', 5, 3, 93),
(34, 'Meera\'s classes are upbeat and engaging!', 5, '2025-06-20', 5, 4, 93),
(35, 'Perfect tutor for nervous beginners like me.', 5, '2025-06-22', 5, 5, 93),
(36, 'Sarah’s calm and patient style made learning flute enjoyable from day one.', 5, '2024-03-10', 6, 1, 93),
(37, 'Very clear and supportive explanations. I look forward to every session!', 5, '2024-04-02', 6, 2, 93),
(38, 'Patrick helped me refine my technique and build real performance confidence.', 5, '2024-02-18', 7, 3, 93),
(39, 'His enthusiasm is contagious — I’ve improved massively since starting lessons.', 4, '2024-03-05', 7, 4, 93),
(40, 'Clara tailors lessons to my goals and always keeps things engaging.', 5, '2024-01-29', 8, 5, 93),
(41, 'Kind, flexible, and talented — perfect for beginners and returners alike.', 5, '2024-03-15', 8, 1, 93),
(42, 'Sean breaks things down in a way that finally made sense to me.', 4, '2024-04-01', 9, 2, 93),
(43, 'Big improvements in a short time — I now enjoy practicing every day.', 5, '2024-04-20', 9, 3, 93),
(46, 'Áine has a brilliant ear and a really warm teaching style.', 5, '2024-03-08', 10, 4, 93),
(47, 'Lessons are fun, focused, and leave me feeling more confident each week.', 5, '2024-04-12', 10, 5, 93),
(58, 'Samantha is an exceptional tutor — patient and incredibly clear.', 5, '2025-06-01', 1, 1, 93),
(59, 'Great lessons, though I wish we had more ear training practice.', 4, '2025-06-03', 1, 2, 93),
(60, 'My confidence has grown so much thanks to her support!', 5, '2025-06-05', 1, 3, 93),
(61, 'Good tutor, but sometimes too fast-paced for my level.', 3, '2025-06-07', 1, 4, 93),
(62, 'Absolutely loved my sessions — highly recommend.', 5, '2025-06-09', 1, 5, 93),
(63, 'Didn’t feel fully supported during the lessons.', 2, '2025-06-11', 1, 1, 93),
(64, 'Very kind and explains music theory really well.', 4, '2025-06-13', 1, 2, 93),
(65, 'Perfect mix of fun and focus. Learned loads!', 5, '2025-06-15', 1, 3, 93),
(66, 'Unfortunately not a great fit for my learning style.', 1, '2025-06-17', 1, 4, 93),
(67, 'Okay experience, could use more structured lessons.', 3, '2025-06-19', 1, 5, 93),
(68, 'Samantha helped me prepare for my exam — I passed with distinction!', 5, '2025-06-21', 1, 1, 93),
(69, 'Such a positive and motivating teacher.', 5, '2025-06-23', 1, 2, 93),
(70, 'Enjoyed the lessons, especially the improv exercises.', 4, '2025-06-25', 1, 3, 93),
(71, 'Struggled to keep up, might not suit beginners.', 2, '2025-06-27', 1, 4, 93),
(72, 'One of the best tutors I’ve ever had!', 5, '2025-06-29', 1, 5, 93),
(117, 'Absolutely wonderful teacher', 5, '2025-07-07', 1, 1, 93),
(118, 'Very patient and engaging!', 5, '2025-06-20', 1, 2, 94),
(119, 'Good teacher but sometimes rushed', 3, '2024-07-15', 1, 4, 96),
(120, 'Helpful but could improve lesson structure', 3, '2023-06-10', 1, 5, 97),
(132, 'Quality teacher - would recommend!', 5, '2025-08-07', 1, 17, 230),
(134, 'Great lessons', 5, '2025-08-05', 18, 2, 249),
(135, 'Great lessons', 5, '2025-08-05', 18, 1, 249),
(136, 'Great lessons', 5, '2025-08-05', 18, 3, 249),
(137, 'Great lessons', 5, '2025-08-05', 18, 4, 249),
(138, 'Great lessons', 5, '2025-08-05', 18, 5, 249),
(140, 'Great lessons', 5, '2025-08-05', 18, 7, 249),
(141, 'Great lessons', 5, '2025-08-05', 18, 8, 249),
(142, 'Great lessons', 5, '2025-08-05', 18, 9, 249),
(144, 'Great lessons', 4, '2025-08-05', 18, 11, 249),
(145, 'Fantastic lesson!', 5, '2025-08-29', 10, 17, 242),
(146, 'Great class.', 5, '2025-08-29', 9, 17, 244);

-- --------------------------------------------------------

--
-- Table structure for table `tutor`
--

CREATE TABLE `tutor` (
  `tutor_id` int NOT NULL,
  `tutor_username` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `tutor_email` varchar(254) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `tutor_verified_email` tinyint NOT NULL,
  `tutor_phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `tutor_first_name` varchar(35) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `tutor_second_name` varchar(35) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `tutor_image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `tutor_address_line_1` varchar(100) NOT NULL,
  `tutor_address_line_2` varchar(100) DEFAULT NULL,
  `tutor_city` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `tutor_postcode` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `tutor_country` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `tutor_modality` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `tutor_price` int UNSIGNED NOT NULL,
  `tutor_teaching_start_date` date NOT NULL,
  `tutor_tag_line` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `tutor_bio_paragraph_1` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `tutor_bio_paragraph_2` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `tutor_registration_date` date NOT NULL,
  `tutor_approval_date` date DEFAULT NULL,
  `tutor_password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `tutor_password_reset_token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `tutor_password_reset_expires` datetime DEFAULT NULL,
  `tutor_stripe_account_id` varchar(255) NOT NULL,
  `tutor_dbs` int NOT NULL,
  `tutor_qualified` int NOT NULL,
  `tutor_gender` int NOT NULL,
  `tutor_sen` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tutor`
--

INSERT INTO `tutor` (`tutor_id`, `tutor_username`, `tutor_email`, `tutor_verified_email`, `tutor_phone`, `tutor_first_name`, `tutor_second_name`, `tutor_image`, `tutor_address_line_1`, `tutor_address_line_2`, `tutor_city`, `tutor_postcode`, `tutor_country`, `tutor_modality`, `tutor_price`, `tutor_teaching_start_date`, `tutor_tag_line`, `tutor_bio_paragraph_1`, `tutor_bio_paragraph_2`, `tutor_registration_date`, `tutor_approval_date`, `tutor_password`, `tutor_password_reset_token`, `tutor_password_reset_expires`, `tutor_stripe_account_id`, `tutor_dbs`, `tutor_qualified`, `tutor_gender`, `tutor_sen`) VALUES
(1, 'samwill', 'davidohanlon85@googlemail.com', 1, '07900111222', 'Samantha', 'Williamson', '/uploads/tutor_images/Testimonial1.jpg', '16A Malone Rd', NULL, 'Belfast', 'BT9 5BN', 'UK', 'Online', 35, '2015-09-01', 'Helping you play your first melody well', 'Samantha Williamson is a passionate musician and dedicated educator who has spent over a decade inspiring students with her dynamic teaching style. Having toured internationally as a session guitarist, she brings not just theory but lived experience into every lesson. Her commitment to musical excellence is balanced by a deep empathy for her students, making her classes inclusive, motivating, and tailored to each learner\'s pace and personality.', 'Samantha specializes in working with a wide range of students, from young beginners to experienced players preparing for exams or auditions. Her SEN training allows her to develop individualized approaches that empower every student. She believes music is more than skill — it’s about confidence, joy, and connection. Students regularly praise her clarity, patience, and enthusiasm.', '2025-07-07', '2025-08-06', '$2b$12$v0mIRDB37/kulSNnSIIDmuK57L71nQh2d4DWFMhRzSC4hA/gB7lvW', '1255331e85bd550853477064b4f30c0e0c7016899a0fa2b1cf6ceec3dc8a0ad7', '2025-08-28 13:39:34', 'acct_1S1s5sQ4ibhEMAZU', 1, 1, 0, 1),
(2, 'jmcauley', 'james@notely.com', 1, '07900111223', 'James', 'McAuley', '/uploads/tutor_images/Testimonial3.jpg', '51 Oxford Street', NULL, 'Manchester', 'M1 6EQ', 'UK', 'In-person', 62, '2012-01-15', 'Strumming confidence into every chord', 'James McAuley is a classically trained pianist and composer with over 15 years of teaching experience across schools, studios, and private settings. Known for his calm demeanor and expert technique, James creates a learning space where students feel comfortable pushing themselves musically. He balances technical rigor with creative exploration, introducing improvisation, theory, and performance practice at all levels.', 'James has successfully prepared students for ABRSM and Trinity exams, helping them achieve high distinctions. He adapts each lesson to suit the student\'s pace, offering strategies to overcome anxiety, perfect challenging pieces, or write original compositions. As a believer in lifelong learning, he also teaches adult learners rediscovering music.', '2024-07-07', '2025-07-07', '', NULL, NULL, '', 1, 1, 1, 0),
(3, 'lbrennan', 'laura@notely.com', 1, '07900111224', 'Laura', 'Brennan', '/uploads/tutor_images/Testimonial2.jpg', '23 Nicolson Square', NULL, 'Edinburgh', 'EH8 9BX', 'UK', 'Hybrid', 40, '2016-04-10', 'Let’s find your musical voice', 'Laura Brennan brings rhythm, energy, and a powerful voice to every lesson. A percussionist and vocalist, she has performed with ensembles across the UK and Europe. Her teaching style is rooted in movement, expression, and inclusivity. Specializing in working with SEN students, Laura builds trust and creativity through tailored instruction that meets learners where they are.', 'Laura believes in the emotional power of music and uses it to help students express themselves and build resilience. Her dual specialism allows her to support students exploring both drums and voice. She integrates breathing, rhythm, and tone development into every session. Parents often note her positivity and how quickly their children connect with her.', '2024-07-07', NULL, '', NULL, NULL, '', 0, 1, 0, 1),
(4, 'astewart', 'aidan@notely.com', 1, '07900111225', 'Aidan', 'Stewart', '/uploads/tutor_images/Testimonial4.jpg', '88 Albany Road', NULL, 'Cardiff', 'CF24 3RS', 'UK', 'Online', 60, '2010-09-01', 'Play boldly, perform brilliantly', 'Aidan Stewart is a guitar and bass tutor with a rich background in jazz, rock, and contemporary music. With over 10 years of teaching experience, Aidan tailors his lessons to help students progress technically while encouraging their creative instincts. He focuses on ear training, improvisation, and strong rhythmic foundation, giving students the tools to jam, write, and perform with confidence.', 'Aidan has taught students from ages 8 to 60, supporting school-age learners with exam prep and mentoring adults returning to their instruments. He’s a firm believer in developing musical independence — teaching students how to practice efficiently and troubleshoot their own challenges. Friendly, patient, and incredibly knowledgeable, Aidan’s students often describe him as “the teacher who made music make sense.”', '2023-07-07', NULL, '', NULL, NULL, '', 1, 1, 1, 0),
(5, 'mthompson', 'meera@notely.com', 1, '07900111226', 'Meera', 'Thompson', '/uploads/tutor_images/Testimonial5.jpg', '200 Holloway Road', NULL, 'London', 'N7 8DB', 'UK', 'Hybrid', 37, '2018-01-20', 'Making rhythm feel natural and fun', 'Meera Thompson brings rhythm, energy, and a powerful voice to every lesson. A percussionist and vocalist, she has performed with ensembles across the UK and Europe. Her teaching style is rooted in movement, expression, and inclusivity. Specializing in working with SEN students, Meera builds trust and creativity through tailored instruction that meets learners where they are.', 'Meera believes in the emotional power of music and uses it to help students express themselves and build resilience. Her dual specialism allows her to support students exploring both drums and voice. She integrates breathing, rhythm, and tone development into every session. Parents often note her positivity and how quickly their children connect with her.', '2023-07-07', NULL, '', NULL, NULL, '', 1, 1, 0, 1),
(6, 'kroberts', 'kevin.roberts@notely.com', 1, '2255413901', 'Kevin', 'Roberts', '/uploads/tutor_images/Testimonial7.jpg', '56 Bedford Street', NULL, 'Belfast', 'BT2 7FE', 'UK', 'In-Person', 55, '2010-08-20', 'Helping young musicians find their voice', 'Kevin is a classically trained pianist with over a decade of teaching experience. His lessons are known for their structure, clarity, and warmth. Kevin creates custom lesson plans based on each student’s musical journey and is dedicated to nurturing their growth.', 'He believes in building confidence alongside skill and is especially passionate about helping learners prepare for graded exams and performances.', '2025-05-08', '2025-08-06', '', NULL, NULL, '', 1, 1, 1, 0),
(7, 'lcollins', 'lucy.collins@notely.com', 1, '07388215678', 'Lucy', 'Collins', '/uploads/tutor_images/Testimonial6.jpg', '3 Wellington Place', NULL, 'Belfast', 'BT1 6HT', 'UK', 'Online', 45, '2015-01-10', 'Building joy through music', 'Lucy is a patient, energetic tutor who teaches flute and clarinet with a joyful, student-led approach. She incorporates storytelling and games into lessons for younger learners, making every session fun and memorable.', 'She supports both beginners and advanced players and helps them unlock their potential while making music a lifelong source of happiness.', '2025-07-08', '2025-08-11', '', NULL, NULL, '', 1, 1, 0, 1),
(8, 'tlee', 'tanya.lee@notely.com', 1, '07700552288', 'Tanya', 'Lee', '/uploads/tutor_images/Testimonial8.jpg', '14 Strand Road', NULL, 'Derry', 'BT48 7AB', 'UK', 'Hybrid', 58, '2008-03-15', 'Technique with creativity', 'Tanya combines her background in jazz saxophone with a technical and expressive approach to teaching. She’s worked with adult learners, school ensembles, and music academies across Northern Ireland.', 'Her goal is to cultivate both confidence and improvisational freedom in her students.', '2025-01-01', '2025-07-08', '', NULL, NULL, '', 1, 1, 0, 0),
(9, 'jgray', 'josh.gray@notely.com', 1, '07899922334', 'Josh', 'Gray', '/uploads/tutor_images/Testimonial10.jpg', '8 Central Promenade', NULL, 'Newcastle', 'BT33 0AA', 'UK', 'In-Person', 52, '2016-09-01', 'Music that moves you', 'Josh teaches trumpet and brass with a focus on expressive playing and disciplined technique. With experience in orchestras and youth bands, he brings energy and clear progression into every lesson.', 'He is DBS-certified and SEN-aware, welcoming learners of all backgrounds and needs.', '2025-07-08', '2025-08-11', '', NULL, NULL, '', 1, 1, 1, 1),
(10, 'mmurphy', 'molly.murphy@notely.com', 1, '07712987312', 'Molly', 'Murphy', '/uploads/tutor_images/Testimonial13.jpg', '2 Townhall Street', NULL, 'Enniskillen', 'BT74 7BA', 'UK', 'Online', 47, '2014-06-18', 'Inspiring creativity through cello', 'Molly is a passionate cellist who brings a nurturing presence to every lesson. She adapts her teaching for each student, ensuring progress is made in a relaxed and supportive atmosphere.', 'From primary school beginners to grade-level students, Molly’s guidance and attention help develop both skill and musical expression.', '2025-07-08', '2025-07-08', '', NULL, NULL, '', 1, 1, 0, 1),
(18, 'Gerard', 'gerard@gmail.com', 0, '07835401388', 'Dáithí', 'Ó hAnluain', '/uploads/tutor_images/O\'Hanlon, David.jpeg', '11 Moor Park Mews', NULL, 'Belfast', 'BT10 0QQ', 'United Kingdom', 'In-Person', 80, '2007-07-16', 'Inspiring Students to Be Their Best', 'Samantha Williamson is a passionate musician and dedicated educator who has spent over a decade inspiring students with her dynamic teaching style. Having toured internationally as a session guitarist, she brings not just theory but lived experience into every lesson. Her commitment to musical excellence is balanced by a deep empathy for her students, making her classes inclusive, motivating, and tailored to each learner\'s pace and personality.', 'Samantha specializes in working with a wide range of students, from young beginners to experienced players preparing for exams or auditions. Her SEN training allows her to develop individualized approaches that empower every student. She believes music is more than skill — it’s about confidence, joy, and connection. Students regularly praise her clarity, patience, and enthusiasm.', '2025-07-29', NULL, '$2b$12$PDIz02NyPG1..S657jCJR.JygnJC8lNCHrFVTvSF8hG7baV/Re.Ju', NULL, NULL, '', 1, 1, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `tutor_availability_override`
--

CREATE TABLE `tutor_availability_override` (
  `override_id` int NOT NULL,
  `override_date` date NOT NULL,
  `override_time_slot` time NOT NULL,
  `override_is_available` tinyint(1) NOT NULL DEFAULT '1',
  `override_created_at` timestamp NOT NULL,
  `override_updated_at` timestamp NOT NULL,
  `tutor_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tutor_availability_override`
--

INSERT INTO `tutor_availability_override` (`override_id`, `override_date`, `override_time_slot`, `override_is_available`, `override_created_at`, `override_updated_at`, `tutor_id`) VALUES
(10, '2025-08-08', '09:00:00', 0, '2025-08-06 12:05:20', '2025-08-06 12:05:20', 1),
(11, '2025-08-08', '10:00:00', 0, '2025-08-06 12:05:20', '2025-08-06 12:05:20', 1);

-- --------------------------------------------------------

--
-- Table structure for table `tutor_feedback`
--

CREATE TABLE `tutor_feedback` (
  `feedback_id` int NOT NULL,
  `feedback_date` date NOT NULL,
  `performance_score` tinyint UNSIGNED NOT NULL,
  `homework` varchar(50) DEFAULT NULL,
  `notes` varchar(50) DEFAULT NULL,
  `booking_id` int NOT NULL,
  `tutor_id` int NOT NULL,
  `student_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tutor_feedback`
--

INSERT INTO `tutor_feedback` (`feedback_id`, `feedback_date`, `performance_score`, `homework`, `notes`, `booking_id`, `tutor_id`, `student_id`) VALUES
(42, '2025-08-07', 5, 'Piece 2', 'New notebook needed.', 135, 1, 17),
(43, '2025-08-14', 4, 'Scales in G major', 'Try to focus on left-hand positioning.', 143, 1, 17),
(44, '2025-08-21', 3, 'Piece 3 (first half)', 'Practice was minimal this week.', 252, 1, 17),
(45, '2025-08-28', 5, 'Full Piece 1', 'Excellent tone and phrasing.', 140, 1, 17),
(46, '2025-09-04', 4, 'Arpeggios', 'Still rushing slightly — use metronome.', 137, 1, 17),
(47, '2025-09-11', 2, 'No set homework', 'Student was distracted and unfocused today.', 136, 1, 17),
(48, '2025-09-18', 5, 'New Piece 4', 'Strong improvement; keep momentum.', 139, 1, 17),
(49, '2025-09-25', 4, 'Piece 4 + Sight Reading', 'Good effort — sight reading improving.', 142, 1, 17),
(50, '2025-10-02', 5, 'Practice exam material', 'Ready for mock exam next week.', 141, 1, 17),
(51, '2025-10-09', 3, 'Scales review', 'Scales need tightening before exam.', 138, 1, 17),
(52, '2025-08-05', 4, 'Warm-up exercises + Piece A', 'Focus on transitions.', 105, 6, 17),
(53, '2025-08-12', 5, 'Piece B first section', 'Excellent rhythm and musicality.', 109, 6, 17),
(54, '2025-08-19', 3, 'Chord progressions in C', 'Some confusion with finger placement.', 112, 6, 17),
(55, '2025-08-07', 1, 'Piece 2', 'More practice needed.', 120, 1, 17),
(56, '2025-07-22', 2, 'Major scale drills', 'Excellent accuracy and tempo control.', 237, 10, 17),
(57, '2025-07-29', 3, 'Intro to Piece C', 'Good start — work on dynamics.', 242, 10, 17),
(58, '2025-08-05', 3, 'Rhythm patterns', 'Struggled with syncopation — review with clapping.', 243, 10, 17),
(59, '2025-08-30', 5, 'Examination Piece 3', 'Focus on rhythm.', 266, 1, 2);

-- --------------------------------------------------------

--
-- Table structure for table `tutor_instrument`
--

CREATE TABLE `tutor_instrument` (
  `tutor_instrument_id` int NOT NULL,
  `tutor_id` int DEFAULT NULL,
  `instrument_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tutor_instrument`
--

INSERT INTO `tutor_instrument` (`tutor_instrument_id`, `tutor_id`, `instrument_id`) VALUES
(1, 1, 1),
(2, 1, 2),
(3, 2, 1),
(4, 3, 2),
(5, 3, 5),
(6, 4, 3),
(7, 5, 4),
(8, 5, 5),
(9, 6, 1),
(10, 6, 2),
(11, 7, 3),
(12, 7, 6),
(13, 8, 2),
(14, 8, 5),
(15, 9, 1),
(16, 9, 4),
(17, 9, 9),
(18, 10, 5),
(19, 10, 8),
(26, 18, 2),
(27, 18, 4);

-- --------------------------------------------------------

--
-- Table structure for table `tutor_level`
--

CREATE TABLE `tutor_level` (
  `tutor_level_id` int NOT NULL,
  `tutor_id` int NOT NULL,
  `level_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tutor_level`
--

INSERT INTO `tutor_level` (`tutor_level_id`, `tutor_id`, `level_id`) VALUES
(9, 1, 0),
(10, 1, 1),
(11, 2, 0),
(12, 3, 1),
(13, 4, 2),
(14, 5, 0),
(15, 5, 1),
(16, 5, 2),
(17, 6, 0),
(18, 6, 1),
(19, 7, 1),
(20, 7, 2),
(21, 8, 0),
(22, 8, 1),
(23, 8, 2),
(24, 9, 0),
(25, 10, 1),
(26, 10, 2),
(34, 9, 0),
(35, 10, 1),
(36, 10, 2),
(43, 18, 0),
(44, 18, 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`admin_id`),
  ADD UNIQUE KEY `admin_email` (`admin_email`),
  ADD UNIQUE KEY `admin_username` (`admin_username`);

--
-- Indexes for table `availability`
--
ALTER TABLE `availability`
  ADD PRIMARY KEY (`availability_id`),
  ADD KEY `FK_tutor_tutor_id_6` (`tutor_id`);

--
-- Indexes for table `booking`
--
ALTER TABLE `booking`
  ADD PRIMARY KEY (`booking_id`),
  ADD KEY `FK_student_student_id_2` (`student_id`),
  ADD KEY `FK_tutor_tutor_id_7` (`tutor_id`),
  ADD KEY `FK_booking_status_booking_status_id` (`booking_status`);

--
-- Indexes for table `booking_status`
--
ALTER TABLE `booking_status`
  ADD PRIMARY KEY (`booking_status_id`);

--
-- Indexes for table `certification`
--
ALTER TABLE `certification`
  ADD PRIMARY KEY (`certification_id`),
  ADD KEY `FK_tutor_tutor_id_4` (`tutor_id`);

--
-- Indexes for table `dbs_status`
--
ALTER TABLE `dbs_status`
  ADD PRIMARY KEY (`dbs_status_id`);

--
-- Indexes for table `education`
--
ALTER TABLE `education`
  ADD PRIMARY KEY (`education_id`),
  ADD KEY `FK_tutor_tutor_id_3` (`tutor_id`);

--
-- Indexes for table `gender`
--
ALTER TABLE `gender`
  ADD PRIMARY KEY (`gender_id`);

--
-- Indexes for table `instrument`
--
ALTER TABLE `instrument`
  ADD PRIMARY KEY (`instrument_id`);

--
-- Indexes for table `level`
--
ALTER TABLE `level`
  ADD PRIMARY KEY (`level_id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`message_id`),
  ADD KEY `FK_tutor_tutor_id_10` (`tutor_id`),
  ADD KEY `FK_student_student_id_10` (`student_id`);

--
-- Indexes for table `qualification_status`
--
ALTER TABLE `qualification_status`
  ADD PRIMARY KEY (`qualification_status_id`);

--
-- Indexes for table `sen_status`
--
ALTER TABLE `sen_status`
  ADD PRIMARY KEY (`sen_status_id`);

--
-- Indexes for table `student`
--
ALTER TABLE `student`
  ADD PRIMARY KEY (`student_id`),
  ADD UNIQUE KEY `student_username` (`student_username`),
  ADD UNIQUE KEY `student_email` (`student_email`);

--
-- Indexes for table `student_feedback`
--
ALTER TABLE `student_feedback`
  ADD PRIMARY KEY (`feedback_id`),
  ADD KEY `FK_tutor_tutor_id_5` (`tutor_id`),
  ADD KEY `FK_student_student_id` (`student_id`),
  ADD KEY `FK_booking_booking_id_3` (`booking_id`);

--
-- Indexes for table `tutor`
--
ALTER TABLE `tutor`
  ADD PRIMARY KEY (`tutor_id`),
  ADD KEY `FK_qualifcation_status_qualification_status_id` (`tutor_qualified`),
  ADD KEY `FK_sen_status_sen_status_id` (`tutor_sen`),
  ADD KEY `FK_dbs_status_dbs_status_id` (`tutor_dbs`),
  ADD KEY `FK_gender_gender_id` (`tutor_gender`);

--
-- Indexes for table `tutor_availability_override`
--
ALTER TABLE `tutor_availability_override`
  ADD PRIMARY KEY (`override_id`),
  ADD KEY `FK_tutor_tutor_id_8` (`tutor_id`);

--
-- Indexes for table `tutor_feedback`
--
ALTER TABLE `tutor_feedback`
  ADD PRIMARY KEY (`feedback_id`),
  ADD KEY `FK_booking_booking_id_2` (`booking_id`),
  ADD KEY `FK_tutor_tutor_id_9` (`tutor_id`),
  ADD KEY `FK_student_student_id_3` (`student_id`);

--
-- Indexes for table `tutor_instrument`
--
ALTER TABLE `tutor_instrument`
  ADD PRIMARY KEY (`tutor_instrument_id`),
  ADD KEY `FK_tutor_tutor_id` (`tutor_id`),
  ADD KEY `FK_instrument_instrument_id` (`instrument_id`);

--
-- Indexes for table `tutor_level`
--
ALTER TABLE `tutor_level`
  ADD PRIMARY KEY (`tutor_level_id`),
  ADD KEY `FK_tutor_tutor_id_2` (`tutor_id`),
  ADD KEY `FK_level_level_id` (`level_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `admin_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `availability`
--
ALTER TABLE `availability`
  MODIFY `availability_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=119;

--
-- AUTO_INCREMENT for table `booking`
--
ALTER TABLE `booking`
  MODIFY `booking_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=271;

--
-- AUTO_INCREMENT for table `booking_status`
--
ALTER TABLE `booking_status`
  MODIFY `booking_status_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `certification`
--
ALTER TABLE `certification`
  MODIFY `certification_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `dbs_status`
--
ALTER TABLE `dbs_status`
  MODIFY `dbs_status_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `education`
--
ALTER TABLE `education`
  MODIFY `education_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT for table `gender`
--
ALTER TABLE `gender`
  MODIFY `gender_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `instrument`
--
ALTER TABLE `instrument`
  MODIFY `instrument_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=84;

--
-- AUTO_INCREMENT for table `level`
--
ALTER TABLE `level`
  MODIFY `level_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `message_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT for table `qualification_status`
--
ALTER TABLE `qualification_status`
  MODIFY `qualification_status_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `sen_status`
--
ALTER TABLE `sen_status`
  MODIFY `sen_status_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `student`
--
ALTER TABLE `student`
  MODIFY `student_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `student_feedback`
--
ALTER TABLE `student_feedback`
  MODIFY `feedback_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=147;

--
-- AUTO_INCREMENT for table `tutor`
--
ALTER TABLE `tutor`
  MODIFY `tutor_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `tutor_availability_override`
--
ALTER TABLE `tutor_availability_override`
  MODIFY `override_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=131;

--
-- AUTO_INCREMENT for table `tutor_feedback`
--
ALTER TABLE `tutor_feedback`
  MODIFY `feedback_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT for table `tutor_instrument`
--
ALTER TABLE `tutor_instrument`
  MODIFY `tutor_instrument_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `tutor_level`
--
ALTER TABLE `tutor_level`
  MODIFY `tutor_level_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `availability`
--
ALTER TABLE `availability`
  ADD CONSTRAINT `FK_tutor_tutor_id_6` FOREIGN KEY (`tutor_id`) REFERENCES `tutor` (`tutor_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `booking`
--
ALTER TABLE `booking`
  ADD CONSTRAINT `FK_booking_status_booking_status_id` FOREIGN KEY (`booking_status`) REFERENCES `booking_status` (`booking_status_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `FK_student_student_id_2` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `FK_tutor_tutor_id_7` FOREIGN KEY (`tutor_id`) REFERENCES `tutor` (`tutor_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `certification`
--
ALTER TABLE `certification`
  ADD CONSTRAINT `FK_tutor_tutor_id_4` FOREIGN KEY (`tutor_id`) REFERENCES `tutor` (`tutor_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `education`
--
ALTER TABLE `education`
  ADD CONSTRAINT `FK_tutor_tutor_id_3` FOREIGN KEY (`tutor_id`) REFERENCES `tutor` (`tutor_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `FK_student_student_id_10` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `FK_tutor_tutor_id_10` FOREIGN KEY (`tutor_id`) REFERENCES `tutor` (`tutor_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `student_feedback`
--
ALTER TABLE `student_feedback`
  ADD CONSTRAINT `FK_booking_booking_id_3` FOREIGN KEY (`booking_id`) REFERENCES `booking` (`booking_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `FK_student_student_id` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `FK_tutor_tutor_id_5` FOREIGN KEY (`tutor_id`) REFERENCES `tutor` (`tutor_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `tutor`
--
ALTER TABLE `tutor`
  ADD CONSTRAINT `FK_dbs_status_dbs_status_id` FOREIGN KEY (`tutor_dbs`) REFERENCES `dbs_status` (`dbs_status_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `FK_gender_gender_id` FOREIGN KEY (`tutor_gender`) REFERENCES `gender` (`gender_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `FK_qualifcation_status_qualification_status_id` FOREIGN KEY (`tutor_qualified`) REFERENCES `qualification_status` (`qualification_status_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `FK_sen_status_sen_status_id` FOREIGN KEY (`tutor_sen`) REFERENCES `sen_status` (`sen_status_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `tutor_availability_override`
--
ALTER TABLE `tutor_availability_override`
  ADD CONSTRAINT `FK_tutor_tutor_id_8` FOREIGN KEY (`tutor_id`) REFERENCES `tutor` (`tutor_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `tutor_feedback`
--
ALTER TABLE `tutor_feedback`
  ADD CONSTRAINT `FK_booking_booking_id_2` FOREIGN KEY (`booking_id`) REFERENCES `booking` (`booking_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `FK_student_student_id_3` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `FK_tutor_tutor_id_9` FOREIGN KEY (`tutor_id`) REFERENCES `tutor` (`tutor_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `tutor_instrument`
--
ALTER TABLE `tutor_instrument`
  ADD CONSTRAINT `FK_instrument_instrument_id` FOREIGN KEY (`instrument_id`) REFERENCES `instrument` (`instrument_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `FK_tutor_tutor_id` FOREIGN KEY (`tutor_id`) REFERENCES `tutor` (`tutor_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `tutor_level`
--
ALTER TABLE `tutor_level`
  ADD CONSTRAINT `FK_level_level_id` FOREIGN KEY (`level_id`) REFERENCES `level` (`level_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `FK_tutor_tutor_id_2` FOREIGN KEY (`tutor_id`) REFERENCES `tutor` (`tutor_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
