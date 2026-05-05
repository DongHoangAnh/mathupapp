const fs = require('fs');
const file = 'client/src/pages/learning.tsx';
let content = fs.readFileSync(file, 'utf8');

// We need to store selected video index
// First add state for selectedVideoIndex
if (!content.includes('const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);')) {
  content = content.replace(
    'const [isPlaying, setIsPlaying] = useState(false);',
    'const [isPlaying, setIsPlaying] = useState(false);\n  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);'
  );
}

// Reset selectedVideoIndex when lesson changes
if (content.includes('onClick={() => setActiveLesson(lesson)}')) {
  content = content.replace(
    /onClick=\{\(\) => setActiveLesson\(lesson\)\}/g,
    'onClick={() => { setActiveLesson(lesson); setSelectedVideoIndex(0); setIsPlaying(false); }}'
  );
}

// Update the iframe src to use selectedVideoIndex
content = content.replace(
  'src={getYouTubeEmbedUrl(activeLesson?.videos?.[0]?.video_url || currentLesson.videoId)}',
  'src={getYouTubeEmbedUrl(activeLesson?.videos?.[selectedVideoIndex]?.video_url || currentLesson.videoId)}'
);

// Update the video playlist buttons to change selectedVideoIndex
const btnSearch = 'onClick={() => {\n                            setIsPlaying(true);\n                            // We might want to set this video as active\n                          }}';
const btnReplace = 'onClick={() => {\n                            setIsPlaying(true);\n                            setSelectedVideoIndex(i);\n                          }}';

content = content.replace(btnSearch, btnReplace);

// Update button styling to highlight active video
const btnStyleSearch = 'className="bg-blue-50 hover:bg-[#00AEEF] hover:text-white transition-colors text-[#00AEEF] font-bold py-3 px-6 rounded-xl border-2 border-[#00AEEF]/10 text-center uppercase"';
const btnStyleReplace = 'className={`transition-colors font-bold py-3 px-6 rounded-xl border-2 text-center uppercase ${selectedVideoIndex === i && isPlaying ? "bg-[#00AEEF] text-white border-[#00AEEF]" : "bg-blue-50 hover:bg-[#00AEEF] hover:text-white text-[#00AEEF] border-[#00AEEF]/10"}`}';

content = content.replace(btnStyleSearch, btnStyleReplace);

fs.writeFileSync(file, content);
console.log('Added support for multiple videos per lesson');
