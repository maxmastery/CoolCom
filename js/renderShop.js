import { fetchProducts } from './api.js';
import { formatPrice, showLoadingState, showEmptyState, showErrorState } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('shop-grid');
    if(!grid) return;
    
    showLoadingState(grid);
    try {
        const products = await fetchProducts();
        if(products.length === 0) {
            showEmptyState(grid, 'ยังไม่มีสินค้าในร้านค้า'); return;
        }
        grid.innerHTML = '';
        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            
            const thumb = product.thumbnail_url || 'https://images.unsplash.com/photo-1544928147-79a2dbc1f389?w=600&q=80';
            
            let priceHtml = '';
            if(product.sale_price) {
                priceHtml = `<span class="pc-price old">${formatPrice(product.price)}</span>
                             <span class="pc-price sale">${formatPrice(product.sale_price)}</span>`;
            } else {
                priceHtml = `<span class="pc-price">${formatPrice(product.price)}</span>`;
            }

            card.innerHTML = `
                <div class="pc-img">
                    <img src="${thumb}" alt="${product.title}">
                    ${product.sale_price ? '<div class="pc-sale-badge">SALE</div>' : ''}
                </div>
                <div class="pc-body">
                    <span class="pc-cat">${product.categories?.name || 'สินค้า'}</span>
                    <h3 class="pc-title">${product.title}</h3>
                    <p class="pc-desc">${product.short_description || ''}</p>
                    <div class="pc-footer">
                        <div class="pc-prices">${priceHtml}</div>
                        <a href="${product.payment_url || '#'}" target="_blank" class="pc-btn-buy">สั่งซื้อ</a>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    } catch(err) { showErrorState(grid, err.message); }
});
