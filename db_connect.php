<?php
$host = 'db'; // Имя сервиса из docker-compose.yml
$dbname = 'electronics_store';
$user = 'root'; // Используем root
$password = '123456789'; // Ваш пароль

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname", 
        $user, 
        $password,
        // Важно для корректной работы
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
} catch (PDOException $e) {
    die("❌ Ошибка подключения: " . $e->getMessage());
}
?>