/**
 * CoolCom Interactive Video Player
 * Inspired by WWE.com UI, customized for CoolCom
 */

document.addEventListener('DOMContentLoaded', () => {
    const showcase = document.querySelector('.video-showcase');
    if (!showcase) return;

    const mainPlayer = showcase.querySelector('.video-player-iframe');
    const mainTitle = showcase.querySelector('.video-main-title');
    const videoItems = showcase.querySelectorAll('.video-item');

    videoItems.forEach(item => {
        item.addEventListener('click', () => {
            const videoId = item.getAttribute('data-video-id');
            const title = item.querySelector('.video-item-title').innerText;

            // Expand showcase if not already
            showcase.classList.add('is-expanded');

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
                showcase.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});
