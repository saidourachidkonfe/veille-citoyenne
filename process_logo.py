from PIL import Image
import sys

input_path = sys.argv[1]
output_path = sys.argv[2]

img = Image.open(input_path).convert("RGBA")
datas = img.getdata()

newData = []
# We want to make the white background transparent, and the black drawing white (or a nice blue).
# Let's make the drawing white so it stands out on the dark background of the hero section or blue on white background.
# Actually, the user's navbar is white (`bg-white`), so the logo there needs to be dark or primary color (#1D4ED8).
# In the hero section, maybe they don't show the logo, or it's just in the navbar.
# Let's color the black drawing with the primary blue #1D4ED8 (RGB: 29, 78, 216).

primary_color = (29, 78, 216, 255)

for item in datas:
    # Calculate luminance
    luminance = (item[0] * 0.299 + item[1] * 0.587 + item[2] * 0.114)
    if luminance > 200:
        # Transparent for white/light background
        newData.append((255, 255, 255, 0))
    else:
        # Smooth alpha for anti-aliasing based on luminance (darker = more opaque)
        alpha = int(255 - (luminance / 200 * 255))
        newData.append((primary_color[0], primary_color[1], primary_color[2], alpha))

img.putdata(newData)
img.save(output_path, "PNG")
print(f"Saved to {output_path}")
