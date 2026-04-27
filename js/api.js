import { supabase } from './supabaseClient.js';

export async function fetchCourses(limit = null) {
  let query = supabase.from('courses')
    .select('*, categories(name, slug)')
    .eq('status', 'published')
    .order('featured', { ascending: false })
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });
    
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) { console.error('fetchCourses error', error); throw error; }
  return data;
}

export async function fetchTools(limit = null) {
  let query = supabase.from('tools')
    .select('*, categories(name, slug)')
    .eq('status', 'published')
    .order('featured', { ascending: false })
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });
    
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) { console.error('fetchTools error', error); throw error; }
  return data;
}

export async function fetchBlogPosts(limit = null) {
  let query = supabase.from('blog_posts')
    .select('*, categories(name, slug)')
    .eq('status', 'published')
    .order('featured', { ascending: false })
    .order('published_at', { ascending: false })
    .order('created_at', { ascending: false });
    
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) { console.error('fetchBlogPosts error', error); throw error; }
  return data;
}

export async function fetchBlogPostBySlug(slug) {
  const { data, error } = await supabase.from('blog_posts')
    .select('*, categories(name, slug)')
    .eq('slug', slug)
    .single();
    
  // Return null if not found
  if (error) { 
      console.error('fetchBlogPostBySlug error', error); 
      return null; 
  }
  return data;
}

export async function fetchContentVideos(limit = null) {
  let query = supabase.from('content_videos')
    .select('*, categories(name, slug)')
    .eq('status', 'published')
    .order('featured', { ascending: false })
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });
    
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) { console.error('fetchContentVideos error', error); throw error; }
  return data;
}

export async function fetchProducts(limit = null) {
  let query = supabase.from('products')
    .select('*, categories(name, slug)')
    .eq('status', 'published')
    .order('featured', { ascending: false })
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });
    
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) { console.error('fetchProducts error', error); throw error; }
  return data;
}

export async function fetchActiveAnnouncements() {
  const { data, error } = await supabase.from('announcements')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
    
  if (error) { console.error('fetchActiveAnnouncements error', error); throw error; }
  return data;
}

export async function fetchHighlightContent() {
  // Try to find any content marked as is_special across different tables
  // Priority: Courses > Blog > Tools > Content > Products
  const tables = ['courses', 'blog_posts', 'tools', 'content_videos', 'products'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table)
        .select('*, categories(name, slug)')
        .eq('status', 'published')
        .eq('is_special', true)
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (data && data.length > 0) {
        return { ...data[0], type: table };
      }
    } catch (e) {
      console.warn(`Error checking special in ${table}`, e);
    }
  }
  
  // Fallback to featured course if no special selection found
  const { data } = await supabase.from('courses')
    .select('*, categories(name, slug)')
    .eq('status', 'published')
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(1);
    
  if (data && data.length > 0) {
    return { ...data[0], type: 'courses' };
  }
  
  return null;
}
