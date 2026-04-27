import { supabase } from '../js/supabaseClient.js';

export async function checkAdminAuth() {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
        window.location.href = 'login.html';
        return null;
    }

    // Check role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
        
    if (!profile || profile.role !== 'admin') {
        alert('You do not have admin access.');
        await supabase.auth.signOut();
        window.location.href = 'login.html';
        return null;
    }

    // Setup logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await supabase.auth.signOut();
            window.location.href = 'login.html';
        });
    }

    return session.user;
}
