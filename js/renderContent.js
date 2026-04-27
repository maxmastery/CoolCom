import { fetchContentVideos } from './api.js';
import { showLoadingState, showEmptyState, showErrorState } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('content-grid');
    if(!grid) return;
    
    showLoadingState(grid);
    try {
        const videos = await fetchContentVideos();
        if(videos.length === 0) {
            showEmptyState(grid, 'ยังไม่มีเนื้อหาวิดีโอ'); return;
        }
        grid.innerHTML = '';
        videos.forEach(video => {
            const card = document.createElement('div');
            card.className = 'video-card';
            if(video.featured) card.classList.add('featured');
            
            const thumbUrl = video.thumbnail_url || (video.youtube_id ? `https://img.youtube.com/vi/${video.youtube_id}/maxresdefault.jpg` : 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&q=80');

            card.innerHTML = `
                <div class="vc-thumbnail" onclick="window.open('${video.youtube_url}', '_blank')">
                    <img src="${thumbUrl}" alt="${video.title}">
                    <div class="vc-play-btn"><i class="fa-solid fa-play"></i></div>
                </div>
                <div class="vc-info">
                    <span class="vc-tag" style="display:inline-block; margin-bottom:0.5rem; font-size:0.8rem; color:var(--primary-color); border:1px solid var(--primary-color); padding:2px 8px; border-radius:12px;">${video.categories?.name || 'Video'}</span>
                    <h3 class="vc-title">${video.title}</h3>
                    <p class="vc-desc">${video.description || ''}</p>
                </div>
            `;
            grid.appendChild(card);
        });
    } catch(err) { showErrorState(grid, err.message); }
});
