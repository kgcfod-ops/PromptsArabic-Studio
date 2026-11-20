import {writeFile, readFile} from 'node:fs/promises';
import {views} from '../assets/js/pages.mjs';
import {shell} from '../assets/js/home.mjs';
import {nav} from '../assets/js/ui.mjs';

const check=process.argv.includes('--check');
for (const [id] of nav) {
  const target=new URL('../'+id+'.html',import.meta.url);
  const output=shell(id,views[id]()).replace(/[ \t]+$/gm,'');
  if (check) {
    if (await readFile(target,'utf8') !== output) throw new Error('Generated page out of date: '+id+'.html');
  } else await writeFile(target,output);
}
console.log(check?'Verified all generated pages':'Built all nine static pages');
