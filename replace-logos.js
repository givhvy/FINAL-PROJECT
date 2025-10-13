const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Old SVG logo pattern to replace
const oldLogoSVG = '<svg class="h-8 w-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>';

// Also match slight variations
const oldLogoPatterns = [
  /<svg class="h-8 w-8 text-blue-\d+" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"><\/path><\/svg>/g,
  /<svg class="h-8 w-8 text-gray-\d+" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"><\/path><\/svg>/g
];

// New logo using e-learning.svg
const newLogo = '<img src="/e-learning.svg" alt="UniLearn Logo" class="h-8 w-8">';

async function replaceLogos() {
  const clientDir = path.join(__dirname, 'client');
  const files = await readdir(clientDir);

  let updatedCount = 0;

  for (const file of files) {
    if (!file.endsWith('.html')) continue;

    const filePath = path.join(clientDir, file);
    let content = await readFile(filePath, 'utf8');
    let modified = false;

    // Replace all logo patterns
    for (const pattern of oldLogoPatterns) {
      if (content.match(pattern)) {
        content = content.replace(pattern, newLogo);
        modified = true;
      }
    }

    if (modified) {
      await writeFile(filePath, content, 'utf8');
      updatedCount++;
      console.log(`✓ Updated logo in: ${file}`);
    }
  }

  console.log(`\n✅ Done! Updated logos in ${updatedCount} files.`);
}

replaceLogos().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
