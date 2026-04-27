import { checkAdminAuth } from './auth.js';
import { supabase } from '../js/supabaseClient.js';
import { fetchTableData, renderTable, deleteRecord, openFormModal } from './crud.js';

let currentUser = null;
let currentPage = 'dashboard';

export const pagesConfig = {
    dashboard: { title: 'Dashboard ภาพรวมการจัดการ', hasAdd: false },
    courses: { table: 'courses', title: 'จัดการคอร์สเรียน (Courses)', hasAdd: true,
        columns: [
            { key: 'thumbnail_url', label: 'รูปภาพ', type: 'image' },
            { key: 'title', label: 'ชื่อคอร์ส', type: 'text' },
            { key: 'status', label: 'สถานะ', type: 'status' },
            { key: 'featured', label: 'แนะนำ (Featured)', type: 'boolean' },
            { key: 'is_special', label: 'คัดสรรพิเศษ', type: 'boolean' }
        ],
        fields: [
            { name: 'title', label: 'ชื่อคอร์ส', type: 'text', required: true },
            { name: 'slug', label: 'URL Slug', type: 'text', required: true, help: 'เช่น exam-prep-69' },
            { name: 'thumbnail_url', label: 'หน้าปกคอร์ส (Thumbnail)', type: 'image' },
            { name: 'short_description', label: 'คำอธิบายสั้นๆ', type: 'text' },
            { name: 'description', label: 'รายละเอียดครบถ้วน', type: 'textarea' },
            { name: 'category_id', label: 'หมวดหมู่ (Category)', type: 'category_select', help: 'ระบบจะดึงหมวดหมู่จากฐานข้อมูลให้อัตโนมัติ' },
            { name: 'price', label: 'ราคา', type: 'number', default: 0 },
            { name: 'is_free', label: 'เรียนฟรี', type: 'boolean', default: false },
            { name: 'level', label: 'ระดับความยาก', type: 'select', options: ['ง่าย', 'ปานกลาง', 'ยาก', 'ทั่วไป'], default: 'ทั่วไป' },
            { name: 'duration', label: 'ระยะเวลาเรียน', type: 'text', help: 'เช่น 2 ชั่วโมง 30 นาที' },
            { name: 'external_url', label: 'ลิงก์ภายนอก (ถ้ามี)', type: 'text' },
            { name: 'status', label: 'สถานะ', type: 'select', options: ['draft', 'published'], default: 'draft' },
            { name: 'featured', label: 'แสดงใน Highlight หน้าแรก', type: 'boolean', default: false },
            { name: 'is_special', label: 'คัดสรรพิเศษ (Highlight of the Month)', type: 'boolean', default: false }
        ]
    },
    tools: { table: 'tools', title: 'จัดการเครื่องมือ (Tools)', hasAdd: true,
        columns: [
            { key: 'thumbnail_url', label: 'รูปภาพ', type: 'image' },
            { key: 'title', label: 'ชื่อเครื่องมือ', type: 'text' },
            { key: 'status', label: 'สถานะ', type: 'status' },
            { key: 'is_special', label: 'คัดสรรพิเศษ', type: 'boolean' }
        ],
        fields: [
            { name: 'title', label: 'ชื่อเครื่องมือ', type: 'text', required: true },
            { name: 'slug', label: 'URL Slug', type: 'text', required: true },
            { name: 'thumbnail_url', label: 'รูปปกเครื่องมือ', type: 'image' },
            { name: 'description', label: 'คำอธิบายเครื่องมือ', type: 'textarea' },
            { name: 'tool_url', label: 'ลิงก์เป้าหมาย', type: 'text' },
            { name: 'status', label: 'สถานะ', type: 'select', options: ['draft', 'published'], default: 'draft' },
            { name: 'featured', label: 'แนะนำ (Featured)', type: 'boolean', default: false },
            { name: 'is_special', label: 'คัดสรรพิเศษ', type: 'boolean', default: false }
        ]
    },
    blog: { table: 'blog_posts', title: 'จัดการบล็อก (Blog)', hasAdd: true,
        columns: [
            { key: 'thumbnail_url', label: 'รูปภาพ', type: 'image' },
            { key: 'title', label: 'หัวข้อบล็อก', type: 'text' },
            { key: 'status', label: 'สถานะ', type: 'status' },
            { key: 'is_special', label: 'คัดสรรพิเศษ', type: 'boolean' }
        ],
        fields: [
            { name: 'title', label: 'หัวข้อบล็อก', type: 'text', required: true },
            { name: 'slug', label: 'URL Slug', type: 'text', required: true },
            { name: 'thumbnail_url', label: 'รูปภาพหน้าปก', type: 'image' },
            { name: 'excerpt', label: 'สไลด์สั้นๆ (Excerpt)', type: 'text' },
            { name: 'content', label: 'เนื้อหาบทความ', type: 'textarea' },
            { name: 'category_id', label: 'หมวดหมู่ (Category)', type: 'category_select', required: true, help: 'ระบบจะดึงหมวดหมู่จากตาราง Categories ให้อัตโนมัติ' },
            { name: 'author', label: 'ผู้เขียน', type: 'text', default: 'CoolCom' },
            { name: 'status', label: 'สถานะ', type: 'select', options: ['draft', 'published'], default: 'draft' },
            { name: 'featured', label: 'แสดงหน้าแรก', type: 'boolean', default: false },
            { name: 'is_special', label: 'คัดสรรพิเศษ', type: 'boolean', default: false }
        ]
    },
    content: { table: 'content_videos', title: 'จัดการวิดีโอเนื้อหา (Content)', hasAdd: true,
        columns: [
            { key: 'thumbnail_url', label: 'รูปภาพ', type: 'image' },
            { key: 'title', label: 'ชื่อวิดีโอ', type: 'text' },
            { key: 'status', label: 'สถานะ', type: 'status' },
            { key: 'is_special', label: 'คัดสรรพิเศษ', type: 'boolean' }
        ],
        fields: [
            { name: 'title', label: 'ชื่อวิดีโอ', type: 'text', required: true },
            { name: 'slug', label: 'URL Slug', type: 'text', required: true },
            { name: 'thumbnail_url', label: 'รูปหน้าปก', type: 'image' },
            { name: 'description', label: 'อธิบายวิดีโอ', type: 'textarea' },
            { name: 'youtube_url', label: 'ลิงก์ Youtube', type: 'text', required: true },
            { name: 'youtube_id', label: 'รหัสวิดีโอ Youtube (เช่น uK9pP7V0u6E)', type: 'text' },
            { name: 'status', label: 'สถานะ', type: 'select', options: ['draft', 'published'], default: 'draft' },
            { name: 'featured', label: 'แสดงหน้าแรก', type: 'boolean', default: false },
            { name: 'is_special', label: 'คัดสรรพิเศษ', type: 'boolean', default: false }
        ]
    },
    shop: { table: 'products', title: 'จัดการสินค้า (Shop)', hasAdd: true,
        columns: [
            { key: 'thumbnail_url', label: 'รูปภาพ', type: 'image' },
            { key: 'title', label: 'ชื่อสินค้า', type: 'text' },
            { key: 'price', label: 'ราคา', type: 'text' },
            { key: 'status', label: 'สถานะ', type: 'status' },
            { key: 'is_special', label: 'คัดสรรพิเศษ', type: 'boolean' }
        ],
        fields: [
            { name: 'title', label: 'ชื่อสินค้า', type: 'text', required: true },
            { name: 'slug', label: 'URL Slug', type: 'text', required: true },
            { name: 'thumbnail_url', label: 'รูปหน้าปก', type: 'image' },
            { name: 'short_description', label: 'คำอธิบายสั้นๆ', type: 'text' },
            { name: 'description', label: 'รายละเอียดสินค้า', type: 'textarea' },
            { name: 'price', label: 'ราคา', type: 'number', default: 0 },
            { name: 'sale_price', label: 'ราคาโปรโมชัน (ถ้ามี)', type: 'number' },
            { name: 'payment_url', label: 'ลิงก์จ่ายเงิน', type: 'text' },
            { name: 'status', label: 'สถานะ', type: 'select', options: ['draft', 'published'], default: 'draft' },
            { name: 'featured', label: 'แนะนำ', type: 'boolean', default: false },
            { name: 'is_special', label: 'คัดสรรพิเศษ', type: 'boolean', default: false }
        ]
    },
    categories: { table: 'categories', title: 'จัดการหมวดหมู่ (Categories)', hasAdd: true,
        columns: [
            { key: 'name', label: 'ชื่อหมวดหมู่', type: 'text' },
            { key: 'slug', label: 'URL Slug', type: 'text' },
            { key: 'type', label: 'ประเภทข้อมูล', type: 'text' }
        ],
        fields: [
            { name: 'name', label: 'ชื่อหมวดหมู่', type: 'text', required: true },
            { name: 'slug', label: 'URL Slug', type: 'text', required: true },
            { name: 'type', label: 'ประเภท', type: 'select', options: ['course', 'tool', 'blog', 'content', 'product'], default: 'course' },
            { name: 'description', label: 'คำอธิบาย', type: 'text' }
        ]
    },
    announcements: { table: 'announcements', title: 'ระบบแจ้งข่าวสาร Popup (Announcements)', hasAdd: true,
        columns: [
            { key: 'image_url', label: 'รูปภาพ Popup', type: 'image' },
            { key: 'title', label: 'หัวข้อข่าว/คำอธิบาย', type: 'text' },
            { key: 'is_active', label: 'เปิดใช้งาน', type: 'boolean' }
        ],
        fields: [
            { name: 'title', label: 'หัวข้อประกาศ', type: 'text', required: true },
            { name: 'description', label: 'คำอธิบาย', type: 'textarea' },
            { name: 'image_url', label: 'รูปภาพโปรโมท', type: 'image' },
            { name: 'link_url', label: 'ลิงก์ปลายทาง (ถ้ามี)', type: 'text' },
            { name: 'is_active', label: 'เปิดใช้งาน (แสดงชิ้นแรกที่เจอ)', type: 'boolean', default: false }
        ]
    }
};

async function init() {
    currentUser = await checkAdminAuth();
    if (!currentUser) return;

    // Sidebar navigation Event Listeners
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(el => {
        el.addEventListener('click', (e) => {
            if(el.id === 'logout-btn' || el.getAttribute('target') === '_blank') return;
            e.preventDefault();
            document.querySelectorAll('.sidebar-nav .nav-item').forEach(n => n.classList.remove('active'));
            el.classList.add('active');
            const page = el.dataset.page;
            loadPage(page);
        });
    });


    // Add button Event Listener
    document.getElementById('add-new-btn').addEventListener('click', () => {
        openFormModal(pagesConfig[currentPage], null, () => loadPage(currentPage));
    });

    // Load initial page
    loadPage('dashboard');
}

async function loadPage(page) {
    currentPage = page;
    const config = pagesConfig[page];
    document.getElementById('page-title-text').textContent = config.title;
    
    const addBtn = document.getElementById('add-new-btn');
    if (config.hasAdd) {
        addBtn.style.display = 'inline-block';
    } else {
        addBtn.style.display = 'none';
    }

    const pageBody = document.getElementById('page-body');
    pageBody.innerHTML = `
        <div style="text-align: center; padding: 3rem;">
            <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; color: var(--admin-primary); margin-bottom: 1rem;"></i>
            <p style="color: var(--admin-text-muted);">กำลังโหลดข้อมูล...</p>
        </div>
    `;

    if (page === 'dashboard') {
        pageBody.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-top: 2rem;">
                <div style="background: var(--admin-surface); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--admin-border); transition: transform 0.2s; cursor: pointer;" onclick="document.querySelector('[data-page=courses]').click()">
                    <h3 style="margin-top:0; color:var(--admin-primary); font-size: 1.2rem;"><i class="fa-solid fa-graduation-cap"></i> Courses</h3>
                    <p style="color: var(--admin-text-muted); font-size: 0.9rem;">จัดการคอร์สเรียนทั้งหมดในระบบ เปิดหรือปิดการแสดงผลได้ทันที</p>
                </div>
                <div style="background: var(--admin-surface); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--admin-border); transition: transform 0.2s; cursor: pointer;" onclick="document.querySelector('[data-page=announcements]').click()">
                    <h3 style="margin-top:0; color:var(--admin-primary); font-size: 1.2rem;"><i class="fa-solid fa-bullhorn"></i> Popup Announcements</h3>
                    <p style="color: var(--admin-text-muted); font-size: 0.9rem;">สร้างหรือแก้ไขรูปภาพโปรโมท และแจ้งข่าวสารขึ้นหน้าแรกสำหรับผู้เข้าใหม่</p>
                </div>
                <!-- สามารถเพิ่ม Widget ดูสถิติ สรุปต่างๆ ได้ที่นี่ -->
            </div>
            
            <div style="margin-top: 3rem; background: #f8fafc; border: 1px solid var(--admin-border); padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                <h3 style="color: var(--admin-text); margin-top:0;"><i class="fa-solid fa-bolt" style="color:var(--admin-primary);"></i> ภาพรวมระบบ</h3>
                <p style="color: var(--admin-text-muted); font-size: 0.95rem; line-height: 1.6;">
                    ยินดีต้อนรับสู่แผงควบคุมหลักสำหรับการจัดการเนื้อหาภายในเว็บไซต์ CoolCom การเปลี่ยนแปลงข้อมูลในหน้าแอดมินนี้จะไปปรากฏที่หน้าหลักแบบทันที (Real-Time) ตรวจสอบให้แน่ใจว่าสถานะของสิ่งที่คุณเพิ่มเป็น <strong>Published</strong> เพื่อให้ผู้เข้าชมมองเห็น
                </p>
            </div>
        `;
        return;
    }

    // List view via Table
    if (config.table) {
        const data = await fetchTableData(config.table);
        renderTable(pageBody, config, data);

        // Bind delete action
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = btn.dataset.id;
                const success = await deleteRecord(config.table, id);
                if (success) {
                    loadPage(currentPage); // reload Table
                }
            });
        });

        // Bind edit action
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = btn.dataset.id;
                const record = data.find(r => r.id === id);
                if(record) {
                    import('./crud.js').then(module => {
                        module.openFormModal(config, record, () => loadPage(currentPage));
                    });
                }
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', init);
