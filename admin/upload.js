import { supabase } from '../js/supabaseClient.js';

export async function uploadImage(file, folder = 'general') {
    if (!file) return null;
    
    // Create random string to avoid duplicate names and handling weird characters
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('coolcom-media')
        .upload(filePath, file);

    if (uploadError) {
        console.error('Upload Error:', uploadError);
        alert('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ: ' + uploadError.message);
        return null;
    }

    // Get public URL
    const { data } = supabase.storage
        .from('coolcom-media')
        .getPublicUrl(filePath);

    return data.publicUrl;
}
