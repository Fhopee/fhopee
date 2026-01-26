import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

const PRODUCTS_JSON_PATH = path.join(process.cwd(), 'data', 'products_ready.json');
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const IMAGES_PRODUCTS_DIR = path.join(PUBLIC_DIR, 'images', 'products');

async function main() {
  console.log('🖼️ Starting Image Path Fixer...');

  if (!fs.existsSync(PRODUCTS_JSON_PATH)) {
    console.error('❌ Error: products_ready.json not found.');
    process.exit(1);
  }

  // 1. Load all available product images
  console.log('📂 Scanning public/images/products for available images...');
  // Use glob to find all files recursively in images/products
  // We'll map "filename" -> "/images/products/..."
  const imageFiles = glob.sync('**/*.{jpg,jpeg,png,webp,gif,JPG,JPEG,PNG,WEBP,GIF}', { 
    cwd: IMAGES_PRODUCTS_DIR,
    nodir: true 
  });

  const imageMap = new Map<string, string>();
  
  imageFiles.forEach(file => {
    const filename = path.basename(file).toLowerCase(); // Normalize to lowercase for matching
    // Store relative path from public root
    // file is relative to IMAGES_PRODUCTS_DIR, so we prepend /images/products/
    // We replace backslashes with forward slashes for URL compatibility
    const relativePath = '/images/products/' + file.replace(/\\/g, '/');
    imageMap.set(filename, relativePath);
    
    // Also store decoded filename (handle %20 etc)
    try {
      const decoded = decodeURIComponent(filename);
      if (decoded !== filename) {
        imageMap.set(decoded, relativePath);
      }
    } catch (e) {}
  });

  console.log(`✅ Found ${imageMap.size} unique image filenames.`);

  // 2. Load Products
  const products = JSON.parse(fs.readFileSync(PRODUCTS_JSON_PATH, 'utf-8'));
  let updatedCount = 0;

  // Helper to fix a single image path
  const fixPath = (originalPath: string): string => {
    if (!originalPath) return '/images/placeholder.jpg';

    // Check if file exists exactly as is (relative to public)
    const absolutePath = path.join(PUBLIC_DIR, originalPath.replace(/^\//, '').replace(/%20/g, ' '));
    if (fs.existsSync(absolutePath)) {
      return originalPath;
    }

    // Try to find by filename
    const filename = path.basename(originalPath).toLowerCase();
    // Try raw filename
    if (imageMap.has(filename)) {
      return imageMap.get(filename)!;
    }
    
    // Try decoded filename
    try {
      const decoded = decodeURIComponent(filename);
      if (imageMap.has(decoded)) {
        return imageMap.get(decoded)!;
      }
    } catch (e) {}

    // Not found
    return '/images/placeholder.jpg';
  };

  // 3. Process Products
  const fixedProducts = products.map((p: any) => {
    let isModified = false;

    // Fix mainImage
    const oldMain = p.mainImage;
    const newMain = fixPath(oldMain);
    
    if (oldMain !== newMain) {
      // Only mark as modified if it wasn't already placeholder (to avoid log spam if we run multiple times)
      if (oldMain !== '/images/placeholder.jpg' || newMain !== '/images/placeholder.jpg') {
        // console.log(`Fixed: ${oldMain} -> ${newMain}`);
        isModified = true;
      }
      p.mainImage = newMain;
    }

    // Fix gallery
    if (p.gallery && Array.isArray(p.gallery)) {
      const newGallery = p.gallery.map((img: string) => {
        const fixed = fixPath(img);
        // If fixed is placeholder, we might want to remove it from gallery to avoid duplicates?
        // For now, let's keep it but maybe filter later if needed.
        return fixed;
      }).filter((img: string) => img !== '/images/placeholder.jpg'); // Remove placeholders from gallery

      if (JSON.stringify(newGallery) !== JSON.stringify(p.gallery)) {
        p.gallery = newGallery;
        isModified = true;
      }
    }

    if (isModified) updatedCount++;
    return p;
  });

  // 4. Save
  fs.writeFileSync(PRODUCTS_JSON_PATH, JSON.stringify(fixedProducts, null, 2));
  console.log(`✅ Success! Fixed image paths for ${updatedCount} products.`);
}

main().catch(console.error);




