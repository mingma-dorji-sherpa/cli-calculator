<?php
session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Adjust this for production
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

function sendError($message, $httpCode = 400) {
    http_response_code($httpCode);
    echo json_encode(['success' => false, 'message' => $message]);
    exit;
}

function logError($message) {
    file_put_contents('upload_errors.log', date('Y-m-d H:i:s') . " - $message\n", FILE_APPEND);
}

if (!isset($_SESSION['user_id'])) {
    sendError('Not logged in', 401);
}

try {
    $uploadDir = 'uploads/';
    $userId = $_SESSION['user_id'];
    $userName = $_SESSION['user_name'];
    $fileName = $userId . '_profile.jpg';
    $uploadPath = $uploadDir . $fileName;

    if (!file_exists($uploadDir)) {
        if (!mkdir($uploadDir, 0777, true)) {
            logError("Failed to create directory: $uploadDir");
            sendError('Failed to create upload directory', 500);
        }
    }

    if (!is_writable($uploadDir)) {
        logError("Directory not writable: $uploadDir");
        sendError('Upload directory is not writable', 500);
    }

    $db = new PDO("mysql:host=localhost;dbname=colabproject", "username", "password");
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if (isset($_FILES['user_image'])) {
        $file = $_FILES['user_image'];
        
        if ($file['size'] > 5 * 1024 * 1024) {
            sendError('File too large. Maximum size is 5MB');
        }

        if ($file['error'] !== UPLOAD_ERR_OK) {
            logError("Upload error code: " . $file['error']);
            sendError('File upload error: ' . $file['error']);
        }

        $imageInfo = getimagesize($file['tmp_name']);
        if (!$imageInfo) {
            sendError('Invalid image file');
        }

        if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
            $imageUrl = 'http://127.0.0.1/Finalc/colab_final/' . $uploadPath;
            $stmt = $db->prepare("UPDATE users SET user_image = ? WHERE id = ?");
            $stmt->execute([$imageUrl, $userId]);
            echo json_encode(['success' => true, 'image_url' => $imageUrl]);
        } else {
            logError("Failed to move file from {$file['tmp_name']} to $uploadPath");
            sendError('Failed to move uploaded file');
        }
    } elseif (isset($_POST['delete_image'])) {
        $stmt = $db->prepare("UPDATE users SET user_image = NULL WHERE id = ?");
        $stmt->execute([$userId]);
        
        if (file_exists($uploadPath)) {
            if (!unlink($uploadPath)) {
                logError("Failed to delete file: $uploadPath");
                sendError('Failed to delete image file');
            }
        }
        echo json_encode(['success' => true]);
    } else {
        sendError('No image provided or action specified');
    }
} catch (Exception $e) {
    logError("Exception: " . $e->getMessage());
    sendError('Server error: ' . $e->getMessage(), 500);
}