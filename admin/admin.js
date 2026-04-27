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
    },
    visitors: { title: 'Visitor Dashboard (สถิติผู้เข้าชม)', hasAdd: false }
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
        renderMainDashboard(pageBody);
        return;
    }

    if (page === 'visitors') {
        renderVisitorDashboard(pageBody);
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

async function renderMainDashboard(container) {
    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-top: 2rem;">
            <div style="background: var(--admin-surface); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--admin-border); transition: transform 0.2s; cursor: pointer;" onclick="document.querySelector('[data-page=courses]').click()">
                <h3 style="margin-top:0; color:var(--admin-primary); font-size: 1.2rem;"><i class="fa-solid fa-graduation-cap"></i> Courses</h3>
                <p style="color: var(--admin-text-muted); font-size: 0.9rem;">จัดการคอร์สเรียนทั้งหมดในระบบ เปิดหรือปิดการแสดงผลได้ทันที</p>
            </div>
            <div style="background: var(--admin-surface); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--admin-border); transition: transform 0.2s; cursor: pointer;" onclick="document.querySelector('[data-page=visitors]').click()">
                <h3 style="margin-top:0; color:var(--admin-primary); font-size: 1.2rem;"><i class="fa-solid fa-chart-line"></i> Visitors Statistics</h3>
                <p style="color: var(--admin-text-muted); font-size: 0.9rem;">ดูสถิติผู้เข้าชมเว็บไซต์ย้อนหลัง ข้อมูลการเข้าชม และหน้าเว็บยอดนิยม</p>
            </div>
            <div style="background: var(--admin-surface); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--admin-border); transition: transform 0.2s; cursor: pointer;" onclick="document.querySelector('[data-page=announcements]').click()">
                <h3 style="margin-top:0; color:var(--admin-primary); font-size: 1.2rem;"><i class="fa-solid fa-bullhorn"></i> Popup Announcements</h3>
                <p style="color: var(--admin-text-muted); font-size: 0.9rem;">สร้างหรือแก้ไขรูปภาพโปรโมท และแจ้งข่าวสารขึ้นหน้าแรกสำหรับผู้เข้าใหม่</p>
            </div>
        </div>
        
        <div style="margin-top: 3rem; background: #f8fafc; border: 1px solid var(--admin-border); padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
            <h3 style="color: var(--admin-text); margin-top:0;"><i class="fa-solid fa-bolt" style="color:var(--admin-primary);"></i> ภาพรวมระบบ</h3>
            <p style="color: var(--admin-text-muted); font-size: 0.95rem; line-height: 1.6;">
                ยินดีต้อนรับสู่แผงควบคุมหลักสำหรับการจัดการเนื้อหาภายในเว็บไซต์ CoolCom การเปลี่ยนแปลงข้อมูลในหน้าแอดมินนี้จะไปปรากฏที่หน้าหลักแบบทันที (Real-Time) ตรวจสอบให้แน่ใจว่าสถานะของสิ่งที่คุณเพิ่มเป็น <strong>Published</strong> เพื่อให้ผู้เข้าชมมองเห็น
            </p>
        </div>
    `;
}

async function renderVisitorDashboard(container) {
    container.innerHTML = `
        <div class="visitor-dashboard">
            <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                <div class="stat-card" style="background: #fff; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid #eef2f6;">
                    <span style="color: #64748b; font-size: 0.85rem; font-weight: 600;">ผู้เข้าชมทั้งหมด (Unique)</span>
                    <h2 id="total-unique-val" style="margin: 0.5rem 0 0; font-size: 2rem;">...</h2>
                </div>
                <div class="stat-card" style="background: #fff; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid #eef2f6;">
                    <span style="color: #64748b; font-size: 0.85rem; font-weight: 600;">การเข้าชมทั้งหมด (Total Visits)</span>
                    <h2 id="total-visits-val" style="margin: 0.5rem 0 0; font-size: 2rem;">...</h2>
                </div>
                <div class="stat-card" style="background: #fff; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid #eef2f6;">
                    <span style="color: #64748b; font-size: 0.85rem; font-weight: 600;">ผู้เข้าชมวันนี้</span>
                    <h2 id="today-visitors-val" style="margin: 0.5rem 0 0; font-size: 2rem; color: #10b981;">...</h2>
                </div>
                <div class="stat-card" style="background: #fff; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid #eef2f6;">
                    <span style="color: #64748b; font-size: 0.85rem; font-weight: 600;">7 วันที่ผ่านมา</span>
                    <h2 id="week-visitors-val" style="margin: 0.5rem 0 0; font-size: 2rem;">...</h2>
                </div>
            </div>

            <div style="background: #fff; padding: 1.5rem; border-radius: 12px; border: 1px solid #eef2f6; margin-bottom: 2rem;">
                <h3 style="margin-top: 0; font-size: 1.1rem; margin-bottom: 1.5rem;">สถิติการเข้าชม 7 วันล่าสุด</h3>
                <canvas id="visitorChart" height="100"></canvas>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 2rem;">
                <div style="background: #fff; padding: 1.5rem; border-radius: 12px; border: 1px solid #eef2f6;">
                    <h3 style="margin-top: 0; font-size: 1.1rem; margin-bottom: 1.5rem;">หน้าที่มีคนเข้าชมมากที่สุด</h3>
                    <div id="top-pages-list">
                        <p style="color: #64748b;">กำลังโหลดข้อมูล...</p>
                    </div>
                </div>
                <div style="background: #fff; padding: 1.5rem; border-radius: 12px; border: 1px solid #eef2f6;">
                    <h3 style="margin-top: 0; font-size: 1.1rem; margin-bottom: 1.5rem;">รายการเข้าชมล่าสุด</h3>
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
                            <thead>
                                <tr style="border-bottom: 2px solid #f1f5f9; text-align: left; color: #64748b;">
                                    <th style="padding: 0.75rem 0.5rem;">เวลา</th>
                                    <th style="padding: 0.75rem 0.5rem;">Page Path</th>
                                    <th style="padding: 0.75rem 0.5rem;">Device/OS</th>
                                </tr>
                            </thead>
                            <tbody id="latest-visits-tbody">
                                <tr><td colspan="3" style="padding: 2rem; text-align: center; color: #64748b;">กำลังโหลดข้อมูล...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Fetch and Populate Data
    try {
        const { data, error } = await supabase.rpc('get_admin_visitor_dashboard');
        if (error) throw error;

        document.getElementById('total-visits-val').innerText = (data?.total_visits || 0).toLocaleString();
        document.getElementById('total-unique-val').innerText = (data?.total_unique_visitors || 0).toLocaleString();
        document.getElementById('today-visitors-val').innerText = (data?.today_unique_visitors || 0).toLocaleString();
        document.getElementById('week-visitors-val').innerText = (data?.week_unique_visitors || 0).toLocaleString();

        // 2. Top Pages
        const pagesList = document.getElementById('top-pages-list');
        const topPages = Array.isArray(data?.top_pages) ? data.top_pages : [];
        pagesList.innerHTML = topPages.length ? topPages.map(p => `
            <div style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #f1f5f9;">
                <span style="color: #1e293b; font-family: monospace; font-size: 0.8rem;">${p.page_path}</span>
                <span style="font-weight: 700; color: var(--admin-primary);">${p.visit_count} ครั้ง</span>
            </div>
        `).join('') : '<p style="color:#64748b;">ไม่มีข้อมูล</p>';

        // 3. Latest Visits
        const latest = Array.isArray(data?.latest_visits) ? data.latest_visits : [];
        const latestTbody = document.getElementById('latest-visits-tbody');
        latestTbody.innerHTML = latest.length ? latest.map(v => {
            const date = new Date(v.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
            let device = 'Desktop';
            if (/Mobi|Android/i.test(v.user_agent || '')) device = 'Mobile';

            return `
                <tr style="border-bottom: 1px solid #f8fafc;">
                    <td style="padding: 0.75rem 0.5rem;">${date}</td>
                    <td style="padding: 0.75rem 0.5rem; color: #64748b; font-family: monospace;">${v.page_path}</td>
                    <td style="padding: 0.75rem 0.5rem;"><span style="background: #f1f5f9; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">${device}</span></td>
                </tr>
            `;
        }).join('') : '<tr><td colspan="3" style="padding: 2rem; text-align: center; color: #64748b;">ไม่มีข้อมูล</td></tr>';

        // 4. Chart
        render7DayChart(Array.isArray(data?.daily_last_7_days) ? data.daily_last_7_days : []);

    } catch (err) {
        console.error('Visitor Dashboard Load Error:', err);
        container.innerHTML += `<p style="color: #ef4444; padding: 1rem;">เกิดข้อผิดพลาดในการดึงข้อมูล: ${err.message}</p>`;
    }
}

function render7DayChart(data) {
    const canvas = document.getElementById('visitorChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const dayCounts = {};
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const label = d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
        days.push(label);
        dayCounts[label] = 0;
    }

    data.forEach(v => {
        const label = new Date(v.visit_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
        if (dayCounts[label] !== undefined) dayCounts[label] = Number(v.total_visits) || 0;
    });

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: days,
            datasets: [{
                label: 'จำนวนการเข้าชม (Visits)',
                data: days.map(d => dayCounts[d]),
                borderColor: '#FFC300',
                backgroundColor: 'rgba(255, 195, 0, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointBackgroundColor: '#FFC300'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { borderDash: [5, 5], color: '#f1f5f9' } },
                x: { grid: { display: false } }
            }
        }
    });
}
