import { execSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

// Read package.json file
const packageJsonPath = fileURLToPath(new URL('../package.json', import.meta.url));
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const projectName = packageJson.name || 'project';

// Get current date and format as YYYY-MM-DD-HHMMSS
const now = new Date();
const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;

const outputDir = path.join(process.cwd(), 'archives');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputZip = path.join(outputDir, `${projectName}-${formattedDate}.zip`);
console.log('Creating archive:', outputZip);

let files;
try {
  files = execSync('git ls-files --cached --others --exclude-standard')
    .toString()
    .split('\n')
    .filter(file => file && !file.startsWith('.git'));
} catch (err) {
  console.error('Error listing files:', err);
  process.exit(1);
}

try {
  if (os.platform() === 'win32') {
    // Windows: Create a temporary folder, copy files there, then compress using PowerShell.
    const tmpDir = path.join(process.cwd(), 'tmp-zip');
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
    fs.mkdirSync(tmpDir, { recursive: true });

    // Copy each file while preserving folder structure.
    for (const file of files) {
      const src = path.join(process.cwd(), file);
      const dest = path.join(tmpDir, file);
      const destDir = path.dirname(dest);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      fs.copyFileSync(src, dest);
    }

    // Compress the temporary folder using PowerShell's Compress-Archive.
    const psCommand = `powershell Compress-Archive -Path "${tmpDir}\\*" -DestinationPath "${outputZip}"`;
    execSync(psCommand, { stdio: 'inherit' });

    // Remove the temporary folder.
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } else {
    // Unix-like: Use the native zip command.
    const fileList = files.map(file => `"${file}"`).join(' ');
    const cmd = `zip -r "${outputZip}" ${fileList}`;
    execSync(cmd, { stdio: 'inherit' });
  }
  console.log('Archive created successfully!');
} catch (err) {
  console.error('Error creating archive:', err);
  process.exit(1);
}
