<?php
// Start output buffering to prevent any stray output
ob_start();

// Ensure no errors are displayed to the user
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_errors.log');
error_reporting(E_ALL);

// Start session at the top to avoid header issues
session_start();

// Set CORS headers
header("Access-Control-Allow-Origin: http://127.0.0.1:5500");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

// Handle OPTIONS preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_end_clean();
    http_response_code(200);
    exit;
}

$host = "localhost";
$username = "root";
$password = "";
$database = "colabproject";

try {
    $conn = new PDO("mysql:host=$host;dbname=$database", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch(PDOException $e) {
    error_log('Database connection error: ' . $e->getMessage());
    ob_end_clean();
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
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log('JSON decode error: ' . json_last_error_msg());
            ob_end_clean();
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid JSON input: ' . json_last_error_msg()]);
            exit;
        }
        $mode = $data['mode'] ?? '';
        $username = trim($data['username'] ?? '');
        $email = trim($data['email'] ?? '');
        $user_image = $data['user_image'] ?? null;
        $provider = trim($data['provider'] ?? 'google');
        $password = $data['password'] ?? '';
    } else {
        $mode = $_POST['mode'] ?? '';
        $username = trim($_POST['Username'] ?? '');
        $password = trim($_POST['Password'] ?? '');
        $email = trim($_POST['Email'] ?? '');
        $provider = 'database';
        $user_image = $_POST['user_image'] ?? null;
    }

    if ($mode === "login") {
        $stmt = $conn->prepare("SELECT * FROM users WHERE username = :username AND password = :password");
        $stmt->bindParam(':username', $username);
        $stmt->bindParam(':password', $password);
        $stmt->execute();

        $user = $stmt->fetch();

        if ($user) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            ob_end_clean();
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
            ob_end_clean();
            echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
        }
    } elseif ($mode === "register") {
        $stmt = $conn->prepare("SELECT COUNT(*) FROM users WHERE email = :email");
        $stmt->bindParam(':email', $email);
        $stmt->execute();

        if ($stmt->fetchColumn() > 0) {
            ob_end_clean();
            echo json_encode(['success' => false, 'message' => 'Email already exists']);
            exit;
        }

        $stmt = $conn->prepare("SELECT COUNT(*) FROM users WHERE username = :username");
        $stmt->bindParam(':username', $username);
        $stmt->execute();

        if ($stmt->fetchColumn() > 0) {
            ob_end_clean();
            echo json_encode(['success' => false, 'message' => 'Username already exists']);
            exit;
        }

        $relativePath = $user_image;
        if (!empty($user_image) && filter_var($user_image, FILTER_VALIDATE_URL)) {
            $imageContent = @file_get_contents($user_image);
            if ($imageContent !== false) {
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

                if ($type) {
                    $fileName = $username . '_' . uniqid() . '.' . $type;
                    $filePath = $uploadDir . $fileName;
                    if (file_put_contents($filePath, $imageContent) !== false) {
                        $relativePath = '/Uploads/' . $fileName;
                    }
                }
            }
        }

        $stmt = $conn->prepare("INSERT INTO users (username, email, password, provider, user_image) VALUES (:username, :email, :password, :provider, :user_image)");
        $stmt->bindParam(':username', $username);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':password', $password);
        $stmt->bindParam(':provider', $provider);
        $stmt->bindParam(':user_image', $relativePath);

        if ($stmt->execute()) {
            $stmt = $conn->prepare("SELECT * FROM users WHERE username = :username");
            $stmt->bindParam(':username', $username);
            $stmt->execute();
            $user = $stmt->fetch();

            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];

            ob_end_clean();
            echo json_encode([
                'success' => true,
                'message' => 'Registration successful',
                'user' => [
                    'username' => $user['username'],
                    'email' => $user['email'],
                    'user_image' => $user['user_image'] ?? $user_image,
                    'provider' => $user['provider'],
                    'created_at' => $user['created_at']
                ]
            ]);
        } else {
            ob_end_clean();
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Registration failed']);
        }
    } elseif ($mode === "update_picture") {
        if (empty($username)) {
            ob_end_clean();
            echo json_encode(['success' => false, 'message' => 'Username is required']);
            exit;
        }

        $stmt = $conn->prepare("SELECT COUNT(*) FROM users WHERE username = :username");
        $stmt->bindParam(':username', $username);
        $stmt->execute();
        if ($stmt->fetchColumn() == 0) {
            ob_end_clean();
            echo json_encode(['success' => false, 'message' => 'User not found']);
            exit;
        }

        $relativePath = $user_image;
        if (!empty($user_image)) {
            if (filter_var($user_image, FILTER_VALIDATE_URL)) {
                $imageContent = @file_get_contents($user_image);
                if ($imageContent === false) {
                    ob_end_clean();
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
                    ob_end_clean();
                    echo json_encode(['success' => false, 'message' => 'Invalid image type']);
                    exit;
                }

                $fileName = $username . '_' . uniqid() . '.' . $type;
                $filePath = $uploadDir . $fileName;

                if (file_put_contents($filePath, $imageContent) === false) {
                    ob_end_clean();
                    echo json_encode(['success' => false, 'message' => 'Failed to save image']);
                    exit;
                }

                $relativePath = '/Uploads/' . $fileName;
            } else {
                if (preg_match('/^data:image\/(\w+);base64,/', $user_image, $type)) {
                    $data = substr($user_image, strpos($user_image, ',') + 1);
                    $type = strtolower($type[1]);
                    if (!in_array($type, ['jpg', 'jpeg', 'png', 'gif'])) {
                        ob_end_clean();
                        echo json_encode(['success' => false, 'message' => 'Invalid image type']);
                        exit;
                    }

                    $data = base64_decode($data);
                    if ($data === false) {
                        ob_end_clean();
                        echo json_encode(['success' => false, 'message' => 'Base64 decode failed']);
                        exit;
                    }

                    $fileName = $username . '_' . uniqid() . '.' . $type;
                    $filePath = $uploadDir . $fileName;
                    if (file_put_contents($filePath, $data) === false) {
                        ob_end_clean();
                        echo json_encode(['success' => false, 'message' => 'Failed to save image']);
                        exit;
                    }

                    $relativePath = '/Uploads/' . $fileName;
                } else {
                    ob_end_clean();
                    echo json_encode(['success' => false, 'message' => 'Invalid image data']);
                    exit;
                }
            }
        }

        $stmt = $conn->prepare("UPDATE users SET user_image = :user_image WHERE username = :username");
        $stmt->bindParam(':user_image', $relativePath);
        $stmt->bindParam(':username', $username);

        if ($stmt->execute() && $stmt->rowCount() > 0) {
            ob_end_clean();
            echo json_encode(['success' => true, 'message' => 'Picture updated successfully', 'user_image' => $relativePath]);
        } else {
            ob_end_clean();
            echo json_encode(['success' => false, 'message' => 'Failed to update picture']);
        }
    } elseif ($mode === "update_user") {
        if (empty($username) || empty($email)) {
            ob_end_clean();
            echo json_encode(['success' => false, 'message' => 'Username and email are required']);
            exit;
        }

        $stmt = $conn->prepare("SELECT user_image FROM users WHERE email = :email");
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        $existingUser = $stmt->fetch();
        if (!$existingUser) {
            ob_end_clean();
            echo json_encode(['success' => false, 'message' => 'User not found']);
            exit;
        }

        $finalImage = $user_image && filter_var($user_image, FILTER_VALIDATE_URL) ? $user_image : $existingUser['user_image'];

        $stmt = $conn->prepare("UPDATE users SET user_image = :user_image, provider = :provider WHERE email = :email");
        $stmt->bindParam(':user_image', $finalImage);
        $stmt->bindParam(':provider', $provider);
        $stmt->bindParam(':email', $email);

        if ($stmt->execute()) {
            ob_end_clean();
            echo json_encode(['success' => true, 'message' => 'User updated successfully', 'user_image' => $finalImage]);
        } else {
            ob_end_clean();
            echo json_encode(['success' => false, 'message' => 'Failed to update user']);
        }
    } elseif ($mode === "get_user") {
        if (empty($username)) {
            ob_end_clean();
            echo json_encode(['success' => false, 'message' => 'Username is required']);
            exit;
        }

        $stmt = $conn->prepare("SELECT username, email, user_image, provider, created_at FROM users WHERE username = :username");
        $stmt->bindParam(':username', $username);
        $stmt->execute();

        $user = $stmt->fetch();

        if ($user) {
            ob_end_clean();
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
            ob_end_clean();
            echo json_encode(['success' => false, 'message' => 'User not found']);
        }
    } elseif ($mode === "get_user_by_email") {
        if (empty($email)) {
            ob_end_clean();
            echo json_encode(['success' => false, 'message' => 'Email is required']);
            exit;
        }

        $stmt = $conn->prepare("SELECT username, email, user_image, provider, created_at FROM users WHERE email = :email");
        $stmt->bindParam(':email', $email);
        $stmt->execute();

        $user = $stmt->fetch();

        if ($user) {
            ob_end_clean();
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
            ob_end_clean();
            echo json_encode(['success' => false, 'message' => 'User not found']);
        }
    } elseif ($mode === "book_flight") {
        $flight_id = $data['flight_id'] ?? '';
        $passengers = $data['passengers'] ?? 1;
        $passenger_details = $data['passenger_details'] ?? [];
        $flight_type = $data['flight_type'] ?? '';
        $username = trim($data['username'] ?? '');
        $flighttype = $data['flighttype'] ?? '';

        if (empty($flight_id) || empty($passengers) || empty($flight_type) || empty($username)) {
            ob_end_clean();
            echo json_encode(['success' => false, 'message' => 'Flight ID, passengers, flight type, and username are required']);
            exit;
        }
        if (!in_array($flight_type, ['oneway', 'return'])) {
            ob_end_clean();
            echo json_encode(['success' => false, 'message' => 'Invalid flight type']);
            exit;
        }
        if (empty($passenger_details) || count($passenger_details) !== $passengers) {
            ob_end_clean();
            echo json_encode(['success' => false, 'message' => 'Passenger details mismatch']);
            exit;
        }

        $stmt = $conn->prepare("SELECT username FROM users WHERE username = :username");
        $stmt->bindParam(':username', $username);
        $stmt->execute();
        if ($stmt->fetchColumn() == 0) {
            ob_end_clean();
            echo json_encode(['success' => false, 'message' => 'User not found']);
            exit;
        }

        $table = $flight_type === 'oneway' ? 'oneflightdetails' : 'returnflightdetails';
        $stmt = $conn->prepare("SELECT amount, available_seats FROM $table WHERE id = :id");
        $stmt->bindParam(':id', $flight_id);
        $stmt->execute();
        $flight = $stmt->fetch();

        if (!$flight) {
            ob_end_clean();
            echo json_encode(['success' => false, 'message' => 'Flight not found']);
            exit;
        }
        if ($flight['available_seats'] < $passengers) {
            ob_end_clean();
            echo json_encode(['success' => false, 'message' => 'Not enough available seats']);
            exit;
        }

        $amount = floatval($flight['amount']) * $passengers;
        $passenger_details_json = json_encode($passenger_details);
        $status = 'Confirmed';
        $booking_date = date('Y-m-d H:i:s');

        $stmt = $conn->prepare("INSERT INTO bookings (user, flight_id, flight_type, seats_booked, passenger_details, amount, status, booking_date, flighttype) VALUES (:user, :flight_id, :flight_type, :seats_booked, :passenger_details, :amount, :status, :booking_date, :flighttype)");
        $stmt->bindParam(':user', $username);
        $stmt->bindParam(':flight_id', $flight_id);
        $stmt->bindParam(':flight_type', $flight_type);
        $stmt->bindParam(':seats_booked', $passengers, PDO::PARAM_INT);
        $stmt->bindParam(':passenger_details', $passenger_details_json);
        $stmt->bindParam(':amount', $amount);
        $stmt->bindParam(':status', $status);
        $stmt->bindParam(':booking_date', $booking_date);
        $stmt->bindParam(':flighttype', $flighttype);

        if ($stmt->execute()) {
            $new_seats = $flight['available_seats'] - $passengers;
            $stmt = $conn->prepare("UPDATE $table SET available_seats = :seats WHERE id = :id");
            $stmt->bindParam(':seats', $new_seats, PDO::PARAM_INT);
            $stmt->bindParam(':id', $flight_id);
            $stmt->execute();

            ob_end_clean();
            echo json_encode([
                'success' => true,
                'message' => 'Booking successful',
                'booking_id' => $conn->lastInsertId()
            ]);
        } else {
            ob_end_clean();
            echo json_encode(['success' => false, 'message' => 'Failed to book flight']);
        }
    } elseif ($mode === "get_all_users") {
        try {
            $stmt = $conn->prepare("SELECT username, email, user_image, provider, created_at FROM users ORDER BY created_at DESC");
            $stmt->execute();
            $users = $stmt->fetchAll();

            ob_end_clean();
            echo json_encode([
                'success' => true,
                'message' => 'Users retrieved successfully',
                'users' => $users
            ]);
        } catch (PDOException $e) {
            error_log('Get all users error: ' . $e->getMessage());
            ob_end_clean();
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
    } elseif ($mode === "get_total_bookings") {
        try {
            $stmt = $conn->prepare("SELECT COUNT(*) as total FROM bookings");
            $stmt->execute();
            $result = $stmt->fetch();

            ob_end_clean();
            echo json_encode([
                'success' => true,
                'message' => 'Total bookings retrieved successfully',
                'total' => (int)$result['total']
            ]);
        } catch (PDOException $e) {
            error_log('Get total bookings error: ' . $e->getMessage());
            ob_end_clean();
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
    } elseif ($mode === "get_todays_bookings") {
        try {
            $stmt = $conn->prepare("SELECT COUNT(*) as total FROM bookings WHERE DATE(booking_date) = CURDATE()");
            $stmt->execute();
            $result = $stmt->fetch();

            ob_end_clean();
            echo json_encode([
                'success' => true,
                'message' => "Today's bookings retrieved successfully",
                'total' => (int)$result['total']
            ]);
        } catch (PDOException $e) {
            error_log('Get today\'s bookings error: ' . $e->getMessage());
            ob_end_clean();
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
    } elseif ($mode === "get_pending_requests") {
        try {
            $stmt = $conn->prepare("SELECT COUNT(*) as total FROM bookings WHERE status = 'Confirmed'");
            $stmt->execute();
            $result = $stmt->fetch();

            ob_end_clean();
            echo json_encode([
                'success' => true,
                'message' => 'Confirmed requests retrieved successfully',
                'total' => (int)$result['total']
            ]);
        } catch (PDOException $e) {
            error_log('Get pending requests error: ' . $e->getMessage());
            ob_end_clean();
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
    } elseif ($mode === "get_registered_users") {
        try {
            $stmt = $conn->prepare("SELECT COUNT(*) as total FROM users");
            $stmt->execute();
            $result = $stmt->fetch();

            ob_end_clean();
            echo json_encode([
                'success' => true,
                'message' => 'Registered users retrieved successfully',
                'total' => (int)$result['total']
            ]);
        } catch (PDOException $e) {
            error_log('Get registered users error: ' . $e->getMessage());
            ob_end_clean();
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
    } elseif ($mode === "get_todays_users") {
        try {
            $stmt = $conn->prepare("SELECT COUNT(*) as total FROM users WHERE DATE(created_at) = CURDATE()");
            $stmt->execute();
            $result = $stmt->fetch();

            ob_end_clean();
            echo json_encode([
                'success' => true,
                'message' => "Today's registered users retrieved successfully",
                'total' => (int)$result['total']
            ]);
        } catch (PDOException $e) {
            error_log('Get today\'s users error: ' . $e->getMessage());
            ob_end_clean();
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
    } elseif ($mode === "get_total_revenue") {
        try {
            $stmt = $conn->prepare("SELECT SUM(amount) as total FROM bookings WHERE status != 'Cancelled'");
            $stmt->execute();
            $result = $stmt->fetch();

            $total = $result['total'] ? (float)$result['total'] : 0;
            ob_end_clean();
            echo json_encode([
                'success' => true,
                'message' => 'Total revenue retrieved successfully',
                'total' => $total
            ]);
        } catch (PDOException $e) {
            error_log('Get total revenue error: ' . $e->getMessage());
            ob_end_clean();
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
    } elseif ($mode === "get_todays_revenue") {
        try {
            $stmt = $conn->prepare("SELECT SUM(amount) as total FROM bookings WHERE DATE(booking_date) = CURDATE() AND status != 'Cancelled'");
            $stmt->execute();
            $result = $stmt->fetch();

            $total = $result['total'] ? (float)$result['total'] : 0;
            ob_end_clean();
            echo json_encode([
                'success' => true,
                'message' => "Today's revenue retrieved successfully",
                'total' => $total
            ]);
        } catch (PDOException $e) {
            error_log('Get today\'s revenue error: ' . $e->getMessage());
            ob_end_clean();
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
    } elseif ($mode === "get_recent_bookings") {
        try {
            $stmt = $conn->prepare("SELECT id, user, flight_id, flight_type, flighttype, seats_booked, passenger_details, amount, status, booking_date FROM bookings ORDER BY created_at");
            $stmt->execute();
            $bookings = $stmt->fetchAll();

            ob_end_clean();
            echo json_encode([
                'success' => true,
                'message' => 'Recent bookings retrieved successfully',
                'bookings' => $bookings
            ]);
        } catch (PDOException $e) {
            error_log('Get recent bookings error: ' . $e->getMessage());
            ob_end_clean();
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
    } elseif ($mode === "view_booking") {
        $booking_id = $data['booking_id'] ?? '';
        if (empty($booking_id)) {
            ob_end_clean();
            echo json_encode(['success' => false, 'message' => 'Booking ID is required']);
            exit;
        }

        try {
            $stmt = $conn->prepare("SELECT id, user, flight_id, flight_type, seats_booked, passenger_details, amount, status, booking_date, created_at, flighttype FROM bookings WHERE id = :id");
            $stmt->bindParam(':id', $booking_id);
            $stmt->execute();
            $booking = $stmt->fetch();

            if ($booking) {
                $booking['passenger_details'] = json_decode($booking['passenger_details'], true);
                $table = $booking['flight_type'] === 'oneway' ? 'oneflightdetails' : 'returnflightdetails';
                $stmt = $conn->prepare("SELECT * FROM $table WHERE id = :flight_id");
                $stmt->bindParam(':flight_id', $booking['flight_id']);
                $stmt->execute();
                $flight = $stmt->fetch();

                if ($flight) {
                    $booking['flight'] = $flight;
                } else {
                    $booking['flight'] = null;
                }

                ob_end_clean();
                echo json_encode([
                    'success' => true,
                    'message' => 'Booking retrieved successfully',
                    'booking' => $booking
                ]);
            } else {
                ob_end_clean();
                echo json_encode(['success' => false, 'message' => 'Booking not found']);
            }
        } catch (PDOException $e) {
            error_log('View booking error: ' . $e->getMessage());
            ob_end_clean();
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
    } elseif ($mode === "cancel_booking") {
        $booking_id = $data['booking_id'] ?? '';
        $flight_id = $data['flight_id'] ?? '';
        $flight_type = $data['flight_type'] ?? '';
        $seats_booked = $data['seats_booked'] ?? 0;

        if (empty($booking_id) || empty($flight_id) || empty($flight_type) || empty($seats_booked)) {
            ob_end_clean();
            echo json_encode(['success' => false, 'message' => 'Booking ID, flight ID, flight type, and seats booked are required']);
            exit;
        }

        try {
            $stmt = $conn->prepare("SELECT status FROM bookings WHERE id = :id");
            $stmt->bindParam(':id', $booking_id);
            $stmt->execute();
            $booking = $stmt->fetch();

            if (!$booking) {
                ob_end_clean();
                echo json_encode(['success' => false, 'message' => 'Booking not found']);
                exit;
            }

            if ($booking['status'] === 'Cancelled') {
                ob_end_clean();
                echo json_encode(['success' => false, 'message' => 'Booking is already cancelled']);
                exit;
            }

            $stmt = $conn->prepare("UPDATE bookings SET status = 'Cancelled' WHERE id = :id");
            $stmt->bindParam(':id', $booking_id);
            $stmt->execute();

            $table = $flight_type === 'oneway' ? 'oneflightdetails' : 'returnflightdetails';
            $stmt = $conn->prepare("UPDATE $table SET available_seats = available_seats + :seats WHERE id = :id");
            $stmt->bindParam(':seats', $seats_booked, PDO::PARAM_INT);
            $stmt->bindParam(':id', $flight_id);
            $stmt->execute();

            ob_end_clean();
            echo json_encode(['success' => true, 'message' => 'Booking cancelled successfully']);
        } catch (PDOException $e) {
            error_log('Cancel booking error: ' . $e->getMessage());
            ob_end_clean();
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
    } elseif ($mode === "edit_user") {
        $username = $data['username'] ?? '';
        $new_email = $data['email'] ?? '';

        if (empty($username) || empty($new_email)) {
            ob_end_clean();
            echo json_encode(['success' => false, 'message' => 'Username and email are required']);
            exit;
        }

        try {
            $stmt = $conn->prepare("SELECT COUNT(*) FROM users WHERE email = :email AND username != :username");
            $stmt->bindParam(':email', $new_email);
            $stmt->bindParam(':username', $username);
            $stmt->execute();

            if ($stmt->fetchColumn() > 0) {
                ob_end_clean();
                echo json_encode(['success' => false, 'message' => 'Email already in use by another user']);
                exit;
            }

            $stmt = $conn->prepare("UPDATE users SET email = :email WHERE username = :username");
            $stmt->bindParam(':email', $new_email);
            $stmt->bindParam(':username', $username);

            if ($stmt->execute() && $stmt->rowCount() > 0) {
                ob_end_clean();
                echo json_encode(['success' => true, 'message' => 'User updated successfully']);
            } else {
                ob_end_clean();
                echo json_encode(['success' => false, 'message' => 'User not found or no changes made']);
            }
        } catch (PDOException $e) {
            error_log('Edit user error: ' . $e->getMessage());
            ob_end_clean();
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
    } elseif ($mode === "delete_user") {
        $username = $data['username'] ?? '';
        if (empty($username)) {
            ob_end_clean();
            echo json_encode(['success' => false, 'message' => 'Username is required']);
            exit;
        }

        try {
            $stmt = $conn->prepare("DELETE FROM users WHERE username = :username");
            $stmt->bindParam(':username', $username);

            if ($stmt->execute() && $stmt->rowCount() > 0) {
                ob_end_clean();
                echo json_encode(['success' => true, 'message' => 'User deleted successfully']);
            } else {
                ob_end_clean();
                echo json_encode(['success' => false, 'message' => 'User not found']);
            }
        } catch (PDOException $e) {
            error_log('Delete user error: ' . $e->getMessage());
            ob_end_clean();
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
    } elseif ($mode === "get_oneway_flights") {
        try {
            $stmt = $conn->prepare("SELECT id, flight_from, flight_to, depart_date, depart_time, available_seats, baggage_limit, amount FROM oneflightdetails ORDER BY id ASC");
            $stmt->execute();
            $flights = $stmt->fetchAll();

            ob_end_clean();
            echo json_encode([
                'success' => true,
                'message' => 'One-way flights retrieved successfully',
                'flights' => $flights
            ]);
        } catch (PDOException $e) {
            error_log('Get oneway flights error: ' . $e->getMessage());
            ob_end_clean();
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
    } elseif ($mode === "get_return_flights") {
        try {
            $stmt = $conn->prepare("SELECT id, flight_from, flight_to, depart_date, return_date, depart_time, return_time, available_seats, baggage_weight, amount FROM returnflightdetails ORDER BY id ASC");
            $stmt->execute();
            $flights = $stmt->fetchAll();

            ob_end_clean();
            echo json_encode([
                'success' => true,
                'message' => 'Return flights retrieved successfully',
                'flights' => $flights
            ]);
        } catch (PDOException $e) {
            error_log('Get return flights error: ' . $e->getMessage());
            ob_end_clean();
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
    } elseif ($mode === "search_oneway_flights") {
        $flight_from = $data['flight_from'] ?? '';
        $flight_to = $data['flight_to'] ?? '';
        $depart_date = $data['depart_date'] ?? '';
        $passengers = $data['passengers'] ?? 1;

        if (empty($flight_from) || empty($flight_to) || empty($depart_date)) {
            ob_end_clean();
            echo json_encode(['success' => false, 'message' => 'All fields are required']);
            exit;
        }

        try {
            $stmt = $conn->prepare("SELECT id, flight_from, flight_to, depart_date, depart_time, available_seats, baggage_limit, amount FROM oneflightdetails WHERE flight_from = :flight_from AND flight_to = :flight_to AND depart_date = :depart_date ORDER BY id ASC");
            $stmt->bindParam(':flight_from', $flight_from);
            $stmt->bindParam(':flight_to', $flight_to);
            $stmt->bindParam(':depart_date', $depart_date);
            $stmt->execute();
            $flights = $stmt->fetchAll();

            $filteredFlights = [];
            foreach ($flights as $flight) {
                if ($flight['available_seats'] >= $passengers) {
                    $filteredFlights[] = $flight;
                }
            }

            ob_end_clean();
            echo json_encode([
                'success' => true,
                'message' => 'One-way flights retrieved successfully',
                'flights' => $filteredFlights
            ]);
        } catch (PDOException $e) {
            error_log('Search oneway flights error: ' . $e->getMessage());
            ob_end_clean();
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
            ob_end_clean();
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
            $flights = $stmt->fetchAll();

            $filteredFlights = [];
            foreach ($flights as $flight) {
                if ($flight['available_seats'] >= $passengers) {
                    $filteredFlights[] = $flight;
                }
            }

            ob_end_clean();
            echo json_encode([
                'success' => true,
                'message' => 'Return flights retrieved successfully',
                'flights' => $filteredFlights
            ]);
        } catch (PDOException $e) {
            error_log('Search return flights error: ' . $e->getMessage());
            ob_end_clean();
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

        // if (empty($flight_from) || empty($flight_to) || empty($depart_date) || empty($depart_time) || empty($available_seats) || empty($baggage_limit)) {
        //     ob_end_clean();
        //     echo json_encode(['success' => false, 'message' => 'All fields are required']);
        //     exit;
        // }

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
                ob_end_clean();
                echo json_encode(['success' => true, 'message' => 'One-way flight added successfully']);
            } else {
                ob_end_clean();
                echo json_encode(['success' => false, 'message' => 'Failed to add one-way flight']);
            }
        } catch (PDOException $e) {
            error_log('Add oneway flight error: ' . $e->getMessage());
            ob_end_clean();
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

        // if (empty($flight_from) || empty($flight_to) || empty($depart_date) || empty($return_date) || empty($depart_time) || empty($return_time) || empty($available_seats) || empty($baggage_weight)) {
        //     ob_end_clean();
        //     echo json_encode(['success' => false, 'message' => 'All fields are required']);
        //     exit;
        // }

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
                ob_end_clean();
                echo json_encode(['success' => true, 'message' => 'Return flight added successfully']);
            } else {
                ob_end_clean();
                echo json_encode(['success' => false, 'message' => 'Failed to add return flight']);
            }
        } catch (PDOException $e) {
            error_log('Add return flight error: ' . $e->getMessage());
            ob_end_clean();
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
    } elseif ($mode === "edit_oneway_flight") {
        $flight_id = $data['flight_id'] ?? '';
    
        if (empty($flight_id)) {
            ob_end_clean();
            echo json_encode(['success' => false, 'message' => 'Flight ID is required']);
            exit;
        }
    
        try {
            // Step 1: Get current data
            $stmt = $conn->prepare("SELECT * FROM oneflightdetails WHERE id = :id");
            $stmt->bindParam(':id', $flight_id);
            $stmt->execute();
            $existing = $stmt->fetch(PDO::FETCH_ASSOC);
    
            if (!$existing) {
                ob_end_clean();
                echo json_encode(['success' => false, 'message' => 'Flight not found']);
                exit;
            }
    
            // Step 2: Merge with new data (fallback to existing if empty)
            $flight_from = trim($data['flight_from'] ?? $existing['flight_from']);
            $flight_to = trim($data['flight_to'] ?? $existing['flight_to']);
            $depart_date = $data['depart_date'] ?? $existing['depart_date'];
            $depart_time = $data['depart_time'] ?? $existing['depart_time'];
            $available_seats = isset($data['available_seats']) ? (int)$data['available_seats'] : (int)$existing['available_seats'];
            $baggage_limit = isset($data['baggage_limit']) ? (int)$data['baggage_limit'] : (int)$existing['baggage_limit'];
            $amount = isset($data['amount']) ? (float)$data['amount'] : (float)$existing['amount'];
    
            // Optional: Validate only the fields being updated
            if (isset($data['available_seats']) && $available_seats <= 0) {
                ob_end_clean();
                echo json_encode(['success' => false, 'message' => 'Available seats must be a positive number']);
                exit;
            }
    
            if (isset($data['baggage_limit']) && $baggage_limit <= 0) {
                ob_end_clean();
                echo json_encode(['success' => false, 'message' => 'Baggage limit must be a positive number']);
                exit;
            }
    
            // Step 3: Update merged data
            $stmt = $conn->prepare("UPDATE oneflightdetails SET 
                flight_from = :flight_from, 
                flight_to = :flight_to, 
                depart_date = :depart_date, 
                depart_time = :depart_time, 
                available_seats = :available_seats, 
                baggage_limit = :baggage_limit, 
                amount = :amount 
                WHERE id = :id");
    
            $stmt->bindParam(':id', $flight_id);
            $stmt->bindParam(':flight_from', $flight_from);
            $stmt->bindParam(':flight_to', $flight_to);
            $stmt->bindParam(':depart_date', $depart_date);
            $stmt->bindParam(':depart_time', $depart_time);
            $stmt->bindParam(':available_seats', $available_seats, PDO::PARAM_INT);
            $stmt->bindParam(':baggage_limit', $baggage_limit, PDO::PARAM_INT);
            $stmt->bindParam(':amount', $amount, PDO::PARAM_STR);
    
            if ($stmt->execute() && $stmt->rowCount() > 0) {
                ob_end_clean();
                echo json_encode(['success' => true, 'message' => 'One-way flight updated successfully']);
            } else {
                ob_end_clean();
                echo json_encode(['success' => false, 'message' => 'No changes were made']);
            }
    
        } catch (PDOException $e) {
            error_log('Edit one-way flight error: ' . $e->getMessage());
            ob_end_clean();
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
    } elseif ($mode === "edit_return_flight") {
        $flight_id = $data['flight_id'] ?? '';
    
        if (empty($flight_id)) {
            ob_end_clean();
            echo json_encode(['success' => false, 'message' => 'Flight ID is required']);
            exit;
        }
    
        try {
            // Step 1: Get current data
            $stmt = $conn->prepare("SELECT * FROM returnflightdetails WHERE id = :id");
            $stmt->bindParam(':id', $flight_id);
            $stmt->execute();
            $existing = $stmt->fetch(PDO::FETCH_ASSOC);
    
            if (!$existing) {
                ob_end_clean();
                echo json_encode(['success' => false, 'message' => 'Flight not found']);
                exit;
            }
    
            // Step 2: Merge with new data (fallback to existing if not provided)
            $flight_from = trim($data['flight_from'] ?? $existing['flight_from']);
            $flight_to = trim($data['flight_to'] ?? $existing['flight_to']);
            $depart_date = $data['depart_date'] ?? $existing['depart_date'];
            $return_date = $data['return_date'] ?? $existing['return_date'];
            $depart_time = $data['depart_time'] ?? $existing['depart_time'];
            $return_time = $data['return_time'] ?? $existing['return_time'];
            $available_seats = isset($data['available_seats']) ? (int)$data['available_seats'] : (int)$existing['available_seats'];
            $baggage_weight = isset($data['baggage_weight']) ? (int)$data['baggage_weight'] : (int)$existing['baggage_weight'];
            $amount = isset($data['amount']) ? (float)$data['amount'] : (float)$existing['amount'];
    
            // Step 3: Validation (only updated fields)
            if (isset($data['available_seats']) && $available_seats <= 0) {
                ob_end_clean();
                echo json_encode(['success' => false, 'message' => 'Available seats must be a positive number']);
                exit;
            }
    
            if (isset($data['baggage_weight']) && $baggage_weight <= 0) {
                ob_end_clean();
                echo json_encode(['success' => false, 'message' => 'Baggage weight must be a positive number']);
                exit;
            }
    
            // Step 4: Perform the update
            $stmt = $conn->prepare("UPDATE returnflightdetails SET 
                flight_from = :flight_from, 
                flight_to = :flight_to, 
                depart_date = :depart_date, 
                return_date = :return_date, 
                depart_time = :depart_time, 
                return_time = :return_time, 
                available_seats = :available_seats, 
                baggage_weight = :baggage_weight, 
                amount = :amount 
                WHERE id = :id");
    
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
                ob_end_clean();
                echo json_encode(['success' => true, 'message' => 'Return flight updated successfully']);
            } else {
                ob_end_clean();
                echo json_encode(['success' => false, 'message' => 'No changes were made']);
            }
    
        } catch (PDOException $e) {
            error_log('Edit return flight error: ' . $e->getMessage());
            ob_end_clean();
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }    
    } elseif ($mode === "delete_oneway_flight") {
        $flight_id = $data['flight_id'] ?? '';
        if (empty($flight_id)) {
            ob_end_clean();
            echo json_encode(['success' => false, 'message' => 'Flight ID is required']);
            exit;
        }

        try {
            $stmt = $conn->prepare("DELETE FROM oneflightdetails WHERE id = :id");
            $stmt->bindParam(':id', $flight_id);

            if ($stmt->execute() && $stmt->rowCount() > 0) {
                ob_end_clean();
                echo json_encode(['success' => true, 'message' => 'One-way flight deleted successfully']);
            } else {
                ob_end_clean();
                echo json_encode(['success' => false, 'message' => 'Flight not found']);
            }
        } catch (PDOException $e) {
            error_log('Delete oneway flight error: ' . $e->getMessage());
            ob_end_clean();
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
    } elseif ($mode === "delete_return_flight") {
        $flight_id = $data['flight_id'] ?? '';
        if (empty($flight_id)) {
            ob_end_clean();
            echo json_encode(['success' => false, 'message' => 'Flight ID is required']);
            exit;
        }

        try {
            $stmt = $conn->prepare("DELETE FROM returnflightdetails WHERE id = :id");
            $stmt->bindParam(':id', $flight_id);

            if ($stmt->execute() && $stmt->rowCount() > 0) {
                ob_end_clean();
                echo json_encode(['success' => true, 'message' => 'Return flight deleted successfully']);
            } else {
                ob_end_clean();
                echo json_encode(['success' => false, 'message' => 'Flight not found']);
            }
        } catch (PDOException $e) {
            error_log('Delete return flight error: ' . $e->getMessage());
            ob_end_clean();
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
    } elseif ($mode === "get_locations") {
        try {
            $stmt = $conn->prepare("SELECT DISTINCT flight_from AS location FROM oneflightdetails UNION SELECT DISTINCT flight_to AS location FROM oneflightdetails UNION SELECT DISTINCT flight_from AS location FROM returnflightdetails UNION SELECT DISTINCT flight_to AS location FROM returnflightdetails");
            $stmt->execute();
            $locations = $stmt->fetchAll(PDO::FETCH_COLUMN);

            ob_end_clean();
            echo json_encode([
                'success' => true,
                'message' => 'Locations retrieved successfully',
                'locations' => $locations
            ]);
        } catch (PDOException $e) {
            error_log('Get locations error: ' . $e->getMessage());
            ob_end_clean();
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
    } elseif ($mode === "get_booking_history") {
        $username = trim($data['username'] ?? '');
        if (empty($username)) {
            ob_end_clean();
            echo json_encode(['success' => false, 'message' => 'Username is required']);
            exit;
        }

        try {
            // Verify user exists
            $stmt = $conn->prepare("SELECT COUNT(*) FROM users WHERE username = :username");
            $stmt->bindParam(':username', $username);
            $stmt->execute();
            if ($stmt->fetchColumn() == 0) {
                ob_end_clean();
                echo json_encode(['success' => false, 'message' => 'User not found']);
                exit;
            }

            // Fetch bookings
            $stmt = $conn->prepare("
                SELECT id, user, flight_id, flight_type, seats_booked, passenger_details, amount, status, booking_date, created_at, flighttype 
                FROM bookings 
                WHERE user = :username 
                ORDER BY booking_date DESC
            ");
            $stmt->bindParam(':username', $username);
            $stmt->execute();
            $bookings = $stmt->fetchAll();

            // Fetch flight details for each booking
            foreach ($bookings as &$booking) {
                // Ensure passenger_details is valid JSON
                $passenger_details = json_decode($booking['passenger_details'], true);
                if ($passenger_details === null) {
                    error_log('Invalid passenger_details JSON for booking ID ' . $booking['id'] . ': ' . json_last_error_msg());
                    $booking['passenger_details'] = [];
                } else {
                    $booking['passenger_details'] = $passenger_details;
                }

                // Determine flight table based on flight_type
                $table = $booking['flight_type'] === 'oneway' ? 'oneflightdetails' : 'returnflightdetails';
                $stmt = $conn->prepare("SELECT * FROM $table WHERE id = :flight_id");
                $stmt->bindParam(':flight_id', $booking['flight_id']);
                $stmt->execute();
                $flight = $stmt->fetch();
                $booking['flight'] = $flight ?: null;
            }

            $response = [
                'success' => true,
                'message' => 'Booking history retrieved successfully',
                'bookings' => $bookings
            ];

            // Check for JSON encoding errors
            $json = json_encode($response);
            if (json_last_error() !== JSON_ERROR_NONE) {
                error_log('JSON encoding error in get_booking_history: ' . json_last_error_msg());
                ob_end_clean();
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'JSON encoding error: ' . json_last_error_msg()]);
                exit;
            }

            ob_end_clean();
            echo $json;
        } catch (PDOException $e) {
            error_log('Get booking history error: ' . $e->getMessage());
            ob_end_clean();
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
    } else {
        ob_end_clean();
        echo json_encode(['success' => false, 'message' => 'Invalid mode']);
    }
} else {
    ob_end_clean();
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}

// Ensure output buffer is cleared
ob_end_flush();
?>