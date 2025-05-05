-- Создание базы данных
CREATE DATABASE IF NOT EXISTS electronics_store;
USE electronics_store;

-- Таблица производителей
CREATE TABLE manufacturers (
    manufacturer_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    country VARCHAR(50) NOT NULL,
    warranty_period_months INT DEFAULT 12 CHECK (warranty_period_months > 0),
    contact_email VARCHAR(100) UNIQUE,
    website VARCHAR(100),
    logo_url VARCHAR(255)
);

-- Таблица категорий товаров
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    parent_category_id INT NULL,
    FOREIGN KEY (parent_category_id) REFERENCES categories(category_id),
    icon_class VARCHAR(50)
);

-- Таблица товаров
CREATE TABLE products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
    quantity_in_stock INT NOT NULL DEFAULT 0 CHECK (quantity_in_stock >= 0),
    manufacturer_id INT NOT NULL,
    category_id INT NOT NULL,
    release_date DATE,
    weight_grams INT CHECK (weight_grams > 0),
    dimensions VARCHAR(20),
    main_image_url VARCHAR(255) NOT NULL,
    rating DECIMAL(2,1) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    FOREIGN KEY (manufacturer_id) REFERENCES manufacturers(manufacturer_id),
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

-- Таблица дополнительных изображений товаров
CREATE TABLE product_images (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- Таблица характеристик товаров
CREATE TABLE product_specs (
    spec_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    spec_name VARCHAR(100) NOT NULL,
    spec_value VARCHAR(255) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- Заполнение таблицы производителей
INSERT INTO manufacturers (name, country, warranty_period_months, contact_email, website, logo_url)
VALUES 
    ('Asus', 'Taiwan', 24, 'support@asus.com', 'www.asus.com', 'img/logos/asus.png'),
    ('Samsung', 'South Korea', 12, 'info@samsung.com', 'www.samsung.com', 'img/logos/samsung.png'),
    ('Intel', 'USA', 36, 'contact@intel.com', 'www.intel.com', 'img/logos/intel.png'),
    ('Apple', 'USA', 12, 'support@apple.com', 'www.apple.com', 'img/logos/apple.png');

-- Заполнение таблицы категорий
INSERT INTO categories (name, description, parent_category_id, icon_class)
VALUES 
    ('Компьютеры', 'Настольные и портативные компьютеры', NULL, 'fas fa-desktop'),
    ('Ноутбуки', 'Портативные компьютеры', 1, 'fas fa-laptop'),
    ('Комплектующие', 'Компоненты для ПК', NULL, 'fas fa-microchip'),
    ('Процессоры', 'Центральные процессоры', 3, 'fas fa-microchip'),
    ('Мониторы', 'Дисплеи для компьютеров', NULL, 'fas fa-tv'),
    ('Смартфоны', 'Мобильные телефоны', NULL, 'fas fa-mobile-alt');

-- Заполнение таблицы товаров
INSERT INTO products (name, description, price, quantity_in_stock, manufacturer_id, category_id, release_date, weight_grams, dimensions, main_image_url, rating)
VALUES 
    ('Asus ROG Strix G15', 'Игровой ноутбук 15.6" FHD, Intel Core i7, 16GB RAM, 1TB SSD, NVIDIA RTX 3060', 1200.00, 10, 1, 2, '2022-03-15', 2300, '360x260x25 мм', 'img/products/asus-rog-strix-g15-1.png', 4.5),
    ('Samsung Odyssey G7', 'Игровой монитор 27" QHD, 240Hz, 1ms, изогнутый экран', 599.99, 15, 2, 5, '2021-10-01', 6500, '615x545x250 мм', 'img/products/samsung-odyssey-g7-1.png', 4.8),
    ('Intel Core i9-13900K', 'Процессор 24 ядра, 5.8 GHz, LGA 1700', 589.00, 20, 3, 4, '2022-10-20', 50, '45x45 мм', 'img/products/intel-core-i9-1.png', 4.7),
    ('iPhone 14 Pro', 'Смартфон 6.1" Super Retina XDR, A16 Bionic, 128GB', 999.00, 8, 4, 6, '2022-09-16', 206, '147.5x71.5x7.85 мм', 'img/products/iphone-14-pro-1.png', 4.9);

-- Заполнение таблицы дополнительных изображений
INSERT INTO product_images (product_id, image_url)
VALUES 
    (1, 'img/products/asus-rog-strix-g15-1.png'),
    (1, 'img/products/asus-rog-strix-g15-2.png'),
    (2, 'img/products/samsung-odyssey-g7-1.png'),
    (2, 'img/products/samsung-odyssey-g7-2.png'),
    (3, 'img/products/intel-core-i9-1.png'),
    (4, 'img/products/iphone-14-pro-1.png'),
    (4, 'img/products/iphone-14-pro-2.png');

-- Заполнение таблицы характеристик
INSERT INTO product_specs (product_id, spec_name, spec_value)
VALUES 
    (1, 'Диагональ экрана', '15.6 дюймов'),
    (1, 'Разрешение', '1920x1080 (Full HD)'),
    (1, 'Процессор', 'Intel Core i7-12700H'),
    (1, 'Оперативная память', '16 ГБ DDR4'),
    (1, 'Накопитель', '1 ТБ SSD'),
    (1, 'Видеокарта', 'NVIDIA GeForce RTX 3060'),
    (2, 'Диагональ экрана', '27 дюймов'),
    (2, 'Разрешение', '2560x1440 (QHD)'),
    (2, 'Частота обновления', '240 Гц'),
    (2, 'Время отклика', '1 мс'),
    (2, 'Изогнутый экран', 'Да (1000R)'),
    (3, 'Сокет', 'LGA 1700'),
    (3, 'Количество ядер', '24 (8P+16E)'),
    (3, 'Тактовая частота', 'до 5.8 ГГц'),
    (3, 'Тепловыделение', '125 Вт'),
    (4, 'Экран', '6.1" Super Retina XDR'),
    (4, 'Процессор', 'A16 Bionic'),
    (4, 'Память', '128 ГБ'),
    (4, 'Камеры', 'Тройная 48+12+12 Мп'),
    (4, 'Аккумулятор', '3200 мАч');