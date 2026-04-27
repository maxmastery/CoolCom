import { fetchBlogPostBySlug } from './api.js';
import { showLoadingState, showErrorState } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('blog-post-container');
    if (!container) return;
    
    // Get slug from URL
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');
    
    if (!slug) {
        showErrorState(container, 'ไม่พบบทความ หรือ URL ไม่ถูกต้อง');
        return;
    }
    
    showLoadingState(container);
    
    try {
        const blog = await fetchBlogPostBySlug(slug);
        
        if (!blog) {
            showErrorState(container, 'บทความนี้อาจถูกลบไปแล้ว หรือยังไม่เผยแพร่');
            return;
        }
        
        // Format Date
        const date = blog.published_at || blog.created_at;
        const dateStr = date ? new Date(date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
        const catName = blog.categories ? blog.categories.name : 'ทั่วไป';
        
        // Update Meta Title if possible
        document.title = `${blog.title} - CoolCom Blog`;
        
        // Convert Text Content Line breaks
        const formattedContent = blog.content ? blog.content.replace(/\\n/g, '<br/>') : '';

        // Build HTML
        const html = `
            <div class="bp-header">
                <span class="bp-category">${catName}</span>
                <h1 class="bp-title">${blog.title}</h1>
                <div class="bp-meta">
                    <span class="bp-author"><i class="fa-solid fa-user-pen"></i> เขียนโดย ${blog.author || 'CoolCom'}</span>
                    <span class="bp-date"><i class="fa-regular fa-calendar"></i> ${dateStr}</span>
                </div>
            </div>
            
            <div class="bp-hero-image">
                <img src="${blog.thumbnail_url || 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=1200&q=80'}" alt="${blog.title}" class="bp-img">
            </div>
            
            <div class="bp-content-body">
                ${formattedContent}
            </div>
            
            <div class="bp-footer-actions">
                <a href="blog.html" class="btn btn-black"><i class="fa-solid fa-arrow-left"></i> กลับไปหน้ารวมบทความ</a>
            </div>
        `;
        
        container.innerHTML = html;
        
    } catch (error) {
        showErrorState(container, 'เกิดข้อผิดพลาดในการโหลดเนื้อหา กรุณาลองใหม่อีกครั้ง');
    }
});
