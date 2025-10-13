const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Mapping của các URLs cần thay đổi
const urlMappings = {
  'Community.html': 'community',
  'LoginPage.html': 'login',
  'SignUpPage.html': 'signup',
  'ProfilePage.html': 'profile',
  'AccountProfile.html': 'account',
  'Blog.html': 'blog',
  'CourseandLesson.html': 'courses',
  'AdminDashboard.html': 'admin',
  'StudentDashboard.html': 'student',
  'TeacherDashboard.html': 'teacher',
  'LessonManagement.html': 'lessons',
  'QuizManagement.html': 'quiz',
  'QuizzAndGrades.html': 'grades',
  'CertificateGenerator.html': 'certificate',
  'OrderPage.html': 'order',
  'PaymentPage.html': 'payment',
  'SuccessPage.html': 'success',
  'CancelPage.html': 'cancel'
};

async function processFile(filePath, fileName) {
  let content = await readFile(filePath, 'utf8');
  let modified = false;

  // Replace all occurrences
  for (const [oldUrl, newUrl] of Object.entries(urlMappings)) {
    // Replace href="*.html"
    const hrefRegex = new RegExp(`href=["']${oldUrl}["']`, 'g');
    if (content.match(hrefRegex)) {
      content = content.replace(hrefRegex, `href="/${newUrl}"`);
      modified = true;
    }

    // Replace window.location.href = '*.html'
    const locationRegex1 = new RegExp(`(window\\.location\\.href|location\\.href)\\s*=\\s*['"]${oldUrl}['"]`, 'g');
    if (content.match(locationRegex1)) {
      content = content.replace(locationRegex1, `$1 = '/${newUrl}'`);
      modified = true;
    }

    // Replace in URLs like /SuccessPage.html or /CancelPage.html
    const slashRegex = new RegExp(`/${oldUrl}`, 'g');
    if (content.match(slashRegex)) {
      content = content.replace(slashRegex, `/${newUrl}`);
      modified = true;
    }

    // Replace #lesson URLs in CourseandLesson.html
    const hashRegex = new RegExp(`${oldUrl}#`, 'g');
    if (content.match(hashRegex)) {
      content = content.replace(hashRegex, `/${newUrl}#`);
      modified = true;
    }
  }

  if (modified) {
    await writeFile(filePath, content, 'utf8');
    return true;
  }
  return false;
}

async function updateHTMLFiles() {
  const clientDir = path.join(__dirname, 'client');
  const files = await readdir(clientDir);

  let updatedCount = 0;

  // Process HTML and JS files in client directory
  for (const file of files) {
    if (!file.endsWith('.html') && !file.endsWith('.js')) continue;

    const filePath = path.join(clientDir, file);
    if (await processFile(filePath, file)) {
      updatedCount++;
      console.log(`✓ Updated: ${file}`);
    }
  }

  // Process JS files in js directory
  const jsDir = path.join(clientDir, 'js');
  try {
    const jsFiles = await readdir(jsDir);
    for (const file of jsFiles) {
      if (!file.endsWith('.js')) continue;

      const filePath = path.join(jsDir, file);
      if (await processFile(filePath, `js/${file}`)) {
        updatedCount++;
        console.log(`✓ Updated: js/${file}`);
      }
    }
  } catch (err) {
    // js directory might not exist
  }

  console.log(`\n✅ Done! Updated ${updatedCount} files.`);
}

updateHTMLFiles().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
