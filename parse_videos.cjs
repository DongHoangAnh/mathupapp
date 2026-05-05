const fs = require('fs');

function parseTextToJson(grade, filename) {
    const content = fs.readFileSync(filename, 'utf-8');
    const lines = content.split('\n');
    
    const videos = [];
    let currentChapter = `Chương 1`; // Default if not specified
    let currentLesson = "";
    let lessonCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Skip header lines
        if (line.toLowerCase().startsWith('toan lop') || 
            line.toLowerCase().startsWith('link') || 
            line.toLowerCase().startsWith('kì 1') || 
            line.toLowerCase().startsWith('kì 2') ||
            line.includes('drive.google.com') ||
            line === 'Tập 1:' || line === 'Tập 2:' ||
            line.startsWith('https: //youtube.com/playlist')) {
            continue;
        }
        
        // Check for Chapter
        if (line.toLowerCase().startsWith('chủ đề') || line.toLowerCase().startsWith('chương')) {
            currentChapter = line;
            continue;
        }
        
        // Check for Lesson
        if (line.toLowerCase().startsWith('bài') || /^\d+\.\s*bài/i.test(line)) {
            currentLesson = line;
            lessonCount++;
            continue;
        }
        
        // Check for Video URL
        if (line.startsWith('http')) {
            // Clean up the URL (sometimes there's a space after https:)
            let url = line.replace('https: //', 'https://').replace('http: //', 'http://');
            
            if (!currentLesson) {
                currentLesson = `Bài ${lessonCount + 1}`;
                lessonCount++;
            }
            
            videos.push({
                id: `TOAN${grade}KI1C1B${lessonCount}V${videos.filter(v => v.lesson_name === currentLesson).length + 1}`,
                lesson_id: lessonCount,
                chapter_name: currentChapter,
                lesson_name: currentLesson,
                type: "video",
                video_url: url,
                file_path: `TOAN_LOP_${grade}/HK1/BAI_${lessonCount}_VIDEO`
            });
        }
    }
    
    return {
        metadata: {
            total_videos: videos.length,
            subject: "math",
            grade: grade
        },
        videos: videos
    };
}

// Read and convert 3, 4, 5
[3, 4, 5].forEach(grade => {
    try {
        const json = parseTextToJson(grade, `data_video${grade}.json`);
        fs.writeFileSync(`data_video${grade}.json`, JSON.stringify(json, null, 2));
        console.log(`Converted data_video${grade}.json`);
    } catch (e) {
        console.error(`Error converting grade ${grade}:`, e);
    }
});
