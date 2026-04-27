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

        // Trigger the filtering script if it exists in the original page
        // A simple re-dispatch can help existing scripts catch up
        window.dispatchEvent(new Event('resize')); 

    } catch (error) {
        showErrorState(grid, error.message);
    }
});
