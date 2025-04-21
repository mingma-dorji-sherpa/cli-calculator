<?php
header("Access-Control-Allow-Origin: http://127.0.0.1:5500");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit;
}

session_start();

// Database connection
$host = "localhost";
$username = "root";
$password = "";
$database = "colabproject";

try {
    $conn = new PDO("mysql:host=$host;dbname=$database", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Connection failed: ' . $e->getMessage()]);
    exit;
}

if (isset($_SESSION['user_id']) && isset($_SESSION['username'])) {
    try {
        $stmt = $conn->prepare("SELECT username, email, user_image FROM users WHERE id = :user_id");
        $stmt->bindParam(':user_id', $_SESSION['user_id']);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            echo json_encode([
                'loggedIn' => true,
                'user' => [
                    'username' => $user['username'],
                    'email' => $user['email'],
                    'user_image' => $user['user_image'] ?? null
                ]
            ]);
        } else {
            echo json_encode(['loggedIn' => false, 'message' => 'User not found']);
        }
    } catch(PDOException $e) {
        echo json_encode(['loggedIn' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['loggedIn' => false, 'message' => 'No active session']);
}
?>