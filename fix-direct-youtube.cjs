const fs = require('fs');
const file = 'client/src/pages/learning.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the entire video-container block to just show the iframe directly without requiring a click
const oldVideoBlockRegex = /<div className="video-container group cursor-pointer mb-8">[\s\S]*?<\/div>\s*\{\/\* Video Playlist Buttons \*\/\}/;

const newVideoBlock = `<div className="video-container mb-8 relative">
                    {/* Always show the YouTube iframe directly */}
                    <iframe
                      width="100%"
                      height="100%"
                      src={getYouTubeEmbedUrl(activeLesson?.videos?.[selectedVideoIndex]?.video_url || currentLesson.videoId)}
                      title="Video giảng dạy toán học"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full absolute top-0 left-0"
                      data-testid="youtube-player"
                    />
                  </div>

                  {/* Video Playlist Buttons */}`;

content = content.replace(oldVideoBlockRegex, newVideoBlock);

fs.writeFileSync(file, content);
console.log('Video container updated to show iframe directly');
