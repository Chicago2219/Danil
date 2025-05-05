document.addEventListener('DOMContentLoaded', async () => {
    console.log('Документ загружен');
    try {
        await loadProducts();
        initEventListeners();
    } catch (error) {
        console.error('Ошибка инициализации:', error);
        showError('Произошла ошибка при загрузке страницы');
    }
});

// Загрузка товаров с фильтрами
async function loadProducts(page = 1) {
    try {
        console.log(`Загрузка товаров, страница ${page}`);
        const filters = getCurrentFilters();
        const sortBy = document.getElementById('sort-by').value;
        
        const response = await fetch(`/api/get_products.php?page=${page}&sort_by=${sortBy}&${buildQueryString(filters)}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Полученные данные:', data);
        
        // Проверка структуры ответа
        if (!data || !Array.isArray(data.products)) {
            throw new Error('Некорректный формат данных от сервера');
        }
        
        renderProducts(data.products);
        
        if (data.pagination) {
            renderPagination(data.pagination);
        }
        
    } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
        showError('Не удалось загрузить товары. Пожалуйста, попробуйте позже.');
    }
}

// Рендер товаров
function renderProducts(products) {
    const container = document.getElementById('products-container');
    if (!container) {
        console.error('Контейнер товаров не найден!');
        return;
    }
    
    // Проверка входных данных
    if (!products || !Array.isArray(products)) {
        container.innerHTML = '<div class="col-12"><div class="alert alert-danger">Некорректные данные товаров</div></div>';
        return;
    }
    
    if (products.length === 0) {
        container.innerHTML = '<div class="col-12"><div class="alert alert-info">Товары не найдены</div></div>';
        return;
    }
    
    try {
        container.innerHTML = products.map(product => {
            // Проверка обязательных полей
            if (!product || !product.product_id || !product.name) {
                console.warn('Невалидный товар:', product);
                return '';
            }
            
            return `
                <div class="col-md-3 mb-4 product-card" data-id="${product.product_id}">
                    <div class="card h-100">
                        <img src="${product.main_image_url || 'img/no-image.png'}" 
                             class="card-img-top p-2" 
                             alt="${product.name}"
                             style="height: 200px; object-fit: contain;">
                        <div class="card-body">
                            <h5 class="card-title">${product.name}</h5>
                            <div class="mb-2">${renderRatingStars(product.rating || 0)}</div>
                            <p class="card-text text-truncate">${product.description || ''}</p>
                        </div>
                        <div class="card-footer bg-white">
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="h5 text-primary">$${product.price || 0}</span>
                                <button class="btn btn-sm btn-outline-primary add-to-cart">В корзину</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        initProductCards();
        
    } catch (error) {
        console.error('Ошибка рендеринга товаров:', error);
        container.innerHTML = '<div class="col-12"><div class="alert alert-danger">Ошибка отображения товаров</div></div>';
    }
}

// Инициализация карточек товаров
function initProductCards() {
    // Клик по карточке (переход на страницу товара)
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', function(e) {
            if (!e.target.closest('.add-to-cart')) {
                window.location.href = `product.html?id=${this.dataset.id}`;
            }
        });
    });
    
    // Кнопки "В корзину"
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            addToCart(this.closest('.product-card').dataset.id);
        });
    });
}

// Фильтрация
function getCurrentFilters() {
    return {
        min_price: document.getElementById('min-price').value,
        max_price: document.getElementById('max-price').value,
        categories: Array.from(document.querySelectorAll('#category-filters .active'))
            .map(el => el.dataset.categoryId),
        manufacturers: Array.from(document.querySelectorAll('#manufacturer-filters .active'))
            .map(el => el.dataset.manufacturerId)
    };
}

function buildQueryString(filters) {
    const params = new URLSearchParams();
    
    if (filters.min_price) params.append('min_price', filters.min_price);
    if (filters.max_price) params.append('max_price', filters.max_price);
    if (filters.categories.length) params.append('categories', filters.categories.join(','));
    if (filters.manufacturers.length) params.append('manufacturers', filters.manufacturers.join(','));
    
    return params.toString();
}

function initFilterButtons() {
    // Кнопки фильтров
    document.querySelectorAll('#category-filters a, #manufacturer-filters a').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            this.classList.toggle('active');
            loadProducts(1);
        });
    });
    
    // Кнопка "Применить фильтры"
    document.getElementById('apply-filters').addEventListener('click', () => loadProducts(1));
}

// Функция отрисовки звезд рейтинга
function renderRatingStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    let starsHTML = '';
    
    // Полные звезды
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star text-warning"></i>';
    }
    
    // Половина звезды
    if (hasHalfStar) {
        starsHTML += '<i class="fas fa-star-half-alt text-warning"></i>';
    }
    
    // Пустые звезды
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="far fa-star text-warning"></i>';
    }
    
    return starsHTML;
}

// Функция отрисовки пагинации
function renderPagination(pagination) {
    const container = document.getElementById('pagination');
    if (!pagination || pagination.pages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // Кнопка "Назад"
    html += `
        <li class="page-item ${pagination.current === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${pagination.current - 1}">
                &laquo;
            </a>
        </li>
    `;
    
    // Нумерация страниц
    for (let i = 1; i <= pagination.pages; i++) {
        html += `
            <li class="page-item ${i === pagination.current ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
        `;
    }
    
    // Кнопка "Вперед"
    html += `
        <li class="page-item ${pagination.current === pagination.pages ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${pagination.current + 1}">
                &raquo;
            </a>
        </li>
    `;
    
    container.innerHTML = html;
}

// Функция отображения ошибки
function showError(message) {
    const container = document.getElementById('products-container');
    container.innerHTML = `
        <div class="col-12">
            <div class="alert alert-danger">
                ${message}
                <button class="btn btn-sm btn-outline-danger ms-2" onclick="location.reload()">
                    Обновить
                </button>
            </div>
        </div>
    `;
}

// Функция инициализации обработчиков событий
function initEventListeners() {
    // Сортировка
    document.getElementById('sort-by').addEventListener('change', () => loadProducts(1));
    
    // Пагинация
    document.getElementById('pagination').addEventListener('click', (e) => {
        if (e.target.classList.contains('page-link')) {
            e.preventDefault();
            const page = parseInt(e.target.dataset.page);
            if (!isNaN(page)) loadProducts(page);
        }
    });
}

// Функция добавления в корзину (заглушка)
function addToCart(productId) {
    console.log(`Товар ${productId} добавлен в корзину`);
    // Реальная реализация зависит от вашей системы корзины
    // Например:
    // let cart = JSON.parse(localStorage.getItem('cart') || []);
    // cart.push(productId);
    // localStorage.setItem('cart', JSON.stringify(cart));
    
    // Визуальный фидбек
    const btn = document.querySelector(`.add-to-cart[data-id="${productId}"]`);
    if (btn) {
        btn.innerHTML = '<i class="fas fa-check"></i> Добавлено';
        btn.classList.remove('btn-outline-primary');
        btn.classList.add('btn-success');
        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-shopping-cart"></i> В корзину';
            btn.classList.add('btn-outline-primary');
            btn.classList.remove('btn-success');
        }, 2000);
    }
}