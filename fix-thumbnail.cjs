const fs = require('fs');
const file = 'client/src/pages/learning.tsx';
let content = fs.readFileSync(file, 'utf8');

// Update the placeholder rendering to use actual YouTube thumbnail
const oldImgTag = `<img alt="Video Placeholder" className="w-full h-full object-cover opacity-60"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRyXrIfMSg8zlIfIdIELhCvPw4UDV47lRJ5znm9Q85F-jRnkAcpdA-9B51baVsFRMwdfeuAIzfX8XJMQhv_TY4zxtOJUL62Rh5TUzbrD_DrolHSvih1PLWLrdo6_lC6-1wVN4eMFCb4ANs2MzMXwKKOh2pXORzBqS5c36BvnYEHePSpD5t3mGteFExu91soemxnV5iMvEXQ8eZh44lZMLn3SVzWqagmW-gwBkivx_mW5YnD-wxscOeSqFJG0dilK-cLYoHYISLm_Y" />`;

const newImgTag = `<img alt="Video Placeholder" className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-80"
                          src={\`https://img.youtube.com/vi/\${extractVideoId(activeLesson?.videos?.[selectedVideoIndex]?.video_url || currentLesson.videoId)}/maxresdefault.jpg\`} 
                          onError={(e) => {
                            // Fallback to high quality (hqdefault) if maxresdefault doesn't exist
                            e.currentTarget.src = \`https://img.youtube.com/vi/\${extractVideoId(activeLesson?.videos?.[selectedVideoIndex]?.video_url || currentLesson.videoId)}/hqdefault.jpg\`;
                          }}
                        />`;

content = content.replace(oldImgTag, newImgTag);

// Also we should make sure that the image gets updated correctly when clicking different lessons
// Let's modify the video-container class slightly to remove the black background if not needed, but keep it for letterboxing
fs.writeFileSync(file, content);
console.log('Thumbnail logic updated');
