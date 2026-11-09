import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const lines = html.split('\n');

lines.forEach((line, i) => {
  if (line.includes('suProfile') || line.includes('prName') || line.includes('Muhammed') || line.includes('Ermurat') || line.includes('Хувийн мэдээлэл') || line.includes('Профайл солих') || line.includes('Миний сонирхол')) {
    console.log(`Line ${i + 1}: ${line.trim()}`);
  }
});

