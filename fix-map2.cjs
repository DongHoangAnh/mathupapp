const fs = require('fs');
const file = 'client/src/pages/learning.tsx';
let content = fs.readFileSync(file, 'utf8');

// The fallback matching logic had a bug that always returns false if first condition fails
// We need to fix the logic structure
const oldLogic = `               if (nTitle.length > 5 && nVideoLesson.length > 5) {
                  // check if words overlap significantly
                  const titleWords = nTitle.split(' ');
                  const matchCount = titleWords.filter(w => w.length > 2 && nVideoLesson.includes(w)).length;
                  if (matchCount >= Math.min(titleWords.length, 3)) {
                     // Check chapter to be safe if we rely on word matching
                     if (nChapter && nVideoChapter && (nChapter.includes(nVideoChapter) || nVideoChapter.includes(nChapter))) {
                         return true;
                     }
                  }
               }
               return false;`;

const newLogic = `               if (nTitle.length > 5 && nVideoLesson.length > 5) {
                  const titleWords = nTitle.split(' ').filter(w => w.length > 2);
                  if (titleWords.length > 0) {
                      const matchCount = titleWords.filter(w => nVideoLesson.includes(w)).length;
                      if (matchCount >= Math.ceil(titleWords.length * 0.7)) { // 70% of meaningful words match
                         return true;
                      }
                  }
               }

               // If the lesson is just "Ôn tập [Chương]" then match with any video that is a review for that chapter
               if (nTitle.includes('ôn tập') || title.toLowerCase().startsWith('ôn tập')) {
                  if (nChapter && nVideoChapter && (nVideoChapter.includes(nChapter) || nChapter.includes(nVideoChapter))) {
                      // Check if video is also a review
                      if (nVideoLesson.includes('ôn tập') || nVideoLesson.includes('luyện tập') || nVideoLesson.includes('kiểm tra')) {
                          return true;
                      }
                  }
               }

               return false;`;

content = content.replace(oldLogic, newLogic);

// Add fallback video if still no match found
const oldFallback = `          lessons.forEach((l: any) => {
            const matchedVideos = mapTitleToVideos(l.title, l.chapter);
            if (matchedVideos.length > 0) {
              l.videos = matchedVideos;
            }
          });`;

const newFallback = `          // Filter review videos for fallback
          const reviewVideos = videos.filter((v: any) => 
            v.lesson_name && (v.lesson_name.toLowerCase().includes('ôn tập') || v.lesson_name.toLowerCase().includes('luyện tập'))
          );

          lessons.forEach((l: any) => {
            let matchedVideos = mapTitleToVideos(l.title, l.chapter);
            
            // If strictly no video matched, try to find a chapter-level review video
            if (matchedVideos.length === 0 && l.chapter) {
                const nChapter = l.chapter.toLowerCase().replace(/\\s+/g, ' ');
                matchedVideos = reviewVideos.filter((v: any) => 
                   v.chapter_name && v.chapter_name.toLowerCase().replace(/\\s+/g, ' ').includes(nChapter)
                );
            }

            // Ultimate fallback: Just take any video from the same chapter
            if (matchedVideos.length === 0 && l.chapter) {
                const nChapter = l.chapter.toLowerCase().replace(/\\s+/g, ' ');
                matchedVideos = videos.filter((v: any) => 
                   v.chapter_name && v.chapter_name.toLowerCase().replace(/\\s+/g, ' ').includes(nChapter)
                );
            }

            if (matchedVideos.length > 0) {
              l.videos = matchedVideos;
            }
          });`;

content = content.replace(oldFallback, newFallback);

fs.writeFileSync(file, content);
console.log('Video matching logic improved with smart fallback');
