const fs = require('fs');
const path = require('path');

// Check if carousel images exist
const carouselPath = path.join(process.cwd(), 'public/images/carousel');
console.log('Carousel directory exists:', fs.existsSync(carouselPath));

if (fs.existsSync(carouselPath)) {
  const files = fs.readdirSync(carouselPath);
  const imageFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.webp', '.avif'].includes(ext);
  });
  console.log('Carousel images found:', imageFiles.length);
  console.log('First 5 images:', imageFiles.slice(0, 5));
}

// Check content directory
const contentPath = path.join(process.cwd(), 'content/tapestries');
console.log('Content tapestries directory exists:', fs.existsSync(contentPath));

if (fs.existsSync(contentPath)) {
  const dirs = fs.readdirSync(contentPath);
  console.log('Tapestry directories found:', dirs.length);
  console.log('First 5 directories:', dirs.slice(0, 5));
}