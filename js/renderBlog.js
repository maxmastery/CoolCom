import { fetchBlogPosts } from './api.js';
import { showLoadingState, showEmptyState, showErrorState } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('blog-grid');
    const tabsContainer = document.querySelector('.blog-filter-tabs');
    
    if (!grid) return;
    
    showLoadingState(grid);
    
    try {
        const blogs = await fetchBlogPosts();
        
        if (!blogs || blogs.length === 0) {
            showEmptyState(grid, 'Blog ที่น่าสนใจจะมาเร็ว ๆ นี้', 'fa-regular fa-newspaper');
            grid.classList.remove('blog-grid');
            if (tabsContainer) tabsContainer.style.display = 'none';
            return;
        }
        
        // Render Blogs
        grid.innerHTML = '';
        const categories = new Set();
        
        blogs.forEach(blog => {
            const catName = blog.categories ? blog.categories.name : 'ทั่วไป';
            categories.add(catName);
            
            const date = blog.published_at || blog.created_at;
            const dateStr = date ? new Date(date).toLocaleDateString('th-TH', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
            const desc = blog.excerpt || (blog.content ? blog.content.substring(0, 100) + '...' : '');
            
            const html = `
                <article class="blog-page-card" data-cat="${catName}">
                    <div class="bpc-img">
                        <img src="${blog.thumbnail_url || 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=600&q=80'}" alt="${blog.title}">
                        <span class="bpc-cat">${catName}</span>
                    </div>
                    <div class="bpc-body">
                        <div class="bpc-meta"><i class="fa-regular fa-clock"></i> ${dateStr}</div>
                        <h3 class="bpc-title" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${blog.title}</h3>
                        <p class="bpc-desc" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${desc}</p>
                        <div class="bpc-footer">
                            <a href="blog-post.html?slug=${blog.slug}" class="bpc-link">อ่านเพิ่มเติม <i class="fa-solid fa-arrow-right"></i></a>
                            <a href="#" class="bpc-share"><i class="fa-solid fa-share-nodes"></i></a>
                        </div>
                    </div>
                </article>
            `;
            grid.insertAdjacentHTML('beforeend', html);
        });
        
        // Build Tabs
        if (tabsContainer) {
            let tabsHtml = `<button class="blog-tab active" data-cat="all">ทั้งหมด</button>`;
            categories.forEach(cat => {
                tabsHtml += `<button class="blog-tab" data-cat="${cat}">${cat}</button>`;
            });
            tabsContainer.innerHTML = tabsHtml;
            
            // Bind Filter Logic
            const tabs = tabsContainer.querySelectorAll('.blog-tab');
            const cards = grid.querySelectorAll('.blog-page-card');
            
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    tabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    const cat = tab.dataset.cat;
                    cards.forEach(card => {
                        card.style.display = (cat === 'all' || card.dataset.cat === cat) ? '' : 'none';
                    });
                });
            });
        }
        
    } catch (err) {
        showErrorState(grid);
    }
});
