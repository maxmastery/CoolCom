import os
import re

new_favicon_url = "https://kdeiauloliuojwadbzfd.supabase.co/storage/v1/object/public/coolcom-media/CoolCom%20media/Coolcom%20favicon.png"
new_tag = f'<link rel="icon" type="image/png" href="{new_favicon_url}">'

def update_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Pattern to find existing favicon link (handling potential newlines and single/double quotes)
        # Also handle potential multiline link tags
        pattern = re.compile(r'<link[^>]*rel=["\']icon["\'][^>]*>', re.IGNORECASE | re.DOTALL)
        
        if pattern.search(content):
            # Replace existing tag(s)
            new_content = pattern.sub(new_tag, content)
            # print(f"Updated favicon in {filepath}")
        else:
            # Add before </head>
            if '</head>' in content:
                new_content = content.replace('</head>', f'    {new_tag}\n</head>')
                # print(f"Added favicon to {filepath}")
            else:
                # print(f"No </head> tag found in {filepath}, skipping.")
                return

        if content != new_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Processed: {filepath}")
    except Exception as e:
        print(f"Error processing {filepath}: {e}")

# Walk through all directories, skipping .gemini and node_modules
for root, dirs, files in os.walk('.'):
    # Exclude directories
    dirs[:] = [d for d in dirs if d not in ['.gemini', 'node_modules', '.git']]
    
    for file in files:
        if file.endswith('.html'):
            update_file(os.path.join(root, file))
