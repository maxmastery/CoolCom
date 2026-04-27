import { supabase } from './supabaseClient.js';
import { fetchCourses } from './api.js';
import { formatPrice, showLoadingState, showEmptyState, showErrorState } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('courses-grid');
    if(!grid) return;
    
    showLoadingState(grid);

    try {
        const courses = await fetchCourses();
        if(courses.length === 0) {
            showEmptyState(grid, 'ยังไม่มีคอร์สเรียนในระบบขณะนี้');
            return;
        }

        grid.innerHTML = ''; // clear loading state
        
        courses.forEach(course => {
            const isFree = course.is_free || course.price == 0 || course.price == null;
            const priceHtml = isFree ? `<span class="cc-price free">ฟรี</span>` : `<span class="cc-price">${formatPrice(course.price)}</span>`;
            
            const card = document.createElement('div');
            card.className = 'course-card premium-card'; // Added premium-card class
            card.dataset.cat = course.categories?.slug || 'all';

            const thumb = course.thumbnail_url || 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=600&q=80';
            const catName = course.categories?.name || 'ทั่วไป';
            const catSlug = course.categories?.slug || 'other';

            card.innerHTML = `
                <div class="cc-img">
                    <img src="${thumb}" alt="${course.title}">
                    <span class="cc-tag tag-${catSlug}">${catName}</span>
                    ${course.featured ? '<span class="cc-featured-badge"><i class="fa-solid fa-star"></i> แนะนำ</span>' : ''}
                </div>
                <div class="cc-body">
                    <h3 class="cc-title">${course.title}</h3>
                    <p class="cc-desc" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${course.short_description || course.description || 'ไม่มีคำอธิบาย'}</p>
                    <div class="cc-meta">
                        <span><i class="fa-solid fa-clock"></i> ${course.duration || 'ไม่ระบุเวลา'}</span>
                        <span><i class="fa-solid fa-signal"></i> ${course.level || 'ทั่วไป'}</span>
                    </div>
                    <div class="cc-footer">
                        ${priceHtml}
                        <a href="course-preview.html?slug=${course.slug}" class="cc-btn">อ่านเพิ่มเติม</a>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });

        // Dynamic Categories
        await renderCategoryTags();

        // Initialize Filtering and Search after cards are rendered
        initFilteringAndSearch();

    } catch (error) {
        console.error('Render courses error:', error);
        showErrorState(grid, error.message);
    }
});

async function renderCategoryTags() {
    const tagContainer = document.querySelector('.courses-tags');
    if (!tagContainer) return;

    try {
        const { data: categories, error } = await supabase
            .from('categories')
            .select('*')
            .eq('type', 'course')
            .order('sort_order', { ascending: true });

        if (error) throw error;

        // Start with "All" and "Recommended"
        let html = `
            <button class="tag-btn active" data-cat="all">ทั้งหมด</button>
            <button class="tag-btn" data-cat="recommended">คอร์สแนะนำ</button>
        `;

        categories.forEach(cat => {
            html += `<button class="tag-btn" data-cat="${cat.slug}">${cat.name}</button>`;
        });

        tagContainer.innerHTML = html;
    } catch (err) {
        console.warn('Failed to load categories dynamically, using hardcoded tags.', err);
    }
}

function initFilteringAndSearch() {
    const tagBtns = document.querySelectorAll('.tag-btn');
    const searchInput = document.getElementById('course-search');
    const cards = document.querySelectorAll('.course-card');

    tagBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tagBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const cat = btn.dataset.cat;
            
            cards.forEach(card => {
                if (cat === 'all') {
                    card.style.display = '';
                } else if (cat === 'recommended') {
                    // Show only if it has featured badge or featured data
                    const isFeatured = card.querySelector('.cc-featured-badge');
                    card.style.display = isFeatured ? '' : 'none';
                } else {
                    // Category filter
                    if (card.dataset.cat === cat) {
                        card.style.display = '';
                    } else {
                        card.style.display = 'none';
                    }
                }
            });
            
            // Scroll to top of results on mobile
            if (window.innerWidth < 768) {
                document.querySelector('.courses-main').scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const q = searchInput.value.toLowerCase();
            cards.forEach(card => {
                const title = card.querySelector('.cc-title')?.textContent.toLowerCase() || '';
                const desc = card.querySelector('.cc-desc')?.textContent.toLowerCase() || '';
                card.style.display = (title.includes(q) || desc.includes(q)) ? '' : 'none';
            });
        });
    }
}
