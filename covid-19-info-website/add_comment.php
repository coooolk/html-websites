<?php
session_start();

$servername = "localhost";
$username = "your_username";
$password = "your_password";
$dbname = "covid19_db";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if (!isset($_SESSION['user_id'])) {
    die("User not logged in");
}

$user_id = $_SESSION['user_id'];
$comment = $_POST['comment'];

$sql = "INSERT INTO comments (user_id, comment_text) VALUES (?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("is", $user_id, $comment);

if ($stmt->execute()) {
    echo "Comment added successfully";
} else {
    echo "Error: " . $stmt->error;
}

$stmt->close();
$conn->close();
?>