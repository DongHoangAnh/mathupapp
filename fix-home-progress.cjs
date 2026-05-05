const fs = require('fs');
const file = 'client/src/pages/home-ocean-v2.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the calculation logic for "Bạn đã chinh phục X/Y chủ đề!"
const searchStr1 = `                                    // Bám lại vào learningPathTopics để phản ánh đúng số "trạm" trên con đường
                                    const total = learningPathTopics && learningPathTopics.length > 0 ? learningPathTopics.length : 5;
                                    const completed = learningPathTopics && learningPathTopics.length > 0
                                        ? learningPathTopics.filter(t => t.status === 'completed').length
                                        : 0;`;

const replaceStr1 = `                                    // Thay đổi logic để tính tổng số chủ đề từ knowledgeTiles (tổng hợp toàn bộ bài đánh giá) thay vì learningPath (chỉ gồm bài yếu)
                                    const total = knowledgeTiles && knowledgeTiles.length > 0 ? knowledgeTiles.length : 5;
                                    const completed = knowledgeTiles && knowledgeTiles.length > 0
                                        ? knowledgeTiles.filter((t: any) => t.strength === 'strong').length
                                        : 0;`;

if (content.includes(searchStr1)) {
    content = content.replace(searchStr1, replaceStr1);
    console.log('Replaced banner progress text');
}

// Also replace the same logic in the "Tiến Độ" card
const searchStr2 = `                                                const total = learningPathTopics && learningPathTopics.length > 0 ? learningPathTopics.length : 1;
                                                const completed = learningPathTopics && learningPathTopics.length > 0
                                                    ? learningPathTopics.filter(t => t.status === 'completed').length
                                                    : 0;
                                                const progressPercentage = Math.round((completed / total) * 100);`;

const replaceStr2 = `                                                const total = knowledgeTiles && knowledgeTiles.length > 0 ? knowledgeTiles.length : 1;
                                                const completed = knowledgeTiles && knowledgeTiles.length > 0
                                                    ? knowledgeTiles.filter((t: any) => t.strength === 'strong').length
                                                    : 0;
                                                const progressPercentage = Math.round((completed / total) * 100);`;

if (content.includes(searchStr2)) {
    content = content.replace(searchStr2, replaceStr2);
    console.log('Replaced card progress text');
}

fs.writeFileSync(file, content);
console.log('Done modifying home-ocean-v2.tsx');
