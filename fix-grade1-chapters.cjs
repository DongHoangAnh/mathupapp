const fs = require('fs');

const data1File = 'data1.json';
const data = JSON.parse(fs.readFileSync(data1File, 'utf8'));

// Based on typical Grade 1 curriculum
function getChapterForLesson(lessonId) {
  if (lessonId >= 1 && lessonId <= 9) return "Chủ đề 1. Các số đến 10";
  if (lessonId >= 10 && lessonId <= 13) return "Chủ đề 2. Phép cộng, phép trừ trong phạm vi 10";
  if (lessonId >= 14 && lessonId <= 16) return "Chủ đề 3. Khối lập phương, khối hộp chữ nhật";
  if (lessonId >= 17 && lessonId <= 20) return "Chủ đề 4. Ôn tập học kì 1";
  if (lessonId >= 21 && lessonId <= 25) return "Chủ đề 5. Các số đến 100";
  if (lessonId >= 26 && lessonId <= 28) return "Chủ đề 6. Đo lường và độ dài";
  if (lessonId >= 29 && lessonId <= 34) return "Chủ đề 7. Phép cộng, phép trừ trong phạm vi 100";
  if (lessonId >= 35 && lessonId <= 40) return "Chủ đề 8. Thời gian và Ôn tập cuối năm";
  return "Chủ đề khác";
}

let modified = 0;
data.questions.forEach(q => {
  // Extract lesson ID from lesson_name (e.g. "BÀI 1: CÁC SỐ...")
  let lessonId = q.lesson_id;
  if (!lessonId && q.lesson_name) {
    const match = q.lesson_name.match(/BÀI\s+(\d+)/i);
    if (match) lessonId = parseInt(match[1]);
  }
  
  if (lessonId) {
    const correctChapter = getChapterForLesson(lessonId);
    if (q.chapter_name !== correctChapter) {
      q.chapter_name = correctChapter;
      modified++;
    }
  }
});

if (modified > 0) {
  fs.writeFileSync(data1File, JSON.stringify(data, null, 2));
  console.log(`Updated ${modified} questions in data1.json with correct chapters.`);
}
