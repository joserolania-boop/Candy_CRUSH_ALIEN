from PIL import Image, ImageDraw, ImageFilter

def create_fishing_icon():
    # Constants
    size = (512, 512)
    bg_color_top = (30, 144, 255)    # Dodger Blue
    bg_color_bottom = (0, 0, 139)    # Dark Blue
    
    # Create base image with gradient
    base = Image.new('RGBA', size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(base)
    
    # Draw gradient background
    for y in range(size[1]):
        r = int(bg_color_top[0] + (bg_color_bottom[0] - bg_color_top[0]) * y / size[1])
        g = int(bg_color_top[1] + (bg_color_bottom[1] - bg_color_top[1]) * y / size[1])
        b = int(bg_color_top[2] + (bg_color_bottom[2] - bg_color_top[2]) * y / size[1])
        draw.line([(0, y), (size[0], y)], fill=(r, g, b, 255))

    # Create a rounded rectangle mask for the icon shape
    mask = Image.new('L', size, 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([0, 0, 511, 511], radius=90, fill=255)
    
    # Apply mask to base
    icon_bg = Image.new('RGBA', size, (0, 0, 0, 0))
    icon_bg.paste(base, (0, 0), mask)

    # Load the fishing source image
    try:
        fish = Image.open('assets/images/fishing_source.png').convert('RGBA')
        
        # Resize fish to fit nicely (about 70% of icon size)
        target_width = int(size[0] * 0.8)
        aspect_ratio = fish.height / fish.width
        target_height = int(target_width * aspect_ratio)
        fish = fish.resize((target_width, target_height), Image.Resampling.LANCZOS)
        
        # Add a subtle drop shadow to the fish
        shadow = Image.new('RGBA', size, (0, 0, 0, 0))
        shadow_pos = ((size[0] - target_width) // 2 + 5, (size[1] - target_height) // 2 + 5)
        shadow.paste((0, 0, 0, 100), shadow_pos, fish)
        shadow = shadow.filter(ImageFilter.GaussianBlur(radius=5))
        
        # Paste shadow and fish onto background
        icon_bg.paste(shadow, (0, 0), shadow)
        fish_pos = ((size[0] - target_width) // 2, (size[1] - target_height) // 2)
        icon_bg.paste(fish, fish_pos, fish)
        
        # Save the final icon
        icon_bg.save('assets/images/fishing_app_icon.png')
        print("Fishing app icon created successfully at assets/images/fishing_app_icon.png")
        
    except Exception as e:
        print(f"Error creating icon: {e}")

if __name__ == "__main__":
    create_fishing_icon()
