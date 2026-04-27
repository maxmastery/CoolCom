import { supabase } from '../js/supabaseClient.js';

export async function fetchTableData(tableName) {
    const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false });
        
    if (error) {
        console.error(`Error fetching ${tableName}:`, error);
        return [];
    }
    return data;
}

export async function deleteRecord(tableName, id) {
    if(confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้? (การลบไม่สามารถกู้คืนได้)')) {
        const { error } = await supabase.from(tableName).delete().eq('id', id);
        if(error) {
            alert('ลบไม่สำเร็จ: ' + error.message);
            return false;
        }
        return true;
    }
    return false;
}

// Function to render generic table
export function renderTable(container, config, data) {
    if(!data || data.length === 0) {
        container.innerHTML = '<p style="color:var(--admin-text-muted); text-align: center; padding: 2rem; background: rgba(0,0,0,0.2); border-radius: 8px;">ยังไม่มีข้อมูล กดปุ่ม <strong style="color:var(--admin-primary)">เพิ่มข้อมูล</strong> ด้านบนขวาเพื่อเริ่มต้น</p>';
        return;
    }

    let html = `
    <div class="table-container">
        <table class="admin-table">
            <thead>
                <tr>
                    ${config.columns.map(c => `<th>${c.label}</th>`).join('')}
                    <th style="width: 100px; text-align:right;">จัดการ</th>
                </tr>
            </thead>
            <tbody>
    `;

    data.forEach(row => {
        html += `<tr>`;
        config.columns.forEach(c => {
            let val = row[c.key];
            if(c.type === 'image') {
                html += `<td>${val ? `<img src="${val}" width="60" height="40" style="border-radius:4px; object-fit:cover;">` : '-'}</td>`;
            } else if(c.type === 'status') {
                const badgeClass = val === 'published' ? 'status-published' : 'status-draft';
                const showText = val === 'published' ? 'เผยแพร่แล้ว' : 'แบบร่าง';
                html += `<td><span class="status-badge ${badgeClass}">${showText}</span></td>`;
            } else if(c.type === 'boolean') {
                html += `<td>${val ? '<span style="color:#10b981;">✅ เปิดใช้งาน</span>' : '<span style="color:#ef4444;">❌ ปิด</span>'}</td>`;
            } else {
                html += `<td>${val || '-'}</td>`;
            }
        });
        
        html += `
            <td style="text-align:right;">
                <div class="action-btns">
                    <button class="edit-btn" data-id="${row.id}" title="แก้ไข"><i class="fa-solid fa-pen"></i></button>
                    <button class="delete-btn" data-id="${row.id}" title="ลบ"><i class="fa-solid fa-trash"></i></button>
                </div>
            </td>
        </tr>`;
    });

    html += `</tbody></table></div>`;
    container.innerHTML = html;
}

import { uploadImage } from './upload.js';

export async function openFormModal(config, defaultData = null, onSuccess = null) {
    // Check if we need to fetch categories
    let categories = [];
    const hasCategoryField = config.fields && config.fields.some(f => f.type === 'category_select');
    if (hasCategoryField) {
        try {
            const { data } = await supabase.from('categories').select('id, name');
            if (data) categories = data;
        } catch (e) {
            console.error("Failed to fetch categories", e);
        }
    }

    // 1. Create Modal Container
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'admin-modal-overlay';
    
    let isEdit = !!defaultData;
    let title = isEdit ? `แก้ไข ${config.title}` : `เพิ่ม ${config.title} ใหม่`;
    
    // 2. Build Form HTML dynamically based on config.fields
    let formHtml = `<form id="admin-dynamic-form" class="admin-dynamic-form">`;
    
    if (config.fields) {
        config.fields.forEach(field => {
            const val = (defaultData && defaultData[field.name] !== undefined) ? defaultData[field.name] : (field.default !== undefined ? field.default : '');
            
            formHtml += `<div class="form-group">`;
            formHtml += `<label>${field.label} ${field.required ? '<span style="color:var(--admin-danger)">*</span>' : ''}</label>`;
            
            if (field.type === 'textarea') {
                formHtml += `<textarea name="${field.name}" ${field.required?'required':''} rows="4" class="form-control" style="resize:vertical;">${val}</textarea>`;
            } else if (field.type === 'select') {
                formHtml += `<select name="${field.name}" class="form-control" ${field.required?'required':''}>`;
                field.options.forEach(opt => {
                    formHtml += `<option value="${opt}" ${val === opt ? 'selected' : ''}>${opt}</option>`;
                });
                formHtml += `</select>`;
            } else if (field.type === 'category_select') {
                formHtml += `<select name="${field.name}" class="form-control" ${field.required?'required':''}>`;
                if(categories.length === 0) {
                    formHtml += `<option value="">-- ไม่พบหมวดหมู่ (โปรดสร้างในหน้า Categories ก่อน) --</option>`;
                } else {
                    categories.forEach(cat => {
                        formHtml += `<option value="${cat.id}" ${val === cat.id ? 'selected' : ''}>${cat.name}</option>`;
                    });
                }
                formHtml += `</select>`;
            } else if (field.type === 'boolean') {
                formHtml += `
                    <label class="toggle-switch">
                        <input type="checkbox" name="${field.name}" ${val ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                        <span style="display:inline-block; margin-left: 10px; font-weight: normal; font-size:0.9rem;">เปิดใช้งาน / ใช่</span>
                    </label>
                `;
            } else if (field.type === 'image') {
                formHtml += `
                    <input type="file" id="file-${field.name}" accept="image/*" class="form-control file-input-mock">
                    <input type="hidden" name="${field.name}" value="${val}">
                    ${val ? `<div style="margin-top:10px;"><img src="${val}" style="max-width:200px; border-radius:8px; border:1px solid var(--admin-border);"></div>` : ''}
                `;
            } else {
                // text, number, email, etc.
                const inputType = field.type || 'text';
                formHtml += `<input type="${inputType}" name="${field.name}" value="${val}" class="form-control" ${field.required?'required':''}>`;
            }
            
            if (field.help) {
                formHtml += `<small style="color:var(--admin-text-muted); display:block; margin-top:4px;">${field.help}</small>`;
            }
            
            formHtml += `</div>`;
        });
    } else {
        formHtml += `<p>ไม่พบการตั้งค่าฟอร์มสำหรับตารางนี้ โปรดแก้ไขผ่าน Supabase โดยตรง</p>`;
    }

    formHtml += `
            <div class="form-actions" style="margin-top: 2rem; display: flex; justify-content: flex-end; gap: 1rem;">
                <button type="button" class="btn btn-outline" id="btn-cancel-modal">ยกเลิก</button>
                <button type="submit" class="btn btn-primary" id="btn-submit-modal">${isEdit ? 'บันทึกการแก้ไข' : 'เพิ่มข้อมูล'}</button>
            </div>
        </form>
    `;

    // 3. Construct Modal
    modalOverlay.innerHTML = `
        <div class="admin-modal-box">
            <h2 class="admin-modal-title">${title}</h2>
            ${formHtml}
        </div>
    `;
    
    document.body.appendChild(modalOverlay);

    // 4. Bind Events
    const closeModal = () => modalOverlay.remove();
    document.getElementById('btn-cancel-modal').addEventListener('click', closeModal);
    
    const form = document.getElementById('admin-dynamic-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('btn-submit-modal');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> กำลังบันทึก...';
        
        try {
            const formData = new FormData(form);
            const payload = {};
            
            // Process fields and uploads
            for (let field of config.fields) {
                if (field.type === 'image') {
                    const fileInput = document.getElementById(`file-${field.name}`);
                    if (fileInput && fileInput.files.length > 0) {
                        const file = fileInput.files[0];
                        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> กำลังอัปโหลดภาพ...';
                        const uploadedUrl = await uploadImage(file, config.table);
                        if (uploadedUrl) {
                            payload[field.name] = uploadedUrl;
                        } else {
                            throw new Error('อัปโหลดรูปภาพล้มเหลว');
                        }
                    } else {
                        // Keep old value
                        payload[field.name] = formData.get(field.name);
                    }
                } else if (field.type === 'boolean') {
                    payload[field.name] = formData.get(field.name) === 'on';
                } else {
                    let val = formData.get(field.name);
                    if(field.type === 'number') val = val ? Number(val) : null;
                    payload[field.name] = val;
                }
            }

            // Execute DB Operation
            if (isEdit) {
                const { error } = await supabase.from(config.table).update(payload).eq('id', defaultData.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from(config.table).insert([payload]);
                if (error) throw error;
            }
            
            closeModal();
            if(onSuccess) onSuccess();
            
        } catch (err) {
            alert('เกิดข้อผิดพลาด: ' + err.message);
            submitBtn.disabled = false;
            submitBtn.textContent = 'ลองอีกครั้ง';
        }
    });
}
