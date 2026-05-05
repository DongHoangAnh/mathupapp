const fs = require('fs');
const file = 'client/src/pages/learning.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /const getYouTubeEmbedUrl = \(videoId: string\) => \{\s*return `https:\/\/www\.youtube\.com\/embed\/\$\{videoId\}\?rel=0&showinfo=0&modestbranding=1`;\s*\};/;

const replacement = `const extractVideoId = (url: string) => {
    if (!url) return "";
    const regExp = /^.*(youtu.be\\/|v\\/|u\\/\\w\\/|embed\\/|watch\\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : "";
  };

  const getYouTubeEmbedUrl = (videoId: string) => {
    if (!videoId) return "";
    // If it's already a full URL, extract the ID
    if (videoId.includes('http')) {
      videoId = extractVideoId(videoId);
    }
    return \`https://www.youtube.com/embed/\${videoId}?rel=0&showinfo=0&modestbranding=1\`;
  };`;

content = content.replace(regex, replacement);

const regex2 = /src=\{getYouTubeEmbedUrl\(activeLesson\?\.videos\?\.\[0\]\?\.video_url\?\.match\(\/v=\(\[\^&\]\+\)\|youtu\\\.be\\\/(\[\^\?\]\+)\/\)\?\.\[1\] \|\| activeLesson\?\.videos\?\.\[0\]\?\.video_url\?\.match\(\/youtu\\\.be\\\/(\[\^\?\]\+)\/\)\?\.\[1\] \|\| currentLesson\.videoId\)\}/;

const replacement2 = `src={getYouTubeEmbedUrl(activeLesson?.videos?.[0]?.video_url || currentLesson.videoId)}`;

content = content.replace(regex2, replacement2);

fs.writeFileSync(file, content);
console.log('patched iframe code');
