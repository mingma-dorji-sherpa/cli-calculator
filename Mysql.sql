-- Create the database
CREATE DATABASE colabproject;

-- Select the database
USE colabproject;

-- Create the users table with auto-incrementing id and default current timestamp
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255),
    user_image VARCHAR(255),
    provider VARCHAR(50) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert the records with created_at set to NOW()
INSERT INTO users (username, email, password, user_image, provider) VALUES
('sums', 'sumedha@gmail.com', 'okiee', '/uploads/sums_67ecfc2e68fd5.jpeg', 'database'),
('Sushh', 'mmsush72@gmail.com', 'google_mmsush72@gmail.com', 'https://lh3.googleusercontent.com/a/ACg8ocLoMmy3lT...', 'google'),
('Sushanta', 'np03cs4a230417@heraldcollege.edu.np', 'google_np03cs4a230417@heraldcollege.edu.np', 'https://lh3.googleusercontent.com/a/ACg8ocJTdRaUxO...', 'google'),
('Sush', 'sushant@gmail.com', 'okayy', '/Uploads/Sush_682157222fc1c.jpeg', 'database'),
('Sushant', 'susaaant@gmail.com', 'google_susaaant@gmail.com', 'https://lh3.googleusercontent.com/a/ACg8ocLardfCKi...', 'google'),
('Sushi', 'susaant@gmail.com', 'okay', NULL, 'database'),
('Suvina', 'anivus1234@gmail.com', '@Suvina12', NULL, 'database'),


-- Create the contact table with auto-incrementing id and default current timestamp
CREATE TABLE contact (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    countrycode VARCHAR(10),
    phone VARCHAR(20),
    message TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Example insert statements
INSERT INTO contact (name, email, countrycode, phone, message) VALUES
('John Doe', 'john.doe@example.com', '+1', '1234567890', 'Interested in your services.'),
('Jane Smith', 'jane.smith@example.com', '+44', '9876543210', 'Please contact me for a demo.'),
('Alice Brown', 'alice.brown@example.com', '+91', '5556667778', 'General inquiry about pricing.');


-- Create the oneflightdetails table
CREATE TABLE oneflightdetails (
    id INT(11) NOT NULL AUTO_INCREMENT,
    flight_from VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
    flight_to VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
    depart_date DATE NOT NULL,
    depart_time TIME NOT NULL,
    available_seats INT(11) NOT NULL,
    baggage_limit INT(11) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_seats INT(11) DEFAULT 200,
    booked_seats LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT '[]',
    reserved_seats LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT '[]',
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert the provided records
INSERT INTO oneflightdetails (id, flight_from, flight_to, depart_date, depart_time, available_seats, baggage_limit, created_at, amount, total_seats, booked_seats, reserved_seats) VALUES
(3, 'Sydney', 'Dubai', '2025-05-14', '19:15:00', 136, 30, '2025-04-16 19:45:55', 600.00, 150, '["149","60","103","135","138","26","27","7","2","3"]', '["44"]'),
(4, 'Ktm', 'Pkr', '2025-04-20', '13:50:00', 30, 15, '2025-04-16 22:47:08', 350.00, 30, '[]', '[]'),
(5, 'London', 'New York', '2025-05-15', '08:30:00', 185, 25, '2025-04-17 10:15:22', 750.00, 200, '["1","2","4","9","15","99","120","92","75"]', '["18","19","12","7","8"]'),
(6, 'Tokyo', 'Singapore', '2025-04-23', '14:45:00', 100, 20, '2025-04-17 12:30:45', 500.00, 100, '[]', '[]'),
(7, 'Delhi', 'Mumbai', '2025-04-21', '06:20:00', 50, 15, '2025-04-18 08:50:12', 200.00, 50, '[]', '[]'),
(8, 'Dubai', 'Sydney', '2025-05-22', '19:30:00', 30, 25, '2025-05-09 02:24:35', 800.00, 200, '[]', '[]'),
(9, 'Pkr', 'Ktm', '2025-05-21', '18:30:00', 50, 30, '2025-05-09 02:25:30', 500.00, 200, '[]', '[]'),
(10, 'New York', 'London', '2025-05-27', '04:45:00', 60, 25, '2025-05-09 02:26:15', 720.00, 200, '[]', '[]');


-- Create the returnflightdetails table
CREATE TABLE returnflightdetails (
    id INT(11) NOT NULL AUTO_INCREMENT,
    flight_from VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
    flight_to VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
    depart_date DATE NOT NULL,
    return_date DATE NOT NULL,
    depart_time TIME NOT NULL,
    return_time TIME NOT NULL,
    available_seats INT(11) NOT NULL,
    baggage_weight INT(11) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_seats INT(11) DEFAULT 200,
    booked_seats LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT '[]',
    reserved_seats LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT '[]',
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert the provided records
INSERT INTO returnflightdetails (id, flight_from, flight_to, depart_date, return_date, depart_time, return_time, available_seats, baggage_weight, created_at, amount, total_seats, booked_seats, reserved_seats) VALUES
(1, 'London', 'New York', '2025-04-16', '2025-04-20', '09:00:00', '12:00:00', 110, 23, '2025-04-16 19:45:55', 500.00, 110, '[]', '[]'),
(2, 'Tokyo', 'Paris', '2025-04-25', '2025-04-30', '11:45:00', '15:30:00', 75, 20, '2025-04-16 19:45:55', 700.00, 75, '[]', '[]'),
(3, 'Dubai', 'Sydney', '2025-04-16', '2025-04-21', '20:00:00', '23:45:00', 140, 30, '2025-04-16 19:45:55', 600.00, 140, '[]', '[]'),
(4, 'Singapore', 'Bangkok', '2025-05-01', '2025-05-06', '10:15:00', '13:30:00', 95, 15, '2025-04-20 09:10:12', 320.00, 95, '[]', '[]'),
(5, 'Los Angeles', 'Tokyo', '2025-05-02', '2025-05-08', '14:00:00', '18:20:00', 130, 25, '2025-04-20 11:25:30', 850.00, 130, '[]', '[]'),
(6, 'Mumbai', 'London', '2025-05-03', '2025-05-10', '06:30:00', '10:45:00', 85, 23, '2025-04-20 14:50:45', 650.00, 85, '[]', '[]'),
(7, 'Rome', 'Barcelona', '2025-05-04', '2025-05-07', '12:45:00', '15:15:00', 60, 20, '2025-04-20 16:20:18', 380.00, 60, '[]', '[]'),
(8, 'New York', 'Toronto', '2025-05-05', '2025-05-09', '08:00:00', '11:00:00', 100, 23, '2025-04-20 18:35:22', 400.00, 100, '[]', '[]'),
(9, 'Sydney', 'Melbourne', '2025-05-06', '2025-05-11', '17:20:00', '19:50:00', 70, 15, '2025-04-20 20:10:50', 250.00, 70, '[]', '[]'),
(10, 'Cape Town', 'Dubai', '2025-05-07', '2025-05-14', '21:00:00', '01:30:00', 120, 30, '2025-04-20 22:45:15', 720.00, 120, '[]', '[]');


-- Create the reviews table
CREATE TABLE reviews (
    id INT PRIMARY KEY,
    username VARCHAR(100),
    review_text TEXT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    created_at DATETIME
);


--insert into table
INSERT INTO reviews (id, username, review_text, rating, created_at) VALUES
(1, 'Emma Johnson', 'Amazing stay! The rooms were spotless, and the service was excellent.', 5, '2025-05-01 10:00:00'),
(2, 'Sush', 'Great hotel with excellent facilities. The pool was very clean.', 4, '2025-05-02 12:30:00'),
(3, 'Sarah Lee', 'Loved the breakfast options! Would definitely come again.', 5, '2025-05-03 09:15:00'),
(5, 'Sushi', 'that''s good.', 5, '2025-05-09 01:02:04'),
(6, 'SUlav', 'Todsy is presentation', 4, '2025-05-09 08:02:26'),
(7, 'tom', 'gooddddd', 5, '2025-05-13 20:48:55');


-- Create the hotel_bookings table
CREATE TABLE hotel_bookings (
    id INT(11) NOT NULL AUTO_INCREMENT,
    hotel VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
    checkin DATE NOT NULL,
    checkout DATE NOT NULL,
    rooms INT(11) NOT NULL,
    guests INT(11) NOT NULL,
    room_rate DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    full_name VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
    email VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
    phone VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
    booking_date DATE NOT NULL,
    status VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'pending',
    created_at DATETIME NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_checkin (checkin),
    INDEX idx_checkout (checkout),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- Create the bookings table
CREATE TABLE bookings (
    id INT(11) NOT NULL AUTO_INCREMENT,
    user VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
    flight_id INT(11) NOT NULL,
    flight_type VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
    seats_booked INT(11) NOT NULL,
    passenger_details LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
    booking_date DATETIME NOT NULL,
    flighttype VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
    created_at DATETIME NOT NULL,
    selected_seats LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
    PRIMARY KEY (id),
    INDEX idx_flight_id (flight_id),
    INDEX idx_user (user),
    INDEX idx_booking_date (booking_date),
    FOREIGN KEY (user) REFERENCES users(username),
    FOREIGN KEY (flight_id) REFERENCES returnflightdetails(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert the provided records
INSERT INTO bookings (id, user, flight_id, flight_type, seats_booked, passenger_details, amount, status, booking_date, flighttype, created_at, selected_seats) VALUES
(3, 'Sush', 2, 'return', 1, '[{"fullName":"Sush","passport":"98373642","contact...]', 700.00, 'Cancelled', '2025-04-18 21:29:06', 'Tokyo to Paris', '2025-04-19 01:14:06', NULL),
(6, 'Sushant', 2, 'return', 1, '[{"fullName":"Sush","passport":"983745","contact"...]', 700.00, 'Cancelled', '2025-04-19 08:19:19', 'Tokyo to Paris', '2025-04-19 12:04:19', NULL),
(8, 'Sushant', 2, 'return', 1, '[{"fullName":"Sushanta Marahatta","passport":"PA26...]', 700.00, 'Cancelled', '2025-04-19 08:31:35', 'Tokyo to Paris', '2025-04-19 12:16:35', NULL),
(9, 'Sushant', 2, 'return', 1, '[{"fullName":"Sush","passport":"BA762534","contact...]', 700.00, 'Confirmed', '2025-04-19 09:33:18', 'Tokyo to Paris', '2025-04-19 13:18:18', NULL),
(10, 'Sush', 2, 'return', 1, '[{"fullName":"Sushanta Marahatta","passport":"PA62...]', 700.00, 'Cancelled', '2025-04-20 03:25:11', 'Tokyo to Paris', '2025-04-20 07:10:11', NULL),
(11, 'Sush', 2, 'return', 1, '[{"fullName":"Sushanta Marahatta","passport":"AB19...]', 700.00, 'Cancelled', '2025-04-20 04:55:06', 'Tokyo to Paris', '2025-04-20 08:40:06', NULL),
(12, 'Sush', 2, 'return', 1, '[{"fullName":"Sushanta Marahatta","passport":"AB19...]', 700.00, 'Cancelled', '2025-04-20 04:55:14', 'Tokyo to Paris', '2025-04-20 08:40:14', NULL),
(27, 'Sush', 3, 'oneway', 1, '[{"fullName":"Sush","passport":"PA123456","contact...]', 600.00, 'Cancelled', '2025-05-08 13:37:42', 'Sydney to Dubai', '2025-05-08 17:22:42', '["149"]'),
(31, 'Sush', 3, 'oneway', 1, '[{"fullName":"Sush","passport":"PA123456","contact...]', 600.00, 'Cancelled', '2025-05-08 14:35:27', 'Sydney to Dubai', '2025-05-08 18:20:27', '["138"]'),
(34, 'Sush', 3, 'oneway', 1, '[{"fullName":"Sush","passport":"PA123456","contact...]', 600.00, 'Cancelled', '2025-05-08 15:05:03', 'Sydney to Dubai', '2025-05-08 18:50:03', '["7"]'),
(39, 'Sush', 3, 'oneway', 1, '[{"fullName":"Sush","passport":"PA123456","contact...]', 600.00, 'Cancelled', '2025-05-08 22:25:52', 'Sydney to Dubai', '2025-05-09 02:10:52', '["46"]'),
(40, 'Sush', 3, 'oneway', 1, '[{"fullName":"Sush","passport":"PA123456","contact...]', 600.00, 'Cancelled', '2025-05-08 22:50:31', 'Sydney to Dubai', '2025-05-09 02:35:31', '["89"]'),
(41, 'Sush', 3, 'oneway', 1, '[{"fullName":"Sushant","passport":"PA123456","cont...]', 600.00, 'Confirmed', '2025-05-09 04:15:24', 'Sydney to Dubai', '2025-05-09 08:00:24', '["105"]');