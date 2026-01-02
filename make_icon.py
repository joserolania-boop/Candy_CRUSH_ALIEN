from PIL import Image, ImageDraw, ImageFilter

def create_app_icon():
    # 1. Create base 512x512 image
    size = (512, 512)
    
    # 2. Load background
    try:
        bg = Image.open('assets/images/backgrounds/bg_galaxy.jpg').convert('RGBA')
        # Crop to square and resize
        w, h = bg.size
        min_dim = min(w, h)
        left = (w - min_dim) / 2
        top = (h - min_dim) / 2
        right = (w + min_dim) / 2
        bottom = (h + min_dim) / 2
        bg = bg.crop((left, top, right, bottom)).resize(size, Image.Resampling.LANCZOS)
    except:
        # Fallback to dark blue gradient if background fails
        bg = Image.new('RGBA', size, (10, 10, 40, 255))
        draw = ImageDraw.Draw(bg)
        for i in range(512):
            alpha = int(255 * (i / 512))
            draw.line([(0, i), (512, i)], fill=(20, 40, 100, alpha))

    # 3. Load main character (Alien)
    alien = Image.open('assets/images/tile_alien.png').convert('RGBA')
    # Resize alien to be prominent (about 60% of icon)
    alien_size = int(512 * 0.6)
    alien = alien.resize((alien_size, alien_size), Image.Resampling.LANCZOS)
    
    # 4. Load secondary elements (Crystal and Star)
    crystal = Image.open('assets/images/tile_crystal.png').convert('RGBA')
    crystal = crystal.resize((120, 120), Image.Resampling.LANCZOS)
    
    star = Image.open('assets/images/tile_star.png').convert('RGBA')
    star = star.resize((80, 80), Image.Resampling.LANCZOS)

    # 5. Composite
    # Add a subtle glow behind the alien
    glow = Image.new('RGBA', size, (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse([128, 128, 384, 384], fill=(0, 255, 150, 100))
    glow = glow.filter(ImageFilter.GaussianBlur(radius=30))
    bg.alpha_composite(glow)

    # Paste alien in center
    alien_pos = ((512 - alien_size) // 2, (512 - alien_size) // 2)
    bg.alpha_composite(alien, alien_pos)

    # Paste crystals and stars around
    bg.alpha_composite(crystal, (40, 350))
    bg.alpha_composite(star, (380, 60))
    bg.alpha_composite(star, (60, 80))
    
    # 6. Save
    bg.save('assets/images/app_icon.png', 'PNG')
    print("App icon created successfully at assets/images/app_icon.png")

if __name__ == "__main__":
    create_app_icon()
