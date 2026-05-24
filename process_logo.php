<?php
$input = $argv[1];
$output = $argv[2];

// Load image
$ext = strtolower(pathinfo($input, PATHINFO_EXTENSION));
if ($ext == 'png') $im = @imagecreatefrompng($input);
elseif ($ext == 'jpg' || $ext == 'jpeg') $im = @imagecreatefromjpeg($input);
else die("Unsupported format");

if (!$im) die("Failed to load image");

$width = imagesx($im);
$height = imagesy($im);

$outIm = imagecreatetruecolor($width, $height);
imagesavealpha($outIm, true);
$transparent = imagecolorallocatealpha($outIm, 0, 0, 0, 127);
imagefill($outIm, 0, 0, $transparent);

// Target color: #2563EB -> 37, 99, 235
$rT = 37; $gT = 99; $bT = 235;

for ($x = 0; $x < $width; $x++) {
    for ($y = 0; $y < $height; $y++) {
        $rgb = imagecolorat($im, $x, $y);
        $colors = imagecolorsforindex($im, $rgb);
        $lum = ($colors['red']*0.299 + $colors['green']*0.587 + $colors['blue']*0.114);
        
        if ($lum > 200) {
            imagesetpixel($outIm, $x, $y, $transparent);
        } else {
            $alpha = intval(($lum / 200) * 127); // 0 is opaque, 127 is transparent
            $newColor = imagecolorallocatealpha($outIm, $rT, $gT, $bT, $alpha);
            imagesetpixel($outIm, $x, $y, $newColor);
        }
    }
}

imagepng($outIm, $output);
imagedestroy($im);
imagedestroy($outIm);
echo "Saved to $output\n";
