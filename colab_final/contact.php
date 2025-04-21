<?php
header("Access-Control-Allow-Origin: http://127.0.0.1:5500");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
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
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database connection failed: " . $e->getMessage()]);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING) ?? '';
    $email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL) ?? '';
    $countryCode = filter_input(INPUT_POST, 'countryCode', FILTER_SANITIZE_STRING) ?? '';
    $phone = filter_input(INPUT_POST, 'phone', FILTER_SANITIZE_STRING) ?? '';
    $message = filter_input(INPUT_POST, 'message', FILTER_SANITIZE_STRING) ?? '';

    if (empty($name) || empty($email) || empty($phone) || empty($message)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "All required fields (name, email, phone, message) must be filled."]);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid email format."]);
        exit;
    }

    try {
        $stmt = $conn->prepare("INSERT INTO contact (name, email, countrycode, phone, message) VALUES (:name, :email, :countryCode, :phone, :message)");
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':countryCode', $countryCode);
        $stmt->bindParam(':phone', $phone);
        $stmt->bindParam(':message', $message);

        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(["success" => true, "message" => "Message sent successfully."]);
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Failed to insert data into database."]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
    }
} elseif ($_SERVER["REQUEST_METHOD"] === "GET") {
    try {
        $stmt = $conn->prepare("SELECT id, name, email, countrycode, phone, message, created_at FROM contact ORDER BY created_at DESC");
        $stmt->execute();
        $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

        http_response_code(200);
        echo json_encode(["success" => true, "messages" => $messages]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed."]);
}
?>