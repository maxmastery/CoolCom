import { fetchTools } from './api.js';
import { showLoadingState, showEmptyState, showErrorState } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
    const featuredContainer = document.getElementById('tools-featured-container');
    const grid = document.getElementById('tools-grid');
    
    if(featuredContainer) showLoadingState(featuredContainer);
    if(grid) showLoadingState(grid);

    try {
        const tools = await fetchTools();
        
        if (tools.length === 0) {
            if(featuredContainer) showEmptyState(featuredContainer, 'ยังไม่มีเครื่องมือแนะนำในขณะนี้');
            if(grid) grid.innerHTML = '';
            return;
        }

        const featuredTools = tools.filter(t => t.featured);
        const normalTools = tools.filter(t => !t.featured);

        // Render Featured
        if (featuredContainer) {
            featuredContainer.innerHTML = '';
            featuredTools.forEach((tool, index) => {
                const isReverse = index % 2 !== 0;
                
                const card = document.createElement('div');
                card.className = `tool-row-card ${isReverse ? 'reverse' : ''}`;
                
                const imageSection = `
                    <div class="trc-image">
                        <div class="trc-img-mock" style="background: url('${tool.thumbnail_url || ''}') center/cover; min-height: 250px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
                        </div>
                    </div>
                `;
                
                const contentSection = `
                    <div class="trc-content">
                        <span class="trc-badge">${tool.categories?.name || 'Cool Tool'}</span>
                        <h3 class="trc-title">${tool.title}</h3>
                        <p class="trc-desc">${tool.description || ''}</p>
                        <a href="${tool.tool_url || '#'}" target="_blank" class="btn-trc-primary">ใช้เครื่องมือ <i class="fa-solid fa-arrow-right"></i></a>
                    </div>
                `;

                if (isReverse) {
                    card.innerHTML = contentSection + imageSection;
                } else {
                    card.innerHTML = imageSection + contentSection;
                }
                
                featuredContainer.appendChild(card);
            });
            
            if(featuredTools.length === 0) {
                featuredContainer.innerHTML = '<p style="text-align:center; color: var(--text-muted);">ไม่มีเครื่องมือแนะนำ</p>';
            }
        }

        // Render Normal
        if (grid) {
            grid.innerHTML = '';
            normalTools.forEach(tool => {
                const card = document.createElement('div');
                card.className = 'tool-mini-card';
                // Try to put some icon or logic if missing
                card.innerHTML = `
                    <i class="fa-solid fa-wrench"></i>
                    <h4>${tool.title}</h4>
                    <p style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${tool.description || ''}</p>
                    <a href="${tool.tool_url || '#'}" target="_blank">ใช้งาน →</a>
                `;
                grid.appendChild(card);
            });
            
            if(normalTools.length === 0) {
                grid.innerHTML = '<p style="text-align:center; color: var(--text-muted); grid-column: 1/-1;">ยังไม่มีเครื่องมืออื่นๆ</p>';
            }
        }

    } catch (error) {
        if(featuredContainer) showErrorState(featuredContainer, error.message);
        if(grid) showErrorState(grid, error.message);
    }
});
