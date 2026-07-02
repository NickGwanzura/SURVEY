import os
from PIL import Image, ImageDraw, ImageFont

# Colors
BG_COLOR = (13, 79, 60, 255) # #0d4f3c
CIRCLE_COLOR = (16, 185, 129, int(255 * 0.18)) # #10b981 with 18% opacity
TEXT_COLOR = (255, 255, 255, 255)
TEXT_SUB_COLOR = (255, 255, 255, int(255 * 0.85))

# Font paths
HELVETICA_PATH = "/System/Library/Fonts/Helvetica.ttc"

def generate_base_icon():
    # Create high-res 512x512 RGBA image
    size = 512
    img = Image.new("RGBA", (size, size), BG_COLOR)
    draw = ImageDraw.Draw(img)
    
    # Draw circle
    cx, cy = 256, 230.4
    r = 215.04
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=CIRCLE_COLOR)
    
    # Load fonts
    try:
        font_rac = ImageFont.truetype(HELVETICA_PATH, 163, index=1) # Helvetica Bold
    except Exception:
        font_rac = ImageFont.load_default()
        
    try:
        font_zim = ImageFont.truetype(HELVETICA_PATH, 54, index=0) # Helvetica Regular
    except Exception:
        font_zim = ImageFont.load_default()
        
    # Draw centered text "RAC"
    draw.text((256, 235), "RAC", fill=TEXT_COLOR, font=font_rac, anchor="mm")
    
    # Draw centered text "ZIMBABWE"
    draw.text((256, 345), "ZIMBABWE", fill=TEXT_SUB_COLOR, font=font_zim, anchor="mm")
    
    return img

if __name__ == "__main__":
    print("Generating assets...")
    
    # 1. Generate base 512px icon
    base_img = generate_base_icon()
    
    # Save 512px icons
    base_img.save("public/icons/icon-512.png", "PNG")
    base_img.save("public/icons/icon-maskable-512.png", "PNG")
    print("Saved 512px icons.")

    # 2. Resize for 192px icons
    img_192 = base_img.resize((192, 192), Image.Resampling.LANCZOS)
    img_192.save("public/icons/icon-192.png", "PNG")
    img_192.save("public/icons/icon-maskable-192.png", "PNG")
    print("Saved 192px icons.")
    
    # 3. Resize for Apple Touch Icon (180x180)
    img_180 = base_img.resize((180, 180), Image.Resampling.LANCZOS)
    img_180.save("public/apple-touch-icon.png", "PNG")
    print("Saved apple-touch-icon.png (180px).")
    
    # 4. Resize for Favicon (16x16, 32x32, 48x48)
    img_16 = base_img.resize((16, 16), Image.Resampling.LANCZOS)
    img_32 = base_img.resize((32, 32), Image.Resampling.LANCZOS)
    img_48 = base_img.resize((48, 48), Image.Resampling.LANCZOS)
    
    # Save multi-resolution ICO file
    img_32.save(
        "public/favicon.ico",
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
        append_images=[img_16, img_48]
    )
    print("Saved favicon.ico with resolutions 16x16, 32x32, 48x48.")
    
    # Clean up temporary test files if they exist
    if os.path.exists("public/current_favicon.png"):
        os.remove("public/current_favicon.png")
    if os.path.exists("public/test_favicon.png"):
        os.remove("public/test_favicon.png")
        
    print("All favicon and icon assets generated successfully!")
