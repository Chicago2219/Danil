<?php
require_once '../db_connect.php';

$stmt = $pdo->query("SELECT * FROM manufacturers");
$manufacturers = $stmt->fetchAll(PDO::FETCH_ASSOC);

header('Content-Type: application/json');
echo json_encode($manufacturers);
?>