export function formatPrice(price, isFree = false) {
    if (isFree || price === 0 || price === null || price === undefined) {
        return 'ฟรี';
    }
    return Number(price).toLocaleString('th-TH') + ' ฿';
}

export function showLoadingState(container) {
    if(!container) return;
    container.innerHTML = `
        <div class="loading-state" style="text-align: center; padding: 4rem 2rem; width: 100%; grid-column: 1 / -1;">
            <i class="fa-solid fa-spinner fa-spin" style="font-size: 3rem; color: var(--primary-color);"></i>
            <p style="margin-top: 1rem; color: var(--text-light); font-weight: 500;">กำลังโหลดข้อมูล...</p>
        </div>
    `;
}

export function showEmptyState(container, message = 'ยังไม่มีข้อมูลในหมวดหมู่นี้', iconClass = 'fa-solid fa-box-open') {
    if(!container) return;
    container.innerHTML = `
        <div class="empty-state" style="text-align: center; padding: 4rem 2rem; width: 100%; grid-column: 1 / -1; background: rgba(0,0,0,0.03); border-radius: 12px; border: 1px dashed rgba(0,0,0,0.15);">
            <i class="${iconClass}" style="font-size: 3rem; color: #1a1a1a; opacity: 0.3; margin-bottom: 1rem;"></i>
            <h3 style="color: #1a1a1a; margin-bottom: 0.5rem;">${message}</h3>
            <p style="color: #1a1a1a; opacity: 0.6; font-size: 0.9rem;">ข้อมูลจะถูกเพิ่มเข้ามาในเร็ว ๆ นี้</p>
        </div>
    `;
}

export function showErrorState(container, errorMsg = 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้') {
    if(!container) return;
    container.innerHTML = `
        <div class="error-state" style="text-align: center; padding: 4rem 2rem; width: 100%; grid-column: 1 / -1; background: rgba(255,107,107,0.05); border-radius: 12px; border: 1px solid rgba(255,107,107,0.2);">
            <i class="fa-solid fa-circle-exclamation" style="font-size: 3rem; color: #ff6b6b; margin-bottom: 1rem;"></i>
            <h3 style="color: #ff6b6b; margin-bottom: 0.5rem;">เกิดข้อผิดพลาดในการโหลดข้อมูล</h3>
            <p style="color: var(--text-light); font-size: 0.9rem;">${errorMsg}</p>
            <button onclick="window.location.reload()" style="margin-top: 1rem; padding: 0.5rem 1.5rem; border-radius: 20px; border: none; background: var(--primary-color); color: var(--text-dark); cursor: pointer; font-family: 'Inter', 'Prompt', sans-serif; font-weight: 600;">ลองใหม่</button>
        </div>
    `;
}

export function extractYoutubeId(url) {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
}
