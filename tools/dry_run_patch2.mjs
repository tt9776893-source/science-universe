import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const navTarget5 = `['openAILab', 'openChemLab', 'openEngLab', 'openBioLab', 'openComputerLab', 'openMathLab', 'openSpaceExplore', 'openProfile', 'showUnlockModal'].forEach(fnName => {`;
console.log('navTarget5 found:', html.includes(navTarget5));

