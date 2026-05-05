const fs = require('fs');
const file = 'client/src/pages/learning.tsx';
let content = fs.readFileSync(file, 'utf8');

// Use a simpler string replacement
const searchStr = "src={getYouTubeEmbedUrl(activeLesson?.videos?.[0]?.video_url?.match(/v=([^&]+)|youtu\\.be\\/([^?]+)/)?.[1] || activeLesson?.videos?.[0]?.video_url?.match(/youtu\\.be\\/([^?]+)/)?.[1] || currentLesson.videoId)}";
const replaceStr = "src={getYouTubeEmbedUrl(activeLesson?.videos?.[0]?.video_url || currentLesson.videoId)}";

if (content.includes(searchStr)) {
  content = content.replace(searchStr, replaceStr);
  fs.writeFileSync(file, content);
  console.log('iframe fixed with string replacement');
} else {
  console.log('search string not found');
}
