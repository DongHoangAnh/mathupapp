const fs = require('fs');

function cleanStr(s) {
  if (!s) return '';
  return s.toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/bài \d+[-:]?\s*/g, '')
    .replace(/^ôn tập\s+/g, '')
    .trim();
}

const grades = [1, 2, 3, 4, 5];

for (const grade of grades) {
  const qFile = grade === 2 ? 'data.json' : `data${grade === 1 ? '1' : grade}.json`;
  const vFile = `data_video${grade}.json`;

  if (!fs.existsSync(qFile) || !fs.existsSync(vFile)) continue;

  const qData = JSON.parse(fs.readFileSync(qFile, 'utf8'));
  const vData = JSON.parse(fs.readFileSync(vFile, 'utf8'));

  const questions = qData.questions || [];
  const videos = vData.videos || [];

  const uniqueLessons = new Map();
  questions.forEach(q => {
    const lessonStr = q.lesson_name ? q.lesson_name.trim() : (q.chapter_name ? q.chapter_name.trim() : '');
    const chapterStr = q.chapter_name ? q.chapter_name.trim() : 'Chủ đề khác';
    if (lessonStr && !uniqueLessons.has(lessonStr)) {
      uniqueLessons.set(lessonStr, chapterStr);
    }
  });

  let addedCount = 0;

  for (const [lesson, chapter] of uniqueLessons.entries()) {
    const nTitle = cleanStr(lesson);
    
    // Check if video exists
    const hasVideo = videos.some(v => {
      if (!v.lesson_name) return false;
      const nVideoLesson = cleanStr(v.lesson_name);
      return nVideoLesson.includes(nTitle) || nTitle.includes(nVideoLesson);
    });

    if (!hasVideo) {
      // Find a fallback video in the same chapter
      let fallbackVideo = videos.find(v => v.chapter_name && cleanStr(v.chapter_name) === cleanStr(chapter));
      
      // Try to find any review video if chapter match fails
      if (!fallbackVideo) {
         fallbackVideo = videos.find(v => v.lesson_name && v.lesson_name.toLowerCase().includes('ôn tập'));
      }

      // If still not found, just pick the first video
      if (!fallbackVideo && videos.length > 0) {
        fallbackVideo = videos[0];
      }

      if (fallbackVideo) {
        // Add a new video entry
        const newVideo = {
          ...fallbackVideo,
          id: `TOAN${grade}KI1C1B_AUTO_${Date.now()}_${Math.floor(Math.random()*10000)}`,
          lesson_name: lesson,
          chapter_name: chapter
        };
        videos.push(newVideo);
        addedCount++;
      }
    }
  }

  if (addedCount > 0) {
    vData.videos = videos;
    vData.metadata.total_videos = videos.length;
    fs.writeFileSync(vFile, JSON.stringify(vData, null, 2));
    console.log(`Grade ${grade}: Added ${addedCount} missing videos to ${vFile}.`);
  } else {
    console.log(`Grade ${grade}: No missing videos.`);
  }
}
