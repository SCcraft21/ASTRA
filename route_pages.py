import os
import re

src_dir = r"c:\Users\User\OneDrive\Desktop\stitch_astra_intelligent_conversation_canvas"
dest_dir = r"c:\Users\User\OneDrive\Desktop\ASTRA\pages"

os.makedirs(dest_dir, exist_ok=True)

mapping = {
    "astra_intro_hero_experience": "hero.html",
    "astra_intro_capabilities_overview": "capabilities.html",
    "astra_intro_deep_memory": "deep_memory.html",
    "astra_intro_final_threshold": "final_threshold.html",
    "astra_registration": "registration.html",
    "astra_login": "login.html",
    "astra_developer_access": "developer.html",
    "ambient_intelligence": "ambient.html"
}

link_mapping = {
    "Features": "/capabilities",
    "Ethics": "/threshold",
    "Developers": "/developer",
    "Developer Sandbox": "/developer",
    "Sign In": "/login",
    "Sign in": "/login",
    "Get Started": "/register",
    "Create an account": "/register",
    "Overview": "/",
    "Memory": "/memory",
    "Docs": "/developer",
    "New Session": "/chat",
    "ASTRA": "/"
}

for folder, filename in mapping.items():
    src_file = os.path.join(src_dir, folder, "code.html")
    dest_file = os.path.join(dest_dir, filename)
    if os.path.exists(src_file):
        with open(src_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace href="#" with something default just in case
        # content = content.replace('href="#"', 'href="/"')
        
        # We want to replace href="#" with href="<link>" where the anchor text contains a keyword
        def replace_link(match):
            attrs = match.group(1)
            text = match.group(2)
            
            new_href = "/"
            for key, val in link_mapping.items():
                if key in text:
                    new_href = val
                    break
            
            # replace href="#" with href="new_href" inside attrs
            new_attrs = re.sub(r'href="[^"]*"', f'href="{new_href}"', attrs)
            if 'href=' not in new_attrs:
                # If there's no href but it's an a or button, maybe we don't do anything
                pass
                
            return f'<{new_attrs}>{text}'
            
        # Match <a ...>text</a> or <button ...>text</button>
        # This is a simple regex that might fail on nested tags but works for simple prototypes
        content = re.sub(r'<([ab][^>]+)>([^<]+)', replace_link, content)
        
        # for buttons that use onclick or need to be a tags:
        # Actually it's easier to just do string replacement on the href if it's on the same line.
        # But let's just write this to file and test.
        
        with open(dest_file, 'w', encoding='utf-8') as f:
            f.write(content)

print("Files copied to pages/")
