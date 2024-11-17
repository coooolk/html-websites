<?php
$servername = "localhost";
$username = "your_username";
$password = "your_password";
$dbname = "covid19_db";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$sql = "SELECT c.comment_text, u.username FROM comments c JOIN users u ON c.user_id = u.id ORDER BY c.created_at DESC LIMIT 10";
$result = $conn->query($sql);

$comments = array();

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $comments[] = array(
            "text" => $row["username"] . ": " . $row["comment_text"]
        );
    }
}

echo json_encode($comments);

$conn->close();
?>