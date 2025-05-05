<?php
require_once __DIR__.'/../db_connect.php';

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

if (!isset($_GET['id']) || empty($_GET['id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Product ID is required']);
    exit;
}

$productId = (int)$_GET['id'];

try {
    // Основная информация
    $stmt = $pdo->prepare("
        SELECT 
            p.*,
            m.name AS manufacturer_name,
            c.name AS category_name
        FROM products p
        JOIN manufacturers m ON p.manufacturer_id = m.manufacturer_id
        JOIN categories c ON p.category_id = c.category_id
        WHERE p.product_id = :id
    ");
    $stmt->bindParam(':id', $productId, PDO::PARAM_INT);
    $stmt->execute();
    $product = $stmt->fetch();
    
    if (!$product) {
        http_response_code(404);
        echo json_encode(['error' => 'Product not found']);
        exit;
    }
    
    // Дополнительные изображения
    $stmt = $pdo->prepare("SELECT * FROM product_images WHERE product_id = :id");
    $stmt->bindParam(':id', $productId, PDO::PARAM_INT);
    $stmt->execute();
    $product['images'] = $stmt->fetchAll();
    
    // Характеристики
    $stmt = $pdo->prepare("SELECT * FROM product_specs WHERE product_id = :id");
    $stmt->bindParam(':id', $productId, PDO::PARAM_INT);
    $stmt->execute();
    $product['specs'] = $stmt->fetchAll();
    
    echo json_encode($product);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}