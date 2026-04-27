import { supabase } from './supabaseClient.js';
import { fetchProducts } from './api.js';
import { formatPrice, showLoadingState, showEmptyState, showErrorState } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('shop-grid');
    if(!grid) return;
    
    showLoadingState(grid);
    try {
        // Dynamic Categories
        await renderShopCategoryTags();

        const products = await fetchProducts();
        if(!products || products.length === 0) {
            showEmptyState(grid, 'ยังไม่มีสินค้าในร้านค้าขณะนี้', 'fa-solid fa-cart-shopping');
            return;
        }

        grid.innerHTML = ''; // Clear loading
        
        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'shop-product-card';
            card.dataset.cat = product.categories?.slug || 'other';

            const thumb = product.thumbnail_url || 'https://images.unsplash.com/photo-1544928147-79a2dbc1f389?w=600&q=80';
            const catName = product.categories?.name || 'ทั่วไป';
            
            let priceHtml = '';
            if (product.sale_price && product.sale_price < product.price) {
                priceHtml = `<div class="spc-price-wrap"><span class="spc-price">${formatPrice(product.sale_price)}</span><span class="spc-old">${formatPrice(product.price)}</span></div>`;
            } else {
                priceHtml = `<div class="spc-price-wrap"><span class="spc-price">${formatPrice(product.price)}</span></div>`;
            }

            card.innerHTML = `
                <div class="spc-img">
                    <img src="${thumb}" alt="${product.title}">
                    <span class="spc-tag">${catName}</span>
                    ${product.featured ? '<span class="spc-badge-hot">แนะนำ</span>' : ''}
                </div>
                <div class="spc-body">
                    <h3 class="spc-title">${product.title}</h3>
                    <p class="spc-desc" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${product.short_description || product.description || ''}</p>
                    <div class="spc-footer">
                        ${priceHtml}
                        <a href="${product.payment_url || '#'}" target="_blank" class="spc-add-btn"><i class="fa-solid fa-cart-shopping"></i></a>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });

        // Initialize Filtering and Search
        initShopControls();

    } catch(err) { 
        console.error('Shop render error:', err);
        showErrorState(grid, err.message); 
    }
});

async function renderShopCategoryTags() {
    const tagContainer = document.querySelector('.shop-cats');
    if (!tagContainer) return;

    try {
        const { data: categories, error } = await supabase
            .from('categories')
            .select('*')
            .eq('type', 'product')
            .order('sort_order', { ascending: true });

        if (error) throw error;

        let html = '<button class="shop-cat-btn active" data-cat="all"><i class="fa-solid fa-th-large"></i> ทั้งหมด</button>';

        categories.forEach(cat => {
            let icon = 'fa-solid fa-tag';
            if (cat.slug.includes('ebook')) icon = 'fa-solid fa-book';
            else if (cat.slug.includes('course')) icon = 'fa-solid fa-graduation-cap';
            else if (cat.slug.includes('media')) icon = 'fa-solid fa-palette';
            else if (cat.slug.includes('tool')) icon = 'fa-solid fa-wrench';

            html += `<button class="shop-cat-btn" data-cat="${cat.slug}"><i class="${icon}"></i> ${cat.name}</button>`;
        });

        tagContainer.innerHTML = html;
    } catch (err) {
        console.warn('Failed to load shop categories dynamically.', err);
    }
}

function initShopControls() {
    const catBtns = document.querySelectorAll('.shop-cat-btn');
    const searchInput = document.getElementById('shop-search');
    const cards = document.querySelectorAll('.shop-product-card');

    catBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            catBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const cat = btn.dataset.cat;
            cards.forEach(card => {
                card.style.display = (cat === 'all' || card.dataset.cat === cat) ? '' : 'none';
            });
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const q = searchInput.value.toLowerCase();
            cards.forEach(card => {
                const title = card.querySelector('.spc-title')?.textContent.toLowerCase() || '';
                card.style.display = title.includes(q) ? '' : 'none';
            });
        });
    }
}
