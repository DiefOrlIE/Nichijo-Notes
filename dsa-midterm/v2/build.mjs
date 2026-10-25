// Markdown manuscripts are the single source of teaching content.
// The output is a static JS data bundle so GitHub Pages works without a client-side CDN.
import fs from 'node:fs';
import path from 'node:path';
import {marked} from 'marked';

const root=path.dirname(new URL(import.meta.url).pathname);
const files=fs.readdirSync(path.join(root,'chapters')).filter(f=>/^ch\d\d\.md$/.test(f)).sort();
if(files.length!==16)throw Error('Expected exactly 16 manuscripts; found '+files.length);
const chapters=[],anchors=new Set();
marked.setOptions({gfm:true,breaks:false});
for(const file of files){
 const raw=fs.readFileSync(path.join(root,'chapters',file),'utf8');
 const first=/^# (.+)$/m.exec(raw), meta=/<!-- id:\s*(ch\d\d)\s*\|\s*source:\s*([\s\S]*?)\s*-->/.exec(raw);
 if(!first||!meta)throw Error('Missing title or source in '+file);
 const id=meta[1];
 if(file!==id+'.md')throw Error('Filename does not match id: '+file);
 const positions=[...raw.matchAll(/^## (.+?)\s+\{#([a-z0-9-]+)\}\s*$/gm)];
 if(positions.length<3)throw Error('Too few complete units in '+file);
 const preamble=raw.slice(meta.index+meta[0].length,positions[0].index);
 const chapter={id,title:first[1],source:meta[2],introHtml:marked.parse(preamble),sections:[]};
 for(let i=0;i<positions.length;i++){
    const m=positions[i],end=i+1<positions.length?positions[i+1].index:raw.length;
    const sid=m[2];
    if(anchors.has(sid))throw Error('Duplicate source anchor '+sid);
    anchors.add(sid);
    if(!sid.startsWith(id+'-'))throw Error('Anchor belongs to wrong chapter '+sid);
    const content=raw.slice(m.index+m[0].length,end);
    chapter.sections.push({id:sid,title:m[1],html:marked.parse(content)});
 }
 chapters.push(chapter);
}
const corpus=chapters.map(c=>c.introHtml+c.sections.map(s=>s.html).join('\n')).join('\n');
if(/data-tier|四档累计显示|当前档新增/.test(corpus))throw Error('Old tier language remains in narrative');
const output='/* Generated from v2/chapters/*.md. Do not edit manually. */\nwindow.NICHIJO_V2='+JSON.stringify(chapters)+';\n';
fs.writeFileSync(path.join(root,'course-data.js'),output,'utf8');
fs.copyFileSync(path.join(root,'template.html'),path.join(root,'..','index.html'));

console.log(JSON.stringify({chapters:chapters.length,units:chapters.reduce((n,c)=>n+c.sections.length,0),sourceChars:corpus.length,anchors:anchors.size,outputBytes:Buffer.byteLength(output)},null,2));
