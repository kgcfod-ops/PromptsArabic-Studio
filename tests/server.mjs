import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';

const folder='/PromptsArabic-Studio/';
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2'};
export async function serve(root) {
  const server=createServer(async(req,res)=>{
    try {
      const path=new URL(req.url,'http://localhost').pathname;
      if(!path.startsWith(folder)) {res.writeHead(404).end();return;}
      const file=resolve(root,decodeURIComponent(path.slice(folder.length)) || 'index.html');
      if(!file.startsWith(root+sep)) {res.writeHead(404).end();return;}
      const bytes=await readFile(file);
      res.writeHead(200,{'Content-Type':mime[extname(file)] || 'application/octet-stream'}).end(bytes);
    } catch {res.writeHead(404).end();}
  });
  await new Promise((done,fail)=>{server.once('error',fail);server.listen(0,'127.0.0.1',done);});
  return {server,url:'http://127.0.0.1:'+server.address().port+folder};
}
