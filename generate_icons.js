
import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import path from 'path';

const inputPath = 'new_logo.png';
const resBase = 'android/app/src/main/res';

const mipmaps = [
    { name: 'mipmap-mdpi', size: 48 },
    { name: 'mipmap-hdpi', size: 72 },
    { name: 'mipmap-xhdpi', size: 96 },
    { name: 'mipmap-xxhdpi', size: 144 },
    { name: 'mipmap-xxxhdpi', size: 192 }
];

async function generateIcons() {
    console.log('Generating icons...');
    const image = await loadImage(inputPath);
    
    for (const mip of mipmaps) {
        const canvas = createCanvas(mip.size, mip.size);
        const ctx = canvas.getContext('2d');
        
        // Draw image
        ctx.drawImage(image, 0, 0, mip.size, mip.size);
        
        const outDir = path.join(resBase, mip.name);
        if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
        
        // Save ic_launcher.png
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(path.join(outDir, 'ic_launcher.png'), buffer);
        fs.writeFileSync(path.join(outDir, 'ic_launcher_round.png'), buffer);
        fs.writeFileSync(path.join(outDir, 'ic_launcher_foreground.png'), buffer);
        
        console.log(`Generated icons for ${mip.name} (${mip.size}x${mip.size})`);
    }

    // Also update public/app_icon.png and icons/
    const sizes = [144, 192];
    for (const size of sizes) {
        const canvas = createCanvas(size, size);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, size, size);
        fs.writeFileSync(`public/icons/icon-${size}.png`, canvas.toBuffer('image/png'));
    }
    const mainIconCanvas = createCanvas(512, 512);
    const mainCtx = mainIconCanvas.getContext('2d');
    mainCtx.drawImage(image, 0, 0, 512, 512);
    fs.writeFileSync('public/app_icon.png', mainIconCanvas.toBuffer('image/png'));

    console.log('All icons generated successfully!');
}

generateIcons().catch(console.error);
