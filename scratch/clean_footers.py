import os
import re

def clean_footer(content):
    # Regex to find <footer class="site-footer">...</footer> across multiple lines
    # Using non-greedy match .*? with DOTALL flag
    pattern = re.compile(r'<footer class="site-footer">.*?</footer>', re.DOTALL)
    return pattern.sub('<footer class="site-footer"></footer>', content)

html_files = [
    'blog.html', 'about.html', 'contact.html', 'courses.html', 
    'blog-post.html', 'course-preview.html', 'shop.html', 
    'tools.html', 'content.html'
]

for filename in html_files:
    if os.path.exists(filename):
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content = clean_footer(content)
        
        # Also ensure visitorTracker.js is included at the end if not present
        if 'js/visitorTracker.js' not in new_content:
            new_content = new_content.replace('</body>', '<script type="module" src="js/visitorTracker.js"></script></body>')
            
        # Ensure footer.js is included
        if 'src="footer.js"' not in new_content:
             new_content = new_content.replace('</body>', '<script src="footer.js"></script>\n</body>')

        with open(filename, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Cleaned {filename}")
