const fs = require('fs');
const file = 'server/routes.ts';
let content = fs.readFileSync(file, 'utf8');

const oldLogic = `      const chapterMetadata: Record<string, string> = grade === "2" ? {
        "1": "Chủ đề 1. Ôn tập và bổ sung",
        "2": "Chủ đề 2. Phép cộng, phép trừ qua 10 trong phạm vi 20",
        "3": "Chủ đề 3. Phép cộng, phép trừ có nhớ trong phạm vi 100",
        "4": "Chủ đề 4. Phép nhân, phép chia",
        "5": "Chủ đề 5. Các số đến 1000",
        "6": "Chủ đề 6. Đo lường và thời gian",
        "7": "Chủ đề 7. Hình học cơ bản"
      } : {};

      questionPool.forEach((q: any) => {
        if (q.chapter_name) {
          const match = String(q.id).match(/C(\\d+)/);
          if (match && !chapterMetadata[match[1]]) {
            chapterMetadata[match[1]] = String(q.chapter_name).trim();
          }
        }
      });

      // Group IDs by Chapter (từ pool đã lọc theo kì)
      const chapterGroups: { [key: string]: string[] } = {};
      questionPool.forEach((q: any) => {
        const match = String(q.id).match(/C(\\d+)/);
        let chapter = q.chapter_name;

        // Force normalize to metadata mapping if a match exists to prevent duplicating
        // e.g "Chủ đề 1" vs "Chủ đề 1. Ôn tập"
        if (match && chapterMetadata[match[1]]) {
          chapter = chapterMetadata[match[1]];
        }

        // Final fallback
        if (!chapter) {
          chapter = match ? \`CHỦ ĐỀ \${match[1]}\` : "CHỦ ĐỀ KHÁC";
        }

        q.chapter_name = chapter; // Áp dụng lại vào memory`;

const newLogic = `      // Group IDs by Chapter (từ pool đã lọc theo kì)
      const chapterGroups: { [key: string]: string[] } = {};
      questionPool.forEach((q: any) => {
        let chapter = q.chapter_name;

        // Final fallback if missing
        if (!chapter) {
          const match = String(q.id).match(/C(\\d+)/);
          chapter = match ? \`CHỦ ĐỀ \${match[1]}\` : "CHỦ ĐỀ KHÁC";
        }

        q.chapter_name = chapter; // Áp dụng lại vào memory`;

content = content.replace(oldLogic, newLogic);
fs.writeFileSync(file, content);
console.log('Routes chapter logic fixed');
