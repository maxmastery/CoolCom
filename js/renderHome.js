import { fetchHighlightContent, fetchBlogPosts, fetchContentVideos } from './api.js';
import { showLoadingState, showEmptyState, showErrorState, extractYoutubeId } from './utils.js';

console.log('--- Initializing Home Renderer ---');

// Containers
const highlightContainer = document.getElementById('home-highlight');
const blogContainer = document.getElementById('home-blog-grid');
const videoContainer = document.getElementById('home-video-grid');

// 1. Render Highlight (Special Selection or Featured)
const loadHighlight = async () => {
    if (!highlightContainer) {
        console.warn('Highlight container not found');
        return;
    }
    showLoadingState(highlightContainer);
    try {
        console.log('Fetching highlight content...');
        const item = await fetchHighlightContent();
        console.log('Highlight content received:', item);
        
        if (!item) {
            showEmptyState(highlightContainer, 'คอนเทนต์คัดสรรกำลังจะมาเร็ว ๆ นี้', 'fa-solid fa-crown');
        } else {
            const dateHtml = item.created_at ? `<span class="highlight-date"><i class="fa-regular fa-calendar"></i> ${new Date(item.created_at).toLocaleDateString('th-TH', { year:'numeric', month:'long', day:'numeric' })}</span>` : '';
            
            const desc = item.short_description || item.excerpt || item.description || 'ไม่มีคำอธิบาย';
            
            // Determine link based on type
            let targetLink = 'courses.html';
            if (item.type === 'blog_posts') targetLink = `blog-post.html?slug=${item.slug}`;
            else if (item.type === 'tools') targetLink = 'tools.html';
            else if (item.type === 'content_videos') targetLink = 'content.html';
            else if (item.type === 'products') targetLink = 'shop.html';
            
            highlightContainer.innerHTML = `
                <div class="highlight-row-card">
                    <div class="highlight-row-img">
                        <img src="${item.thumbnail_url || 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800&q=80'}" alt="${item.title || 'Highlight'}">
                    </div>
                    <div class="highlight-row-content">
                        ${item.categories ? `<span class="highlight-pill-badge">${item.categories.name}</span>` : '<span class="highlight-pill-badge">HIGHLIGHT</span>'}
                        <h3 class="highlight-row-title">${item.title || 'ไม่มีชื่อหัวข้อ'}</h3>
                        <p class="highlight-row-desc">${desc}</p>
                        <div class="highlight-row-footer" style="margin-top: 1.5rem; display: flex; justify-content: flex-end;">
                            <a href="${targetLink}" class="highlight-link-yellow">อ่านเพิ่มเติม <i class="fa-solid fa-chevron-right"></i></a>
                        </div>
                    </div>
                </div>
            `;
        }
    } catch (err) {
        console.error('Highlight error:', err);
        showErrorState(highlightContainer, err.message);
    }
};

// 2. Render Blog of the Week
const loadBlogs = async () => {
    if (!blogContainer) {
        console.warn('Blog container not found');
        return;
    }
    showLoadingState(blogContainer);
    try {
        console.log('Fetching blog posts...');
        const blogs = await fetchBlogPosts(3);
        console.log('Blogs received:', blogs?.length);
        
        if (!blogs || blogs.length === 0) {
            showEmptyState(blogContainer, 'Blog ที่น่าสนใจจะมาเร็ว ๆ นี้', 'fa-regular fa-newspaper');
            blogContainer.classList.remove('blog-grid');
        } else {
            blogContainer.innerHTML = '';
            blogs.forEach(blog => {
                const date = blog.published_at || blog.created_at;
                const dateStr = date ? new Date(date).toLocaleDateString('th-TH', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
                
                const rawExcerpt = blog.excerpt || blog.content || '';
                const desc = typeof rawExcerpt === 'string' ? rawExcerpt.substring(0, 80) + (rawExcerpt.length > 80 ? '...' : '') : '';
                
                const catName = blog.categories ? (Array.isArray(blog.categories) ? blog.categories[0]?.name : blog.categories.name) : 'บทความทั่วไป';

                const html = `
                <div class="blog-card-v2">
                    <div class="bcv2-img">
                        <img src="${blog.thumbnail_url || 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80'}" alt="${blog.title || 'Blog'}">
                        <span class="bcv2-cat">${catName}</span>
                    </div>
                    <div class="bcv2-body">
                        <div class="bcv2-date"><i class="fa-regular fa-clock"></i> ${dateStr}</div>
                        <h3 class="bcv2-title" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${blog.title || 'ไม่มีชื่อหัวข้อ'}</h3>
                        <p class="bcv2-desc" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${desc}</p>
                        <div class="bcv2-footer">
                            <a href="blog-post.html?slug=${blog.slug}" class="bcv2-link">อ่านเพิ่มเติม <i class="fa-solid fa-arrow-right"></i></a>
                            <a href="#" class="bcv2-share"><i class="fa-solid fa-share-nodes"></i></a>
                        </div>
                    </div>
                </div>
                `;
                blogContainer.insertAdjacentHTML('beforeend', html);
            });
        }
    } catch (err) {
        console.error('Blog error:', err);
        showErrorState(blogContainer, err.message);
    }
};

// 3. Render Videos
const loadVideos = async () => {
    if (!videoContainer) {
        console.warn('Video container not found');
        return;
    }
    showLoadingState(videoContainer);
    try {
        console.log('Fetching content videos...');
        const videos = await fetchContentVideos(3);
        console.log('Videos received:', videos?.length);
        
        if (!videos || videos.length === 0) {
            showEmptyState(videoContainer, 'Content ดี ๆ กำลังจะมาเร็ว ๆ นี้', 'fa-solid fa-circle-play');
        } else {
            const mainVideo = videos[0];
            const mainYoutubeId = mainVideo.youtube_id || extractYoutubeId(mainVideo.youtube_url);
            
            let html = `
            <div class="video-main">
                <div class="video-player-container">
                    <iframe class="video-player-iframe" src="https://www.youtube.com/embed/${mainYoutubeId}?autoplay=0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
                </div>
                <div class="video-main-info">
                    <h3 class="video-main-title">${mainVideo.title || 'ไม่มีชื่อวิดีโอ'}</h3>
                </div>
            </div>
            `;

            videos.forEach((video, index) => {
                const yId = video.youtube_id || extractYoutubeId(video.youtube_url);
                const thumb = video.thumbnail_url || `https://img.youtube.com/vi/${yId}/hqdefault.jpg`;
                const activeClass = index === 0 ? 'is-active' : '';
                html += `
                <div class="video-item ${activeClass}" data-video-id="${yId}">
                    <div class="video-item-thumb">
                        <img src="${thumb}" alt="${video.title || 'Video'}">
                    </div>
                    <div class="video-item-info">
                        <h3 class="video-item-title" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${video.title || 'ไม่มีชื่อวิดีโอ'}</h3>
                    </div>
                </div>
                `;
            });

            videoContainer.innerHTML = html;
            setupVideoInteractivity(videoContainer);
        }
    } catch (err) {
        console.error('Video error:', err);
        showErrorState(videoContainer, err.message);
    }
};

function setupVideoInteractivity(videoContainer) {
    const mainPlayer = videoContainer.querySelector('.video-player-iframe');
    const mainTitle = videoContainer.querySelector('.video-main-title');
    const videoItems = videoContainer.querySelectorAll('.video-item');

    videoContainer.classList.add('is-expanded');

    videoItems.forEach(item => {
        item.addEventListener('click', () => {
            const videoId = item.getAttribute('data-video-id');
            const title = item.querySelector('.video-item-title').innerText;
            if (mainPlayer) mainPlayer.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
            if (mainTitle) mainTitle.innerText = title;
            videoItems.forEach(v => v.classList.remove('is-active'));
            item.classList.add('is-active');
            if (window.innerWidth < 768) videoContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

// Execution
loadHighlight();
loadBlogs();
loadVideos();
