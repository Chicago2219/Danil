document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        window.location.href = 'index.html';
        return;
    }
    
    try {
        const response = await fetch(`/api/get_product.php?id=${productId}`);
        const product = await response.json();
        
        if (!product || product.error) {
            throw new Error(product?.error || 'Товар не найден');
        }
        
        renderProduct(product);
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        document.getElementById('product-details').innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    ${error.message}
                    <a href="index.html" class="btn btn-link">Вернуться в каталог</a>
                </div>
            </div>
        `;
    }
});

function renderProduct(product) {
    // Хлебные крошки
    document.getElementById('product-breadcrumb').textContent = product.name;
    
    // Основная информация
    document.getElementById('product-details').innerHTML = `
        <div class="col-md-6">
            <img src="${product.main_image_url}" class="img-fluid rounded" alt="${product.name}">
        </div>
        <div class="col-md-6">
            <h2>${product.name}</h2>
            <div class="mb-3">${renderRatingStars(product.rating)}</div>
            <h3 class="text-primary mb-4">$${product.price}</h3>
            
            <div class="d-flex mb-4">
                <div class="me-3">
                    <button class="btn btn-primary btn-lg add-to-cart">
                        <i class="fas fa-shopping-cart me-2"></i>В корзину
                    </button>
                </div>
                <button class="btn btn-outline-secondary">
                    <i class="far fa-heart"></i> В избранное
                </button>
            </div>
            
            <div class="card mb-4">
                <div class="card-header">
                    <h5>Описание</h5>
                </div>
                <div class="card-body">
                    <p>${product.description}</p>
                </div>
            </div>
        </div>
    `;
    
    // Обработчик кнопки "В корзину"
    document.querySelector('.add-to-cart').addEventListener('click', () => {
        addToCart(product.product_id);
    });
}

function renderRatingStars(rating) {
    // Та же функция, что и в script.js
}