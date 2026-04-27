import { fetchActiveAnnouncements } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    // ตรวจสอบวันที่เพื่อโชว์วันละ 1 ครั้ง
    const today = new Date().toDateString();
    const lastSeen = localStorage.getItem('coolcom_popup_seen');
    
    // ถ้าเคยเห็นในวันนี้แล้ว ให้ข้ามไป (สำหรับการทดสอบ สามารถ comment บรรทัดนี้ชั่วคราวได้)
    if (lastSeen === today) return; 

    try {
        const announcements = await fetchActiveAnnouncements();
        if(!announcements || announcements.length === 0) return;
        
        // เลือกชิ้นแรกที่ Active มาแสดง
        const popupData = announcements[0];
        
        // ใส่ CSS อัตโนมัติ (ไม่ต้องไปแก้ style.css ให้วุ่นวาย)
        const style = document.createElement('style');
        style.textContent = `
            .global-popup-overlay {
                position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.85); z-index: 99999;
                display: flex; justify-content: center; align-items: center;
                backdrop-filter: blur(8px);
                opacity: 0; transition: opacity 0.4s ease;
                font-family: 'Inter', 'Prompt', sans-serif;
            }
            .global-popup-box {
                background: linear-gradient(135deg, #1a1a2e, #16213e);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 20px; width: 90%; max-width: 480px;
                padding: 0; position: relative; overflow: hidden;
                box-shadow: 0 30px 60px rgba(0,0,0,0.6);
                transform: translateY(30px) scale(0.95); 
                transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            .global-popup-close {
                position: absolute; top: 15px; right: 15px;
                background: rgba(0,0,0,0.5); border: none; color: white;
                width: 32px; height: 32px; border-radius: 50%;
                font-size: 1.5rem; cursor: pointer; display: flex;
                align-items: center; justify-content: center; z-index: 10;
                transition: background 0.2s;
            }
            .global-popup-close:hover { background: rgba(255,0,0,0.8); }
            .global-popup-img img { width: 100%; height: auto; max-height: 280px; object-fit: cover; display: block; border-bottom: 3px solid #FFC300; }
            .global-popup-content { padding: 2rem; text-align: center; color: white; }
            .global-popup-content h3 { font-size: 1.5rem; margin-bottom: 0.8rem; color: #FFC300; font-weight: 700; line-height: 1.3;}
            .global-popup-content p { color: #cbd5e1; margin-bottom: 1.5rem; font-size: 0.95rem; line-height: 1.6;}
            .global-popup-btn {
                display: inline-block; background: #FFC300; color: #000;
                padding: 0.75rem 2rem; border-radius: 30px; font-weight: 600;
                text-decoration: none; transition: 0.3s;
                box-shadow: 0 4px 15px rgba(255, 195, 0, 0.3);
            }
            .global-popup-btn:hover { background: #e5b000; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(255, 195, 0, 0.4); }
        `;
        document.head.appendChild(style);

        // สร้าง Element Overlay โครงสร้าง Popup
        const overlay = document.createElement('div');
        overlay.className = 'global-popup-overlay';
        overlay.innerHTML = `
            <div class="global-popup-box">
                <button class="global-popup-close">&times;</button>
                ${popupData.image_url ? `<div class="global-popup-img"><img src="${popupData.image_url}" alt="Announcement"></div>` : ''}
                <div class="global-popup-content">
                    <h3>${popupData.title}</h3>
                    ${popupData.description ? `<p>${popupData.description}</p>` : ''}
                    ${popupData.link_url ? `<a href="${popupData.link_url}" class="global-popup-btn" target="${popupData.link_url.startsWith('http') ? '_blank' : '_self'}">คลิกดูรายละเอียด</a>` : ''}
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        // แอนิเมชั่นโผล่ขึ้นมา (Delay เล็กน้อยให้ UI พร้อม)
        setTimeout(() => {
            overlay.style.opacity = '1';
            overlay.querySelector('.global-popup-box').style.transform = 'translateY(0) scale(1)';
        }, 150);

        // ฟังก์ชันลบ Popup ออกไป
        const closePopup = () => {
            overlay.style.opacity = '0';
            overlay.querySelector('.global-popup-box').style.transform = 'translateY(-20px) scale(0.95)';
            setTimeout(() => overlay.remove(), 400);
            
            // บันทึกวันลง LocalStorage จะไม่ขึ้นอีกในวันนี้
            localStorage.setItem('coolcom_popup_seen', today);
        };

        // ผูก Event ปุ่มและพื้นหลังเวลาจะย่อเก็บ
        overlay.querySelector('.global-popup-close').addEventListener('click', closePopup);
        overlay.addEventListener('click', (e) => {
            if(e.target === overlay) closePopup();
        });

    } catch (err) {
        console.error('เกิดข้อผิดพลาดในการโหลดระบบ Popup:', err);
    }
});
