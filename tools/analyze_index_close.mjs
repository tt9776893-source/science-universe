import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

// Let's find all HTML tags with id, class, or text that indicate close/back
// And let's find all onclick handlers or scripts that handle closing
const regex = /<([a-z0-9]+)\s+([^>]*?(?:id|class|aria-label|onclick)=[^>]*?)(>([\s\S]*?)<\/\1>|\/>|>)/gi;

let match;
const buttons = [];

while ((match = regex.exec(html)) !== null) {
  const [fullTag, tag, attrs, _, text] = match;
  if (/close|back|exit|cancel|dismiss|хаах|буцах|болих|гарах|цуцлах|[✕×✖✗]|>\s*x\s*</i.test(fullTag)) {
    // extract id
    const idMatch = attrs.match(/id=["']([^"']+)["']/i);
    const classMatch = attrs.match(/class=["']([^"']+)["']/i);
    const onclickMatch = attrs.match(/onclick=["']([^"']+)["']/i);
    const ariaMatch = attrs.match(/aria-label=["']([^"']+)["']/i);
    const id = idMatch ? idMatch[1] : '';
    const cls = classMatch ? classMatch[1] : '';
    const oc = onclickMatch ? onclickMatch[1] : '';
    const aria = ariaMatch ? ariaMatch[1] : '';
    const cleanText = text ? text.replace(/<[^>]+>/g, '').trim() : '';

    // Ignore if it's just a general container unless it looks like a button/link/interactive
    if (['button', 'a', 'span', 'div', 'i'].includes(tag.toLowerCase())) {
      buttons.push({
        tag,
        id,
        cls,
        aria,
        onclick: oc,
        text: cleanText.substring(0, 50),
        raw: fullTag.length > 200 ? fullTag.substring(0, 200) + '...' : fullTag
      });
    }
  }
}

console.log(`Found ${buttons.length} close-related elements in index.html:`);
buttons.forEach((b, i) => {
  console.log(`${i + 1}. <${b.tag}> id="${b.id}" class="${b.cls}" text="${b.text}" onclick="${b.onclick}" aria="${b.aria}"`);
});

