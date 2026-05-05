const fs = require('fs');
const path = require('path');

async function checkMissing() {
  const grades = [1, 2, 3, 4, 5];
  const missingByGrade = {};

  for (const grade of grades) {
    missingByGrade[grade] = [];
    
    // Read roadmap/questions data
    const questionFile = grade === 2 ? 'data.json' : `data${grade === 1 ? '1' : grade}.json`;
    if (!fs.existsSync(questionFile)) {
      console.log(`Skipping grade ${grade}, question file ${questionFile} not found`);
      continue;
    }
    
    // Read videos data
    const videoFile = `data_video${grade}.json`;
    if (!fs.existsSync(videoFile)) {
      console.log(`Skipping grade ${grade}, video file ${videoFile} not found`);
      continue;
    }

    const qData = JSON.parse(fs.readFileSync(questionFile, 'utf8'));
    const vData = JSON.parse(fs.readFileSync(videoFile, 'utf8'));
    
    const videos = vData.videos || [];
    const questions = qData.questions || [];

    // Extract unique lessons from questions
    const uniqueLessons = new Set();
    const lessonInfo = {};
    
    questions.forEach(q => {
      // Normalize lesson string
      if (q.lesson_name) {
        const lessonStr = q.lesson_name.trim();
        uniqueLessons.add(lessonStr);
        lessonInfo[lessonStr] = {
           chapter: q.chapter_name || 'Chủ đề khác',
           name: lessonStr
        };
      } else if (q.chapter_name) {
        // Fallback to chapter if no lesson
        const chapterStr = q.chapter_name.trim();
        uniqueLessons.add(chapterStr);
        lessonInfo[chapterStr] = {
           chapter: chapterStr,
           name: chapterStr
        };
      }
    });

    const normalizeStr = (s) => s ? s.toLowerCase().trim().replace(/\s+/g, ' ') : '';

    for (const lesson of uniqueLessons) {
      const info = lessonInfo[lesson];
      const nTitle = normalizeStr(info.name);
      
      const hasVideo = videos.some(v => {
        if (!v.lesson_name) return false;
        const nVideoLesson = normalizeStr(v.lesson_name);
        return nVideoLesson.includes(nTitle) || nTitle.includes(nVideoLesson);
      });

      if (!hasVideo) {
        missingByGrade[grade].push(info.name);
      }
    }
    
    console.log(`Grade ${grade}: Found ${uniqueLessons.size} unique lessons. Missing videos for ${missingByGrade[grade].length} lessons.`);
  }

  // Print results
  for (const [grade, missing] of Object.entries(missingByGrade)) {
    if (missing.length > 0) {
      console.log(`\n--- LỚP ${grade}: CÁC BÀI THIẾU VIDEO (${missing.length} bài) ---`);
      // Just print first 10 to not overflow
      missing.slice(0, 10).forEach(m => console.log(`- ${m}`));
      if (missing.length > 10) {
        console.log(`... và ${missing.length - 10} bài khác.`);
      }
    } else if (missingByGrade[grade]) {
      console.log(`\n--- LỚP ${grade}: TẤT CẢ BÀI ĐỀU ĐÃ CÓ VIDEO ---`);
    }
  }
}

checkMissing().catch(console.error);
