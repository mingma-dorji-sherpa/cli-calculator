<?php
header("Access-Control-Allow-Origin: http://127.0.0.1:5500");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$host = "localhost";
$username = "root";
$password = "";
$database = "colabproject";

try {
    $conn = new PDO("mysql:host=$host;dbname=$database", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Connection failed: ' . $e->getMessage()]);
    exit;
}

$uploadDir = __DIR__ . '/Uploads/';
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $contentType = $_SERVER["CONTENT_TYPE"] ?? '';
    if (strpos($contentType, 'application/json') !== false) {
        $data = json_decode(file_get_contents('php://input'), true);
        $mode = $data['mode'] ?? '';
        $username = trim($data['username'] ?? '');
        $email = trim($data['email'] ?? '');
        $user_image = $data['user_image'] ?? '';
        $provider = trim($data['provider'] ?? 'google');
    } else {
        $mode = $_POST['mode'] ?? '';
        $username = trim($_POST['Username'] ?? '');
        $password = trim($_POST['Password'] ?? '');
        $email = trim($_POST['Email'] ?? '');
        $provider = 'database';
    }

    if ($mode === "login") {
        $stmt = $conn->prepare("SELECT * FROM users WHERE username = :username AND password = :password");
        $stmt->bindParam(':username', $username);
        $stmt->bindParam(':password', $password);
        $stmt->execute();

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            session_start();
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            echo json_encode([
                'success' => true,
                'message' => 'Login successful',
                'user' => [
                    'username' => $user['username'],
                    'email' => $user['email'],
                    'user_image' => $user['user_image'] ?? null,
                    'provider' => $user['provider'] ?? 'database',
                    'created_at' => $user['created_at']
                ]
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
        }
    } elseif ($mode === "register") {
        $stmt = $conn->prepare("SELECT COUNT(*) FROM users WHERE email = :email");
        $stmt->bindParam(':email', $email);
        $stmt->execute();

        if ($stmt->fetchColumn() > 0) {
            echo json_encode(['success' => false, 'message' => 'Email already exists']);
            exit;
        }

        $stmt = $conn->prepare("SELECT COUNT(*) FROM users WHERE username = :username");
        $stmt->bindParam(':username', $username);
        $stmt->execute();

        if ($stmt->fetchColumn() > 0) {
            echo json_encode(['success' => false, 'message' => 'Username already exists']);
            exit;
        }

        $stmt = $conn->prepare("INSERT INTO users (username, email, password, provider) VALUES (:username, :email, :password, :provider)");
        $stmt->bindParam(':username', $username);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':password', $password);
        $stmt->bindParam(':provider', $provider);

        if ($stmt->execute()) {
            $stmt = $conn->prepare("SELECT * FROM users WHERE username = :username");
            $stmt->bindParam(':username', $username);
            $stmt->execute();
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            session_start();
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];

            echo json_encode([
                'success' => true,
                'message' => 'Registration successful',
                'user' => [
                    'username' => $user['username'],
                    'email' => $user['email'],
                    'user_image' => $user['user_image'] ?? null,
                    'provider' => $user['provider'],
                    'created_at' => $user['created_at']
                ]
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Registration failed']);
        }
    } elseif ($mode === "update_picture") {
        if (empty($username) || empty($user_image)) {
            echo json_encode(['success' => false, 'message' => 'Username and image are required']);
            exit;
        }

        if (filter_var($user_image, FILTER_VALIDATE_URL)) {
            $imageContent = @file_get_contents($user_image);
            if ($imageContent === false) {
                echo json_encode(['success' => false, 'message' => 'Failed to download image']);
                exit;
            }

            $finfo = new finfo(FILEINFO_MIME_TYPE);
            $mimeType = $finfo->buffer($imageContent);
            $type = false;
            if (strpos($mimeType, 'image/jpeg') !== false) {
                $type = 'jpg';
            } elseif (strpos($mimeType, 'image/png') !== false) {
                $type = 'png';
            } elseif (strpos($mimeType, 'image/gif') !== false) {
                $type = 'gif';
            }

            if (!$type) {
                echo json_encode(['success' => false, 'message' => 'Invalid image type']);
                exit;
            }

            $fileName = $username . '_' . uniqid() . '.' . $type;
            $filePath = $uploadDir . $fileName;

            if (file_put_contents($filePath, $imageContent) === false) {
                echo json_encode(['success' => false, 'message' => 'Failed to save image']);
                exit;
            }

            $relativePath = '/Uploads/' . $fileName;
        } else {
            if (preg_match('/^data:image\/(\w+);base64,/', $user_image, $type)) {
                $data = substr($user_image, strpos($user_image, ',') + 1);
                $type = strtolower($type[1]);
                if (!in_array($type, ['jpg', 'jpeg', 'png', 'gif'])) {
                    echo json_encode(['success' => false, 'message' => 'Invalid image type']);
                    exit;
                }

                $data = base64_decode($data);
                if ($data === false) {
                    echo json_encode(['success' => false, 'message' => 'Base64 decode failed']);
                    exit;
                }

                $fileName = $username . '_' . uniqid() . '.' . $type;
                $filePath = $uploadDir . $fileName;
                if (file_put_contents($filePath, $data) === false) {
                    echo json_encode(['success' => false, 'message' => 'Failed to save image']);
                    exit;
                }

                $relativePath = '/Uploads/' . $fileName;
            } else {
                echo json_encode(['success' => false, 'message' => 'Invalid image data']);
                exit;
            }
        }

        $stmt = $conn->prepare("UPDATE users SET user_image = :user_image WHERE username = :username");
        $stmt->bindParam(':user_image', $relativePath);
        $stmt->bindParam(':username', $username);

        if ($stmt->execute() && $stmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'message' => 'Picture updated successfully', 'user_image' => $relativePath]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to update picture or user not found']);
        }
    } elseif ($mode === "update_user") {
        if (empty($username)) {
            echo json_encode(['success' => false, 'message' => 'Username is required']);
            exit;
        }

        $stmt = $conn->prepare("UPDATE users SET user_image = :user_image, provider = :provider WHERE username = :username");
        $stmt->bindParam(':user_image', $user_image);
        $stmt->bindParam(':provider', $provider);
        $stmt->bindParam(':username', $username);

        if ($stmt->execute() && $stmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'message' => 'User updated successfully', 'user_image' => $user_image]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to update user or user not found']);
        }
    } elseif ($mode === "get_user") {
        if (empty($username)) {
            echo json_encode(['success' => false, 'message' => 'Username is required']);
            exit;
        }

        $stmt = $conn->prepare("SELECT username, email, user_image, provider, created_at FROM users WHERE username = :username");
        $stmt->bindParam(':username', $username);
        $stmt->execute();

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            echo json_encode([
                'success' => true,
                'message' => 'User data retrieved successfully',
                'user' => [
                    'username' => $user['username'],
                    'email' => $user['email'],
                    'user_image' => $user['user_image'] ?? null,
                    'provider' => $user['provider'] ?? 'database',
                    'created_at' => $user['created_at']
                ]
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'User not found']);
        }
    } elseif ($mode === "get_user_by_email") {
        if (empty($email)) {
            echo json_encode(['success' => false, 'message' => 'Email is required']);
            exit;
        }

        $stmt = $conn->prepare("SELECT username, email, user_image, provider, created_at FROM users WHERE email = :email");
        $stmt->bindParam(':email', $email);
        $stmt->execute();

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            echo json_encode([
                'success' => true,
                'message' => 'User data retrieved successfully',
                'user' => [
                    'username' => $user['username'],
                    'email' => $user['email'],
                    'user_image' => $user['user_image'] ?? null,
                    'provider' => $user['provider'] ?? 'database',
                    'created_at' => $user['created_at']
                ]
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'User not found']);
        }
    } elseif ($mode === "get_all_users") {
        try {
            $stmt = $conn->prepare("SELECT username, email, user_image, provider, created_at FROM users ORDER BY created_at DESC");
            $stmt->execute();
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'message' => 'Users retrieved successfully',
                'users' => $users
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
    } elseif ($mode === "get_total_bookings") {
        try {
            $stmt = $conn->prepare("SELECT COUNT(*) as total FROM bookings");
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'message' => 'Total bookings retrieved successfully',
                'total' => (int)$result['total']
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
    } elseif ($mode === "get_todays_bookings") {
        try {
            $stmt = $conn->prepare("SELECT COUNT(*) as total FROM bookings WHERE DATE(booking_date) = CURDATE()");
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'message' => "Today's bookings retrieved successfully",
                'total' => (int)$result['total']
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
    } elseif ($mode === "get_pending_requests") {
        try {
            $stmt = $conn->prepare("SELECT COUNT(*) as total FROM bookings WHERE status = 'Pending'");
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'message' => 'Pending requests retrieved successfully',
                'total' => (int)$result['total']
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
    } elseif ($mode === "get_registered_users") {
        try {
            $stmt = $conn->prepare("SELECT COUNT(*) as total FROM users");
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'message' => 'Registered users retrieved successfully',
                'total' => (int)$result['total']
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
    } elseif ($mode === "get_todays_users") {
        try {
            $stmt = $conn->prepare("SELECT COUNT(*) as total FROM users WHERE DATE(created_at) = CURDATE()");
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'message' => "Today's registered users retrieved successfully",
                'total' => (int)$result['total']
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
    } elseif ($mode === "get_total_revenue") {
        try {
            $stmt = $conn->prepare("SELECT SUM(amount) as total FROM bookings WHERE status != 'Cancelled'");
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);

            $total = $result['total'] ? (float)$result['total'] : 0;
            echo json_encode([
                'success' => true,
                'message' => 'Total revenue retrieved successfully',
                'total' => $total
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
    } elseif ($mode === "get_todays_revenue") {
        try {
            $stmt = $conn->prepare("SELECT SUM(amount) as total FROM bookings WHERE DATE(booking_date) = CURDATE() AND status != 'Cancelled'");
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);

            $total = $result['total'] ? (float)$result['total'] : 0;
            echo json_encode([
                'success' => true,
                'message' => "Today's revenue retrieved successfully",
                'total' => $total
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
    } elseif ($mode === "get_recent_bookings") {
        try {
            $stmt = $conn->prepare("SELECT id, user, airlines, amount, booking_date, status FROM bookings ORDER BY created_at DESC LIMIT 5");
            $stmt->execute();
            $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'message' => 'Recent bookings retrieved successfully',
                'bookings' => $bookings
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
    } elseif ($mode === "view_booking") {
        $booking_id = $data['booking_id'] ?? '';
        if (empty($booking_id)) {
            echo json_encode(['success' => false, 'message' => 'Booking ID is required']);
            exit;
        }

        try {
            $stmt = $conn->prepare("SELECT id, user, airlines, amount, booking_date, status, created_at FROM bookings WHERE id = :id");
            $stmt->bindParam(':id', $booking_id);
            $stmt->execute();
            $booking = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($booking) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Booking retrieved successfully',
                    'booking' => $booking
                ]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Booking not found']);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
    } elseif ($mode === "cancel_booking") {
        $booking_id = $data['booking_id'] ?? '';
        if (empty($booking_id)) {
            echo json_encode(['success' => false, 'message' => 'Booking ID is required']);
            exit;
        }

        try {
            $stmt = $conn->prepare("UPDATE bookings SET status = 'Cancelled' WHERE id = :id");
            $stmt->bindParam(':id', $booking_id);
            if ($stmt->execute() && $stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Booking cancelled successfully']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Booking not found or already cancelled']);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
    } elseif ($mode === "edit_user") {
        $username = $data['username'] ?? '';
        $new_email = $data['email'] ?? '';

        if (empty($username) || empty($new_email)) {
            echo json_encode(['success' => false, 'message' => 'Username and email are required']);
            exit;
        }

        try {
            $stmt = $conn->prepare("SELECT COUNT(*) FROM users WHERE email = :email AND username != :username");
            $stmt->bindParam(':email', $new_email);
            $stmt->bindParam(':username', $username);
            $stmt->execute();

            if ($stmt->fetchColumn() > 0) {
                echo json_encode(['success' => false, 'message' => 'Email already in use by another user']);
                exit;
            }

            $stmt = $conn->prepare("UPDATE users SET email = :email WHERE username = :username");
            $stmt->bindParam(':email', $new_email);
            $stmt->bindParam(':username', $username);

            if ($stmt->execute() && $stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'User updated successfully']);
            } else {
                echo json_encode(['success' => false, 'message' => 'User not found or no changes made']);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
    } elseif ($mode === "delete_user") {
        $username = $data['username'] ?? '';
        if (empty($username)) {
            echo json_encode(['success' => false, 'message' => 'Username is required']);
            exit;
        }

        try {
            $stmt = $conn->prepare("DELETE FROM users WHERE username = :username");
            $stmt->bindParam(':username', $username);

            if ($stmt->execute() && $stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'User deleted successfully']);
            } else {
                echo json_encode(['success' => false, 'message' => 'User not found']);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
    } elseif ($mode === "get_oneway_flights") {
        try {
            $stmt = $conn->prepare("SELECT id, flight_from, flight_to, depart_date, depart_time, available_seats, baggage_limit, amount FROM oneflightdetails ORDER BY id ASC");
            $stmt->execute();
            $flights = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'message' => 'One-way flights retrieved successfully',
                'flights' => $flights
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
    } elseif ($mode === "get_return_flights") {
        try {
            $stmt = $conn->prepare("SELECT id, flight_from, flight_to, depart_date, return_date, depart_time, return_time, available_seats, baggage_weight, amount FROM returnflightdetails ORDER BY id ASC");
            $stmt->execute();
            $flights = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'message' => 'Return flights retrieved successfully',
                'flights' => $flights
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
    } elseif ($mode === "search_oneway_flights") {
        $flight_from = $data['flight_from'] ?? '';
        $flight_to = $data['flight_to'] ?? '';
        $depart_date = $data['depart_date'] ?? '';
        $passengers = $data['passengers'] ?? 1;

        if (empty($flight_from) || empty($flight_to) || empty($depart_date)) {
            echo json_encode(['success' => false, 'message' => 'All fields are required']);
            exit;
        }

        try {
            $stmt = $conn->prepare("SELECT id, flight_from, flight_to, depart_date, depart_time, available_seats, baggage_limit, amount FROM oneflightdetails WHERE flight_from = :flight_from AND flight_to = :flight_to AND depart_date = :depart_date ORDER BY id ASC");
            $stmt->bindParam(':flight_from', $flight_from);
            $stmt->bindParam(':flight_to', $flight_to);
            $stmt->bindParam(':depart_date', $depart_date);
            $stmt->execute();
            $flights = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Check available seats against passengers
            $filteredFlights = [];
            foreach ($flights as $flight) {
                if ($flight['available_seats'] >= $passengers) {
                    $filteredFlights[] = $flight;
                }
            }

            echo json_encode([
                'success' => true,
                'message' => 'One-way flights retrieved successfully',
                'flights' => $filteredFlights
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
    } elseif ($mode === "search_return_flights") {
        $flight_from = $data['flight_from'] ?? '';
        $flight_to = $data['flight_to'] ?? '';
        $depart_date = $data['depart_date'] ?? '';
        $return_date = $data['return_date'] ?? '';
        $passengers = $data['passengers'] ?? 1;

        if (empty($flight_from) || empty($flight_to) || empty($depart_date) || empty($return_date)) {
            echo json_encode(['success' => false, 'message' => 'All fields are required']);
            exit;
        }

        try {
            $stmt = $conn->prepare("SELECT id, flight_from, flight_to, depart_date, return_date, depart_time, return_time, available_seats, baggage_weight, amount FROM returnflightdetails WHERE flight_from = :flight_from AND flight_to = :flight_to AND depart_date = :depart_date AND return_date = :return_date ORDER BY id ASC");
            $stmt->bindParam(':flight_from', $flight_from);
            $stmt->bindParam(':flight_to', $flight_to);
            $stmt->bindParam(':depart_date', $depart_date);
            $stmt->bindParam(':return_date', $return_date);
            $stmt->execute();
            $flights = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Check available seats against passengers
            $filteredFlights = [];
            foreach ($flights as $flight) {
                if ($flight['available_seats'] >= $passengers) {
                    $filteredFlights[] = $flight;
                }
            }

            echo json_encode([
                'success' => true,
                'message' => 'Return flights retrieved successfully',
                'flights' => $filteredFlights
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
    } elseif ($mode === "add_oneway_flight") {
        $flight_from = $data['flight_from'] ?? '';
        $flight_to = $data['flight_to'] ?? '';
        $depart_date = $data['depart_date'] ?? '';
        $depart_time = $data['depart_time'] ?? '';
        $available_seats = $data['available_seats'] ?? '';
        $baggage_limit = $data['baggage_limit'] ?? '';
        $amount = $data['amount'] ?? 0.00;

        if (empty($flight_from) || empty($flight_to) || empty($depart_date) || empty($depart_time) || empty($available_seats) || empty($baggage_limit)) {
            echo json_encode(['success' => false, 'message' => 'All fields are required']);
            exit;
        }

        try {
            $stmt = $conn->prepare("INSERT INTO oneflightdetails (flight_from, flight_to, depart_date, depart_time, available_seats, baggage_limit, amount) VALUES (:flight_from, :flight_to, :depart_date, :depart_time, :available_seats, :baggage_limit, :amount)");
            $stmt->bindParam(':flight_from', $flight_from);
            $stmt->bindParam(':flight_to', $flight_to);
            $stmt->bindParam(':depart_date', $depart_date);
            $stmt->bindParam(':depart_time', $depart_time);
            $stmt->bindParam(':available_seats', $available_seats, PDO::PARAM_INT);
            $stmt->bindParam(':baggage_limit', $baggage_limit, PDO::PARAM_INT);
            $stmt->bindParam(':amount', $amount, PDO::PARAM_STR);

            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'One-way flight added successfully']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to add one-way flight']);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
    } elseif ($mode === "add_return_flight") {
        $flight_from = $data['flight_from'] ?? '';
        $flight_to = $data['flight_to'] ?? '';
        $depart_date = $data['depart_date'] ?? '';
        $return_date = $data['return_date'] ?? '';
        $depart_time = $data['depart_time'] ?? '';
        $return_time = $data['return_time'] ?? '';
        $available_seats = $data['available_seats'] ?? '';
        $baggage_weight = $data['baggage_weight'] ?? '';
        $amount = $data['amount'] ?? 0.00;

        if (empty($flight_from) || empty($flight_to) || empty($depart_date) || empty($return_date) || empty($depart_time) || empty($return_time) || empty($available_seats) || empty($baggage_weight)) {
            echo json_encode(['success' => false, 'message' => 'All fields are required']);
            exit;
        }

        try {
            $stmt = $conn->prepare("INSERT INTO returnflightdetails (flight_from, flight_to, depart_date, return_date, depart_time, return_time, available_seats, baggage_weight, amount) VALUES (:flight_from, :flight_to, :depart_date, :return_date, :depart_time, :return_time, :available_seats, :baggage_weight, :amount)");
            $stmt->bindParam(':flight_from', $flight_from);
            $stmt->bindParam(':flight_to', $flight_to);
            $stmt->bindParam(':depart_date', $depart_date);
            $stmt->bindParam(':return_date', $return_date);
            $stmt->bindParam(':depart_time', $depart_time);
            $stmt->bindParam(':return_time', $return_time);
            $stmt->bindParam(':available_seats', $available_seats, PDO::PARAM_INT);
            $stmt->bindParam(':baggage_weight', $baggage_weight, PDO::PARAM_INT);
            $stmt->bindParam(':amount', $amount, PDO::PARAM_STR);

            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'Return flight added successfully']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to add return flight']);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
    } elseif ($mode === "edit_oneway_flight") {
        $flight_id = $data['flight_id'] ?? '';
        $flight_from = $data['flight_from'] ?? '';
        $flight_to = $data['flight_to'] ?? '';
        $depart_date = $data['depart_date'] ?? '';
        $depart_time = $data['depart_time'] ?? '';
        $available_seats = $data['available_seats'] ?? '';
        $baggage_limit = $data['baggage_limit'] ?? '';
        $amount = $data['amount'] ?? 0.00;

        if (empty($flight_id) || empty($flight_from) || empty($flight_to) || empty($depart_date) || empty($depart_time) || empty($available_seats) || empty($baggage_limit)) {
            echo json_encode(['success' => false, 'message' => 'All fields are required']);
            exit;
        }

        try {
            $stmt = $conn->prepare("UPDATE oneflightdetails SET flight_from = :flight_from, flight_to = :flight_to, depart_date = :depart_date, depart_time = :depart_time, available_seats = :available_seats, baggage_limit = :baggage_limit, amount = :amount WHERE id = :id");
            $stmt->bindParam(':id', $flight_id);
            $stmt->bindParam(':flight_from', $flight_from);
            $stmt->bindParam(':flight_to', $flight_to);
            $stmt->bindParam(':depart_date', $depart_date);
            $stmt->bindParam(':depart_time', $depart_time);
            $stmt->bindParam(':available_seats', $available_seats, PDO::PARAM_INT);
            $stmt->bindParam(':baggage_limit', $baggage_limit, PDO::PARAM_INT);
            $stmt->bindParam(':amount', $amount, PDO::PARAM_STR);

            if ($stmt->execute() && $stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'One-way flight updated successfully']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Flight not found or no changes made']);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
    } elseif ($mode === "edit_return_flight") {
        $flight_id = $data['flight_id'] ?? '';
        $flight_from = $data['flight_from'] ?? '';
        $flight_to = $data['flight_to'] ?? '';
        $depart_date = $data['depart_date'] ?? '';
        $return_date = $data['return_date'] ?? '';
        $depart_time = $data['depart_time'] ?? '';
        $return_time = $data['return_time'] ?? '';
        $available_seats = $data['available_seats'] ?? '';
        $baggage_weight = $data['baggage_weight'] ?? '';
        $amount = $data['amount'] ?? 0.00;

        if (empty($flight_id) || empty($flight_from) || empty($flight_to) || empty($depart_date) || empty($return_date) || empty($depart_time) || empty($return_time) || empty($available_seats) || empty($baggage_weight)) {
            echo json_encode(['success' => false, 'message' => 'All fields are required']);
            exit;
        }

        try {
            $stmt = $conn->prepare("UPDATE returnflightdetails SET flight_from = :flight_from, flight_to = :flight_to, depart_date = :depart_date, return_date = :return_date, depart_time = :depart_time, return_time = :return_time, available_seats = :available_seats, baggage_weight = :baggage_weight, amount = :amount WHERE id = :id");
            $stmt->bindParam(':id', $flight_id);
            $stmt->bindParam(':flight_from', $flight_from);
            $stmt->bindParam(':flight_to', $flight_to);
            $stmt->bindParam(':depart_date', $depart_date);
            $stmt->bindParam(':return_date', $return_date);
            $stmt->bindParam(':depart_time', $depart_time);
            $stmt->bindParam(':return_time', $return_time);
            $stmt->bindParam(':available_seats', $available_seats, PDO::PARAM_INT);
            $stmt->bindParam(':baggage_weight', $baggage_weight, PDO::PARAM_INT);
            $stmt->bindParam(':amount', $amount, PDO::PARAM_STR);

            if ($stmt->execute() && $stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Return flight updated successfully']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Flight not found or no changes made']);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
    } elseif ($mode === "delete_oneway_flight") {
        $flight_id = $data['flight_id'] ?? '';
        if (empty($flight_id)) {
            echo json_encode(['success' => false, 'message' => 'Flight ID is required']);
            exit;
        }

        try {
            $stmt = $conn->prepare("DELETE FROM oneflightdetails WHERE id = :id");
            $stmt->bindParam(':id', $flight_id);

            if ($stmt->execute() && $stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'One-way flight deleted successfully']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Flight not found']);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
    } elseif ($mode === "delete_return_flight") {
        $flight_id = $data['flight_id'] ?? '';
        if (empty($flight_id)) {
            echo json_encode(['success' => false, 'message' => 'Flight ID is required']);
            exit;
        }

        try {
            $stmt = $conn->prepare("DELETE FROM returnflightdetails WHERE id = :id");
            $stmt->bindParam(':id', $flight_id);

            if ($stmt->execute() && $stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Return flight deleted successfully']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Flight not found']);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid mode']);
    }
}
?>