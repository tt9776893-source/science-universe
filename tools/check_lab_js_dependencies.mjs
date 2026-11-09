import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

function checkJsQueries(prefix, queries) {
  console.log(`\n--- JS Queries for ${prefix} ---`);
  queries.forEach(q => {
    let count = 0;
    let pos = 0;
    while ((pos = html.indexOf(q, pos)) !== -1) {
      count++;
      pos += q.length;
    }
    console.log(`  ${q}: ${count} occurrences`);
  });
}

checkJsQueries('Computer Lab', ['#computerOverlay', 'cExit', 'cMain', 'cNav', 'data-cgo', 'data-cview', 'c-view', 'c-nav-btn', 'cSearch', 'cArticles', 'cReader']);
checkJsQueries('Chemistry Lab', ['#chemOverlay', 'chemClose', 'data-chtab', 'data-chpanel', 'ch-panel', 'ch-tab', 'chCinemaScene', 'chCinemaAtom']);
checkJsQueries('Engineering Lab', ['#engOverlay', 'engClose', 'data-engtab', 'data-engpanel', 'eng-panel', 'eng-tabs']);
checkJsQueries('AI Lab', ['#aiOverlay', 'aiClose', 'data-ai-tab', 'ai-box', 'ai-neurons', 'aiWires', 'aiNodes']);
checkJsQueries('Biology Lab', ['#bioOverlay', 'bioBack', 'data-btab', 'data-bpanel', 'bio-panel', 'bio-tabs']);
checkJsQueries('Physics Lab', ['.pl', 'pl-bar', 'pl-tabs', 'pl-grid', 'pl-card', 'pl_done']);

