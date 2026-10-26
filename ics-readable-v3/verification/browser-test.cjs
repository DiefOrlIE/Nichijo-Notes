const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
const assert=require('assert'),http=require('http'),fs=require('fs'),path=require('path');
(async()=>{
 const root=path.resolve(__dirname,'../..');const server=http.createServer((req,res)=>{let f=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';try{let ext=path.extname(f);res.setHeader('content-type',({'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.css':'text/css','.woff2':'font/woff2'})[ext]||'text/plain');res.end(fs.readFileSync(f))}catch{res.statusCode=404;res.end()}});await new Promise(r=>server.listen(8877,'127.0.0.1',r));
 const b=await chromium.launch({executablePath:'/tmp/ics-browser/chrome-linux64/chrome',headless:true,args:['--no-sandbox']});let results=[];
 for(const viewport of [{width:1440,height:900},{width:390,height:844},{width:820,height:1180}]){
 const c=await b.newContext({viewport}),p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(String(e)));p.on('console',m=>{if(m.type()==='error'&&!m.text().includes('favicon'))errors.push(m.text())});
 await p.goto('http://127.0.0.1:8877/ics-readable-v3/');await p.waitForFunction(()=>window.ICS_READY);await p.waitForTimeout(350);
 assert.equal(await p.locator('article').count(),11);assert(await p.locator('abbr').count()>100);
 assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 assert(await p.evaluate(()=>document.fonts.check('400 17px StudySerif','进程内存')));
 await p.locator('#theme').click();await p.locator('details').first().evaluate(e=>e.open=true);
 await p.locator('#unit-08').evaluate(e=>e.scrollIntoView());await p.waitForTimeout(300);let y=await p.evaluate(()=>scrollY);
 await p.reload();await p.waitForFunction(()=>window.ICS_READY);assert.equal(await p.evaluate(()=>document.documentElement.dataset.theme),'dark');assert(await p.locator('details').first().getAttribute('open')!==null);assert(Math.abs((await p.evaluate(()=>scrollY))-y)<8);
 await p.goto('http://127.0.0.1:8877/ics-readable-v3/#unit-02');await p.waitForFunction(()=>window.ICS_READY);assert(Math.abs(await p.locator('#unit-02').evaluate(e=>e.getBoundingClientRect().top)-80)<8);
 await p.locator('#term-open').click();await p.locator('#term-search').fill('ABI');assert((await p.locator('#term-list').innerText()).includes('Application Binary Interface'));await p.locator('dialog button').click();
 assert.deepEqual(errors,[]);await p.screenshot({path:'/tmp/ics-'+viewport.width+'.png'});results.push({viewport,errors,positionRestored:true,answersRestored:true,themeRestored:true,explicitAnchor:true});await c.close();
 }
 await b.close();await new Promise(r=>server.close(r));fs.writeFileSync(path.join(__dirname,'browser-results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results));
})().catch(e=>{console.error(e);process.exit(1)});
