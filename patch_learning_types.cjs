const fs = require('fs');
let content = fs.readFileSync('client/src/pages/learning.tsx', 'utf8');

// fix TS errors 
content = content.replace(/lessons\.forEach\(l => {/g, 'lessons.forEach((l: any) => {');
content = content.replace(/const mapTitleToVideos = \(title, chapterName\) => {/g, 'const mapTitleToVideos = (title: string, chapterName: string) => {');
content = content.replace(/return videos\.filter\(v => /g, 'return videos.filter((v: any) => ');
content = content.replace(/key={v\.id \|\| i}/g, 'key={v.id || i}');
content = content.replace(/onClick=\{\(\) => \{/g, 'onClick={() => {');
content = content.replace(/activeLesson\?\.videos\?\.map\(\(v, i\) => {/g, 'activeLesson?.videos?.map((v: any, i: number) => {');
content = content.replace(/activeLesson\?\.videos\?\.map\(\(v, i\) => \(/g, 'activeLesson?.videos?.map((v: any, i: number) => (');

fs.writeFileSync('client/src/pages/learning.tsx', content, 'utf8');
console.log('types patched');
