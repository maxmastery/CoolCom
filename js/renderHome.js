import { fetchHighlightContent, fetchBlogPosts, fetchContentVideos } from './api.js';
import { showLoadingState, showEmptyState, showErrorState } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Containers
    const highlightContainer = document.getElementById('home-highlight');
    const blogContainer = document.getElementById('home-blog-grid');
    const videoContainer = document.getElementById('home-video-grid');

    // 1. Render Highlight (Special Selection or Featured)
    if (highlightContainer) {
        showLoadingState(highlightContainer);
        try {
            const item = await fetchHighlightContent();
            if (!item) {
                showEmptyState(highlightContainer, 'คอนเทนต์คัดสรรกำลังจะมาเร็ว ๆ นี้', 'fa-solid fa-crown');
            } else {
                const dateHtml = item.created_at ? `<span class="highlight-date"><i class="fa-regular fa-calendar"></i> ${new Date(item.created_at).toLocaleDateString('th-TH', { year:'numeric', month:'long', day:'numeric' })}</span>` : '';
                
                const desc = item.short_description || item.excerpt || (item.description ? item.description.substring(0, 150) + '...' : 'ไม่มีคำอธิบาย');
                
                // Determine link based on type
                let targetLink = 'courses.html';
                if (item.type === 'blog_posts') targetLink = `blog-post.html?slug=${item.slug}`;
                else if (item.type === 'tools') targetLink = 'tools.html';
                else if (item.type === 'content_videos') targetLink = 'content.html';
                else if (item.type === 'products') targetLink = 'shop.html';
                
                highlightContainer.innerHTML = `
                    <div class="highlight-row-card">
                        <div class="highlight-row-img">
                            <span class="card-special-tag">SPECIAL!</span>
                            <img src="${item.thumbnail_url || 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800&q=80'}" alt="${item.title}">
                        </div>
                        <div class="highlight-row-content">
                            ${item.categories ? `<span class="highlight-pill-badge">${item.categories.name}</span>` : '<span class="highlight-pill-badge">HIGHLIGHT</span>'}
                            <h3 class="highlight-row-title">${item.title}</h3>
                            <p class="highlight-row-desc" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">${desc}</p>
                            <div class="highlight-row-footer" style="margin-top: 1.5rem;">
                                ${dateHtml}
                                <a href="${targetLink}" class="highlight-btn-circle"><i class="fa-solid fa-chevron-right"></i></a>
                            </div>
                        </div>
                    </div>
                `;
            }
        } catch (err) {
            showErrorState(highlightContainer);
        }
    }

    // 2. Render Blog of the Week
    if (blogContainer) {
        showLoadingState(blogContainer);
        try {
            const blogs = await fetchBlogPosts(3);
            if (!blogs || blogs.length === 0) {
                showEmptyState(blogContainer, 'Blog ที่น่าสนใจจะมาเร็ว ๆ นี้', 'fa-regular fa-newspaper');
                blogContainer.classList.remove('blog-grid');
            } else {
                blogContainer.innerHTML = '';
                blogs.forEach(blog => {
                    const date = blog.published_at || blog.created_at;
                    const dateStr = date ? new Date(date).toLocaleDateString('th-TH', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
                    const desc = blog.excerpt || blog.content?.substring(0, 80) + '...' || '';
                    const catName = blog.categories ? blog.categories.name : 'บทความทั่วไป';

                    const html = `
                    <div class="blog-card-v2">
                        <div class="bcv2-img">
                            <img src="${blog.thumbnail_url || 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80'}" alt="${blog.title}">
                            <span class="bcv2-cat">${catName}</span>
                        </div>
                        <div class="bcv2-body">
                            <div class="bcv2-date"><i class="fa-regular fa-clock"></i> ${dateStr}</div>
                            <h3 class="bcv2-title" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${blog.title}</h3>
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
            showErrorState(blogContainer);
        }
    }

    // 3. Render Videos
    if (videoContainer) {
        // Since we removed 'video-player.js', we incorporate the UI binding logic here
        showLoadingState(videoContainer);
        try {
            const videos = await fetchContentVideos(3);
            if (!videos || videos.length === 0) {
                showEmptyState(videoContainer, 'Content ดี ๆ กำลังจะมาเร็ว ๆ นี้', 'fa-solid fa-circle-play');
            } else {
                // Determine Main Video
                const mainVideo = videos[0];
                const mainYoutubeId = mainVideo.youtube_id || extractYoutubeId(mainVideo.youtube_url);
                
                let html = `
                <div class="video-main">
                    <div class="video-player-container">
                        <iframe class="video-player-iframe" src="https://www.youtube.com/embed/${mainYoutubeId}?autoplay=0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
                    </div>
                    <div class="video-main-info">
                        <h3 class="video-main-title">${mainVideo.title}</h3>
                    </div>
                </div>
                `;

                // Render video list items
                videos.forEach((video, index) => {
                    const yId = video.youtube_id || extractYoutubeId(video.youtube_url);
                    const thumb = video.thumbnail_url || `https://img.youtube.com/vi/${yId}/hqdefault.jpg`;
                    const activeClass = index === 0 ? 'is-active' : '';
                    
                    html += `
                    <div class="video-item ${activeClass}" data-video-id="${yId}">
                        <div class="video-item-thumb">
                            <img src="${thumb}" alt="${video.title}">
                        </div>
                        <div class="video-item-info">
                            <h3 class="video-item-title" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${video.title}</h3>
                        </div>
                    </div>
                    `;
                });

                videoContainer.innerHTML = html;
                
                // Bind Video Interactivity (From old video-player.js logic)
                const mainPlayer = videoContainer.querySelector('.video-player-iframe');
                const mainTitle = videoContainer.querySelector('.video-main-title');
                const videoItems = videoContainer.querySelectorAll('.video-item');

                // Initially expand
                videoContainer.classList.add('is-expanded');

                videoItems.forEach(item => {
                    item.addEventListener('click', () => {
                        const videoId = item.getAttribute('data-video-id');
                        const title = item.querySelector('.video-item-title').innerText;

                        // Expand showcase if not already
                        videoContainer.classList.add('is-expanded');

                        // Swap Video Source
                        if (mainPlayer) {
                            mainPlayer.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
                        }

                        // Update Main Title
                        if (mainTitle) {
                            mainTitle.innerText = title;
                        }

                        // Update Active State in List
                        videoItems.forEach(v => v.classList.remove('is-active'));
                        item.classList.add('is-active');

                        // Scroll to player on mobile
                        if (window.innerWidth < 768) {
                            videoContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    });
                });

            }
        } catch (err) {
            showErrorState(videoContainer);
        }
    }
});

function extractYoutubeId(url) {
    if (!url) return '';
    const regExp = /^.*(youtu.be\\/|v\\/|u\\/\\w\\/|embed\\/|watch\\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}
