import { fetchContentVideos } from './api.js';
import { showLoadingState, showEmptyState, showErrorState, extractYoutubeId } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.querySelector('.content-videos-grid');
    if (!grid) return;

    showLoadingState(grid);

    try {
        const videos = await fetchContentVideos();
        
        if (!videos || videos.length === 0) {
            showEmptyState(grid, 'Content ดี ๆ กำลังจะมาเร็ว ๆ นี้', 'fa-solid fa-circle-play');
            // Hide the load more button if it exists
            const moreBtn = document.querySelector('.content-more-btn-wrapper');
            if (moreBtn) moreBtn.style.display = 'none';
            return;
        }

        grid.innerHTML = ''; // Clear loading
        
        videos.forEach(video => {
            const yId = video.youtube_id || extractYoutubeId(video.youtube_url);
            const thumb = video.thumbnail_url || `https://img.youtube.com/vi/${yId}/hqdefault.jpg`;
            
            const card = document.createElement('div');
            card.className = 'content-video-card';
            card.style.cursor = 'pointer';
            card.onclick = () => {
                if (yId) window.open(`https://www.youtube.com/watch?v=${yId}`, '_blank');
            };

            card.innerHTML = `
                <div class="content-video-thumb">
                    <img src="${thumb}" alt="${video.title}">
                    <div class="content-play-btn"><i class="fa-solid fa-play"></i></div>
                </div>
                <h3 class="content-video-title" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${video.title}</h3>
            `;
            grid.appendChild(card);
        });

    } catch (err) {
        console.error('Content render error:', err);
        showErrorState(grid, err.message);
    }
});
