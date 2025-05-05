<?php
require_once __DIR__.'/../db_connect.php';

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

try {
    // Параметры
    $page = max(1, (int)($_GET['page'] ?? 1));
    $perPage = 6;
    
    // Фильтры
    $minPrice = $_GET['min_price'] ?? null;
    $maxPrice = $_GET['max_price'] ?? null;
    $categories = isset($_GET['categories']) ? explode(',', $_GET['categories']) : [];
    $manufacturers = isset($_GET['manufacturers']) ? explode(',', $_GET['manufacturers']) : [];
    
    // Сортировка
    $sortOptions = [
        'price_asc' => 'p.price ASC',
        'price_desc' => 'p.price DESC',
        'rating_desc' => 'p.rating DESC',
        'newest' => 'p.release_date DESC'
    ];
    $sortBy = $sortOptions[$_GET['sort_by'] ?? 'price_asc'] ?? $sortOptions['price_asc'];
    
    // Построение запроса
    $where = [];
    $params = [];
    
    if ($minPrice !== null) {
        $where[] = "p.price >= :min_price";
        $params[':min_price'] = (float)$minPrice;
    }
    
    if ($maxPrice !== null) {
        $where[] = "p.price <= :max_price";
        $params[':max_price'] = (float)$maxPrice;
    }
    
    if (!empty($categories)) {
        $where[] = "p.category_id IN (" . implode(',', array_fill(0, count($categories), '?')) . ")";
        $params = array_merge($params, $categories);
    }
    
    if (!empty($manufacturers)) {
        $where[] = "p.manufacturer_id IN (" . implode(',', array_fill(0, count($manufacturers), '?')) . ")";
        $params = array_merge($params, $manufacturers);
    }
    
    $whereClause = $where ? "WHERE " . implode(' AND ', $where) : "";
    
    // Основной запрос
    $stmt = $pdo->prepare("
        SELECT SQL_CALC_FOUND_ROWS 
            p.*,
            m.name AS manufacturer_name,
            c.name AS category_name
        FROM products p
        JOIN manufacturers m ON p.manufacturer_id = m.manufacturer_id
        JOIN categories c ON p.category_id = c.category_id
        $whereClause
        ORDER BY $sortBy
        LIMIT :offset, :perPage
    ");
    
    $stmt->bindValue(':offset', ($page - 1) * $perPage, PDO::PARAM_INT);
    $stmt->bindValue(':perPage', $perPage, PDO::PARAM_INT);
    $stmt->execute($params);
    
    $products = $stmt->fetchAll();
    $total = $pdo->query("SELECT FOUND_ROWS()")->fetchColumn();
    
    echo json_encode([
        'products' => $products,
        'pagination' => [
            'total' => (int)$total,
            'pages' => max(1, ceil($total / $perPage)),
            'current' => $page
        ]
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}