const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

async function fixAPIUrls() {
  const clientDir = path.join(__dirname, 'client');
  const files = await readdir(clientDir);

  let updatedCount = 0;

  for (const file of files) {
    if (!file.endsWith('.html')) continue;

    const filePath = path.join(clientDir, file);
    let content = await readFile(filePath, 'utf8');
    let modified = false;

    // Replace http://localhost:5000 with window.location.origin (dynamic)
    const oldPattern = /http:\/\/localhost:5000/g;

    if (content.match(oldPattern)) {
      // For API_BASE declarations, use a helper
      content = content.replace(
        /const API_BASE = ['"]http:\/\/localhost:5000(\/api\/[^'"]+)['"]/g,
        "const API_BASE = (window.location.origin.includes('localhost') ? 'http://localhost:5000' : window.location.origin) + '$1'"
      );

      // For direct fetch calls
      content = content.replace(
        /fetch\(['"]http:\/\/localhost:5000(\/api\/[^'"]+)['"]/g,
        "fetch((window.location.origin.includes('localhost') ? 'http://localhost:5000' : window.location.origin) + '$1'"
      );

      // For template literals
      content = content.replace(
        /fetch\(`http:\/\/localhost:5000(\/api\/[^`]+)`/g,
        "fetch(`${window.location.origin.includes('localhost') ? 'http://localhost:5000' : window.location.origin}$1`"
      );

      modified = true;
    }

    if (modified) {
      await writeFile(filePath, content, 'utf8');
      updatedCount++;
      console.log(`✓ Fixed API URLs in: ${file}`);
    }
  }

  console.log(`\n✅ Done! Fixed API URLs in ${updatedCount} files.`);
}

fixAPIUrls().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
