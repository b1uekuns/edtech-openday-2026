const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Add variables if it's main.css
    if (filePath.includes('main.css')) {
        content = content.replace(':root {', `:root {
  --glass-rgb: 255, 255, 255;
  --text-main: #ffffff;`);
    }

    // Replace rgba(255, 255, 255, X) with rgba(var(--glass-rgb), X)
    content = content.replace(/rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*([0-9.]+)\s*\)/g, 'rgba(var(--glass-rgb), $1)');

    // Replace color: #fff; with color: var(--text-main);
    content = content.replace(/:\s*#fff(?:fff)?\s*;/gi, ': var(--text-main);');
    content = content.replace(/:\s*#fff(?:fff)?\s*,/gi, ': var(--text-main),');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Processed ${filePath}`);
}

processFile(path.join(__dirname, 'assets', 'css', 'main.css'));
processFile(path.join(__dirname, 'assets', 'css', 'components.css'));
