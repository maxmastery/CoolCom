import { supabase } from './supabaseClient.js';

/**
 * Visitor Tracking System
 * Tracks unique visitors and total visits using a persistent visitor_id.
 */

const VISITOR_COOKIE_NAME = 'coolcom_visitor_id';
const LAST_VISIT_SESSION_KEY = 'coolcom_last_visit_recorded';

// Check for valid Supabase key format
setTimeout(() => {
    console.log('%c [CoolCom] Visitor Tracker Initialized ', 'background: #222; color: #bada55; padding: 2px; font-weight: bold;');
    try {
        const key = supabase.supabaseKey;
        if (!key || key.startsWith('sb_publishable') || !key.startsWith('eyJ')) {
            console.error('%c [CoolCom] CRITICAL: Supabase Key in js/supabaseClient.js is INVALID or a placeholder.', 'background: red; color: white; padding: 4px; font-weight: bold;');
            console.warn('Your current key starts with:', key?.substring(0, 15), '... but it should start with "eyJ"');
        } else {
            console.log('[CoolCom] Supabase Key format looks correct.');
        }
    } catch(e) {}
}, 1000);

function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name, value, days = 3650) {
    const expires = new Date(Date.now() + days * 86400000).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

async function trackVisit() {
    console.log('[CoolCom] trackVisit starting...');
    // 1. Get or generate persistent Visitor ID
    let visitorId = getCookie(VISITOR_COOKIE_NAME);
    if (!visitorId) {
        visitorId = crypto.randomUUID();
        setCookie(VISITOR_COOKIE_NAME, visitorId);
    }

    // 2. Prevent counting multiple times in a single session (e.g. refresh)
    // We count a "Visit" as a new row in the DB. 
    // If the user refreshes within a short time, we might want to skip.
    // However, the user wants "Total Visits" vs "Unique Visitors".
    // A refresh is a "Visit", but we can deduplicate Unique Visitors by visitor_id.
    // To avoid spamming on rapid refresh, we'll wait at least 5 minutes before logging the SAME path.
    const now = Date.now();
    const lastVisitData = JSON.parse(sessionStorage.getItem(LAST_VISIT_SESSION_KEY) || '{}');
    const currentPath = window.location.pathname;

    if (lastVisitData.path === currentPath && (now - lastVisitData.time < 300000)) {
        // console.log('Skipping visit log for path (last recorded < 5 mins ago)');
        return;
    }

    // 3. Collect Data
    const visitData = {
        visitor_id: visitorId,
        page_path: currentPath,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent
    };

    // 4. Send to Supabase (RPC)
    try {
        const { error } = await supabase.rpc('track_visitor', {
            p_visitor_id: visitData.visitor_id,
            p_page_path: visitData.page_path,
            p_referrer: visitData.referrer,
            p_user_agent: visitData.user_agent,
            p_ip_address: null
        });

        if (error) throw error;

        // Store last record time in session to avoid double counting on refresh
        sessionStorage.setItem(LAST_VISIT_SESSION_KEY, JSON.stringify({
            path: currentPath,
            time: now
        }));

    } catch (err) {
        console.warn('Visitor tracking failed:', err.message);
        if (err.message.includes('apiKey') || err.message.includes('sb_publishable')) {
            console.error('CRITICAL: Supabase Key seems invalid. Please check js/supabaseClient.js');
        }
    }

    // After tracking attempt, logs are stored
}

/**
 * Update stats displayed in the footer
 */
async function updatePublicStats() {
    let retries = 0;
    const maxRetries = 10;
    
    const tryUpdate = async () => {
        const visitorsEl = document.getElementById('stat-visitors');
        
        if (!visitorsEl) {
            if (retries < maxRetries) {
                retries++;
                console.log(`[CoolCom] Footer stats element not found, retry ${retries}/${maxRetries}...`);
                setTimeout(tryUpdate, 500);
            } else {
                console.warn('[CoolCom] Footer stats element NOT FOUND after maximum retries.');
            }
            return;
        }

        try {
            console.log('[CoolCom] Fetching visitor stats from Supabase...');
            const stats = await getVisitorStats();
            if (stats) {
                console.log('[CoolCom] Stats received:', stats);
                visitorsEl.innerText = (stats.totalUniqueVisitors || 0).toLocaleString();
                // Update other stats if they exist (backward compatibility)
                const todayEl = document.getElementById('stat-today');
                const totalEl = document.getElementById('stat-total');
                if (todayEl) todayEl.innerText = (stats.uniqueVisitorsToday || 0).toLocaleString();
                if (totalEl) totalEl.innerText = (stats.totalVisits || 0).toLocaleString();
                console.log('[CoolCom] Visitor count UI updated.');
            } else {
                visitorsEl.innerText = '0';
                console.warn('[CoolCom] Failed to fetch visitor stats (RPC returned null or empty)');
            }
        } catch (err) {
            visitorsEl.innerText = '0';
            console.error('[CoolCom] Error updating public stats:', err.message);
        }
    };

    tryUpdate();
}

// Execute on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        trackVisit();
        updatePublicStats();
    });
} else {
    trackVisit();
    updatePublicStats();
}

/**
 * Fetch Stats for Public Display
 */
export async function getVisitorStats() {
    try {
        const { data, error } = await supabase.rpc('get_public_visitor_stats');
        
        if (error) {
            console.error('RPC Error (get_public_visitor_stats):', error.message, error.details, error.hint);
            throw error;
        }

        if (!data) {
            return {
                totalVisits: 0,
                todayVisits: 0,
                uniqueVisitorsToday: 0,
                totalUniqueVisitors: 0
            };
        }

        return {
            totalVisits: data.total_visits || 0,
            todayVisits: data.today_visits || 0,
            uniqueVisitorsToday: data.today_unique_visitors || 0,
            totalUniqueVisitors: data.total_unique_visitors || 0
        };
    } catch (err) {
        console.error('getVisitorStats exception:', err);
        return null;
    }
}
