/**
 * CoolCom Navbar Component
 * Injects the consistent navbar across all pages
 */

function injectNavbar() {
    // Get current page filename for active state
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Determine active state for each link
    const isActive = (page) => currentPage === page ? 'active' : '';
    
    // Create navbar HTML - center aligned links with Cool Shop on right
    const navbarHTML = `
        <nav class="navbar navbar-sticky">
            <a href="index.html" class="logo">
                <span class="logo-text"><span class="logo-cool">Cool</span><span class="logo-com">Com</span></span>
            </a>
            <ul class="nav-links">
                <li><a href="index.html" class="${isActive('index.html')}">Home</a></li>
                <li><a href="courses.html" class="${isActive('courses.html')}">Courses</a></li>
                <li><a href="tools.html" class="${isActive('tools.html')}">Tools</a></li>
                <li><a href="blog.html" class="${isActive('blog.html')}">Blog</a></li>
                <li><a href="content.html" class="${isActive('content.html')}">Content</a></li>
                <li><a href="about.html" class="${isActive('about.html')}">About</a></li>
                <li><a href="contact.html" class="${isActive('contact.html')}">Contact</a></li>
                <li class="nav-shop-mobile">
                    <a href="shop.html" class="btn btn-nav-yellow ${isActive('shop.html') ? 'active-shop' : ''}">
                        <i class="fa-solid fa-cart-shopping"></i> Cool Shop
                    </a>
                </li>
            </ul>
            <div class="nav-right">
                <a href="shop.html" class="btn btn-nav-yellow nav-shop-desktop ${isActive('shop.html') ? 'active-shop' : ''}"><i class="fa-solid fa-cart-shopping"></i> Cool Shop</a>
                <button class="mobile-menu-btn" aria-label="Toggle menu"><i class="fa-solid fa-bars"></i></button>
            </div>
        </nav>
    `;
    
    // Find navbar container or create one
    let container = document.getElementById('navbar-container');
    
    if (!container) {
        // Create container if it doesn't exist
        container = document.createElement('div');
        container.id = 'navbar-container';
        
        // Insert at the beginning of body
        document.body.insertBefore(container, document.body.firstChild);
    }
    
    // Inject the navbar
    container.innerHTML = navbarHTML;
    
    // Add mobile menu functionality
    const mobileBtn = container.querySelector('.mobile-menu-btn');
    const navbar = container.querySelector('.navbar');
    
    if (mobileBtn && navbar) {
        mobileBtn.addEventListener('click', () => {
            navbar.classList.toggle('active');
        });
    }
}

// Initialize navbar when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectNavbar);
} else {
    injectNavbar();
}
