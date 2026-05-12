const fs = require('fs');
const path = require('path');

const validExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const galleryRoot = path.join(__dirname, '..', 'images', 'galeria');
const outputFile = path.join(__dirname, '..', 'js', 'gallery-data.js');

function toTitleCase(text) {
  return text
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
    .trim();
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/_+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');
}

function buildAltText(fileName) {
  const name = path.parse(fileName).name;
  return toTitleCase(name);
}

function getCategoryFolders() {
  return fs.readdirSync(galleryRoot, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .sort((a, b) => a.localeCompare(b, 'pt', { sensitivity: 'base' }));
}

function getImagesFromCategory(category) {
  const categoryPath = path.join(galleryRoot, category);
  const categorySlug = slugify(category);
  return fs.readdirSync(categoryPath)
    .filter(file => validExtensions.has(path.extname(file).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, 'pt', { sensitivity: 'base' }))
    .map(file => ({
      category: categorySlug,
      src: `images/galeria/${category}/${file}`,
      alt: buildAltText(file)
    }));
}

function main() {
  if (!fs.existsSync(galleryRoot)) {
    console.error('Pasta de galeria não encontrada:', galleryRoot);
    process.exit(1);
  }

  const categories = getCategoryFolders();
  const images = categories.flatMap(getImagesFromCategory);

  const fileContent = `window.galleryData = ${JSON.stringify(images, null, 2)};\n`;

  fs.writeFileSync(outputFile, fileContent, 'utf8');
  console.log(`Gerado ${outputFile} com ${images.length} imagens e ${categories.length} categorias.`);
}

main();
