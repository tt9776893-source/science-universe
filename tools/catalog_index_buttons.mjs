import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

// Parse all buttons, a links, divs acting as buttons with close/back text or attributes
const buttonRegex = /<(button|a|span|div)\b([^>]*)>([\s\S]*?)<\/\1>/gi;

let match;
const catalog = [];

while ((match = buttonRegex.exec(html)) !== null) {
  const [full, tag, attrs, content] = match;
  const isClose = /[✕×✖✗]|>\s*x\s*<|Хаах|Буцах|Болих|Гарах|Цуцлах|close|back|exit|cancel|dismiss/i.test(full);
  if (!isClose) continue;

  const idMatch = attrs.match(/\bid=["']([^"']+)["']/i);
  const classMatch = attrs.match(/\bclass=["']([^"']+)["']/i);
  const onclickMatch = attrs.match(/\bonclick=["']([^"']+)["']/i);
  const ariaMatch = attrs.match(/\baria-label=["']([^"']+)["']/i);
  const typeMatch = attrs.match(/\btype=["']([^"']+)["']/i);
  const dataPrBack = attrs.includes('data-prback');

  const textClean = content.replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');

  // Filter out large container divs that just contain some close button inside
  if (['div', 'span'].includes(tag.toLowerCase()) && content.length > 300) {
    continue;
  }

  // Filter out text that is not button-like (e.g. paragraphs of descriptions)
  if (textClean.length > 80 && !idMatch && !onclickMatch && !dataPrBack) {
    continue;
  }

  catalog.push({
    index: match.index,
    tag,
    id: idMatch ? idMatch[1] : '',
    cls: classMatch ? classMatch[1] : '',
    onclick: onclickMatch ? onclickMatch[1] : '',
    aria: ariaMatch ? ariaMatch[1] : '',
    dataPrBack,
    text: textClean.substring(0, 60),
    raw: full.length > 180 ? full.substring(0, 180) + '...' : full
  });
}

console.log(`=== Total close/back candidates in index.html: ${catalog.length} ===`);
catalog.forEach((c, idx) => {
  console.log(`${idx + 1}. <${c.tag}> ID: "${c.id}" CLS: "${c.cls}" PRBACK: ${c.dataPrBack} TEXT: "${c.text}" ARIA: "${c.aria}"`);
});

