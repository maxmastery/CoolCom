function injectFooter() {
    const footerHTML = `
        <footer class="site-footer">
            <div class="footer-container">
                <div class="footer-top new-footer-top">
                    <div class="footer-brand left-brand">
                        <div class="footer-logo">
                            <img src="https://drive.google.com/thumbnail?id=1bqWEpExI8Dzxp8PE1XaRhVqme_tpTEYA&sz=w400" alt="Cool Com Logo" class="footer-logo-img">
                        </div>
                        <p class="footer-desc">
                            พื้นที่สำหรับแบ่งปันสิ่งดี ๆ<br>สำหรับครูไทยทุกคน
                        </p>
                        <div class="footer-social-circles">
                            <a href="https://www.facebook.com/profile.php?id=61572070237617" target="_blank" rel="noopener noreferrer" title="Facebook"><i class="fa-brands fa-facebook"></i></a>
                            <a class="footer-social-disabled" aria-disabled="true" title="Instagram (Coming Soon)"><i class="fa-brands fa-instagram"></i></a>
                            <a class="footer-social-disabled" aria-disabled="true" title="YouTube (Coming Soon)"><i class="fa-brands fa-youtube"></i></a>
                        </div>
                    </div>

                    <div class="footer-links-grid right-links">
                        <div class="footer-col">
                            <h4 class="footer-col-title">Quick links</h4>
                            <ul>
                                <li><a href="courses.html">Courses</a></li>
                                <li><a href="tools.html">Tools</a></li>
                                <li><a href="blog.html">Blog</a></li>
                                <li><a href="content.html">Content</a></li>
                            </ul>
                        </div>
                        <div class="footer-col">
                            <h4 class="footer-col-title">Other pages</h4>
                            <ul>
                                <li><a href="about.html">About us</a></li>
                                <li><a href="contact.html">Contact us</a></li>
                                <li><a href="shop.html">Cool Shop</a></li>
                            </ul>
                        </div>
                        <div class="footer-col">
                            <h4 class="footer-col-title">Other Information</h4>
                            <ul>
                                <li class="footer-text-li">contact@coolcom.click</li>
                                <li class="footer-text-li">Buriram Thaniland</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="footer-bottom new-footer-bottom">
                    <div class="footer-copyright">
                        &copy; 2026 <strong>Cool Com</strong> All Rights Reserved.
                    </div>
                    <div class="visitor-counter centered-visitor">
                        <div class="stat-group-pill">
                            <span class="visitor-label-pill">VISITORS</span>
                            <span class="visitor-count-pill" id="stat-visitors">...</span>
                        </div>
                    </div>
                    <div class="footer-credits">
                        <span class="made-in">Made in <strong>Thailand</strong></span>
                        <span class="made-sep">&mdash;</span>
                        <span class="made-by">Made by <img
                                src="https://ui-avatars.com/api/?name=C+C&background=random&rounded=true" width="20"
                                height="20" class="avatar-img" alt="avatar"> <strong>Cool Com Team</strong></span>
                        <span class="made-sep">&mdash;</span>
                        <span class="admin-link"><a href="admin/login.html" style="color: var(--text-light); text-decoration: none; font-size: 0.8rem;"><i class="fa-solid fa-lock"></i> Admin</a></span>
                    </div>
                </div>
            </div>
        </footer>
    `;

    let footer = document.querySelector('footer.site-footer');

    if (!footer) {
        footer = document.createElement('div');
        footer.id = 'footer-container';
        document.body.appendChild(footer);
        footer.innerHTML = footerHTML;
        return;
    }

    footer.outerHTML = footerHTML;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectFooter);
} else {
    injectFooter();
}
