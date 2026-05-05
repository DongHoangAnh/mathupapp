const fs = require('fs');
const file = 'client/src/pages/learning.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/src=\{getYouTubeEmbedUrl\(activeLesson\?\.videos\?\.\[0\]\?\.video_url\?\.match\(\/v=\(\[\^&\]\+\)\|youtu\\\.be\\\/(\[\^\?\]\+)\/\)\?\.\[1\] \|\| activeLesson\?\.videos\?\.\[0\]\?\.video_url\?\.match\(\/youtu\\\.be\\\/(\[\^\?\]\+)\/\)\?\.\[1\] \|\| currentLesson\.videoId\)\}/g, 'src={getYouTubeEmbedUrl(activeLesson?.videos?.[0]?.video_url || currentLesson.videoId)}');

fs.writeFileSync(file, content);
console.log('iframe fixed');
