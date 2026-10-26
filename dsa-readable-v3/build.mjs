import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {marked} from 'marked';

const here=path.dirname(fileURLToPath(import.meta.url));
const manuscript=fs.readFileSync(path.join(here,'manuscripts/ch15.md'),'utf8');
const title=manuscript.match(/^# (.+)$/m)?.[1];
const meta=manuscript.match(/<!-- id: (ch15) \| source: (.*?) -->/);
if(!title||!meta)throw Error('Missing manuscript title/source');
const re=/^## (.+?) \{#(ch15-[a-z0-9-]+)\}\s*$/gm;
const heads=[...manuscript.matchAll(re)];
if(heads.length!==15)throw Error('Expected 15 complete teaching sections, got '+heads.length);
const ids=heads.map(x=>x[2]);
if(new Set(ids).size!==heads.length)throw Error('Duplicate topic anchors');
marked.setOptions({gfm:true,breaks:false});
const intro=marked.parse(manuscript.slice(manuscript.indexOf(meta[0])+meta[0].length,heads[0].index));
const sections=heads.map((m,i)=>({
  id:m[2],
  title:m[1],
  html:marked.parse(manuscript.slice(m.index+m[0].length,i+1<heads.length?heads[i+1].index:manuscript.length))
}));
const html=sections.map(s=>s.html).join('\n');
const fenced=(manuscript.match(/```cpp/g)||[]).length;
if(fenced<4)throw Error('Insufficient complete C++ examples: '+fenced);
if((manuscript.match(/<details class="question">/g)||[]).length<8)throw Error('Too few worked exercises');
if((html.match(/<table>/g)||[]).length<7)throw Error('Worked trace tables missing');
const data={title,source:meta[2],intro,sections,version:'v3-manuscript-first'};
fs.writeFileSync(path.join(here,'chapter-data.js'),'/* generated from manuscripts/ch15.md */\nwindow.NICHIJO_V3='+JSON.stringify(data)+';\n','utf8');
fs.copyFileSync(path.join(here,'template.html'),path.join(here,'index.html'));
console.log(JSON.stringify({title,sections:sections.length,cppExamples:fenced,workedQuestions:(manuscript.match(/<details class="question">/g)||[]).length,htmlCharacters:html.length},null,2));
