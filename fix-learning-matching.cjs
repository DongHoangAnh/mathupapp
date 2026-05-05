const fs = require('fs');
const file = 'client/src/pages/learning.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldMapLogic = `const mapTitleToVideos = (title: string, chapterName: string) => {
             // Create a normalized string for comparison
            const normalize = (s: string) => s.toLowerCase().trim().replace(/\\s+/g, ' ');
            const nTitle = normalize(title);
            
            return videos.filter((v: any) => {
               if (!v.lesson_name) return false;
               const nLessonName = normalize(v.lesson_name);
               // Try to match exact, or partial inclusion
               return nLessonName.includes(nTitle) || nTitle.includes(nLessonName);
            });
          };`;

const newMapLogic = `const mapTitleToVideos = (title: string, chapterName: string) => {
            // Remove common prefixes/words for better matching
            const cleanStr = (s: string) => {
              return s.toLowerCase()
                .replace(/\\s+/g, ' ')
                .replace(/bài \\d+[-:]?\\s*/g, '') // remove "Bài 1:", "Bài 2 -", etc
                .replace(/^ôn tập\\s+/g, '')
                .trim();
            };

            const nTitle = cleanStr(title);
            const nChapter = chapterName ? cleanStr(chapterName) : '';
            
            return videos.filter((v: any) => {
               if (!v.lesson_name) return false;
               const nVideoLesson = cleanStr(v.lesson_name);
               const nVideoChapter = v.chapter_name ? cleanStr(v.chapter_name) : '';
               
               // Strong match: lesson name contains the other
               if (nVideoLesson.includes(nTitle) || nTitle.includes(nVideoLesson)) {
                 return true;
               }

               // Fallback: If both are short and very similar, or chapter matches exactly
               if (nTitle.length > 5 && nVideoLesson.length > 5) {
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
               return false;
            });
          };`;

content = content.replace(oldMapLogic, newMapLogic);
fs.writeFileSync(file, content);
console.log('Video matching logic improved');
