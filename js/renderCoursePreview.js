import { supabase } from './supabaseClient.js';
import { showErrorState } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');
    const container = document.getElementById('preview-content-area');

    if (!slug) {
        window.location.href = 'courses.html';
        return;
    }

    try {
        const { data: course, error } = await supabase
            .from('courses')
            .select('*, categories(name)')
            .eq('slug', slug)
            .single();

        if (error || !course) {
            container.innerHTML = '<div style="text-align:center; padding: 5rem;"><h3>ไม่พบข้อมูลหลักสูตร</h3><a href="courses.html" class="btn btn-primary" style="margin-top:1rem;">กลับไปหน้าหลักสูตร</a></div>';
            return;
        }

        document.title = `${course.title} - CoolCom`;

        const thumb = course.thumbnail_url || 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=1200&q=80';
        const description = course.description || course.short_description || 'ไม่มีคำอธิบายเพิ่มเติม';
        const catName = course.categories?.name || 'ทั่วไป';

        container.innerHTML = `
            <div class="preview-card">
                <div class="preview-hero">
                    <img src="${thumb}" alt="${course.title}">
                    <div class="preview-hero-overlay">
                        <div>
                            <span style="background:#FFC300; color:#111; padding: 0.3rem 1rem; border-radius: 100px; font-size:0.8rem; font-weight:700; margin-bottom:1rem; display:inline-block;">${catName}</span>
                            <h1 class="preview-title">${course.title}</h1>
                            <div class="preview-meta">
                                <span><i class="fa-solid fa-clock"></i> ${course.duration || 'ไม่ระบุเวลา'}</span>
                                <span><i class="fa-solid fa-signal"></i> ${course.level || 'ทั่วไป'}</span>
                                <span><i class="fa-solid fa-tag"></i> ${course.is_free ? 'คอร์สเรียนฟรี' : 'มีค่าใช้จ่าย'}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="preview-content">
                    <div class="preview-body">
                        ${description.replace(/\n/g, '<br>')}
                    </div>
                    <div class="preview-actions">
                        <a href="${course.external_url || '#'}" target="_blank" class="btn-preview-start">
                            เริ่มเรียนทันที <i class="fa-solid fa-play"></i>
                        </a>
                    </div>
                </div>
            </div>
        `;

    } catch (error) {
        console.error('Error loading course preview:', error);
        showErrorState(container, 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    }
});
