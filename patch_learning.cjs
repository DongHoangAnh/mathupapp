const fs = require('fs');

const file = 'client/src/pages/learning.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacement = `
  useEffect(() => {
    const fetchPath = async () => {
      let lessons: any[] = [];
      const storedUser = JSON.parse(localStorage.getItem('mathocean_user') || 'null');
      const userId = storedUser?.id;

      try {
        if (userId) {
          const res = await fetch(\`/api/learning-paths/\${userId}\`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.topics) {
              const sortedTopics = [...data.topics].sort((a, b) =>
                String(a.chapter).localeCompare(String(b.chapter), undefined, { numeric: true, sensitivity: 'base' })
              );

              sortedTopics.forEach((topic: any) => {
                if (topic.lessons && Array.isArray(topic.lessons)) {
                  const sortedLessons = [...topic.lessons].sort((a, b) =>
                    String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' })
                  );
                  sortedLessons.forEach((lessonName: string) => {
                    lessons.push({
                      chapter: topic.chapter,
                      title: lessonName,
                      completed: false
                    });
                  });
                } else {
                  lessons.push({
                    chapter: topic.chapter,
                    title: "Ôn tập " + (topic.chapter || "Chủ đề"),
                    completed: false
                  });
                }
              });

              if (data.estimated_duration) {
                setLearningDuration(data.estimated_duration.replace(" days", ""));
              }
            }
          }
        }
      } catch (e) {
        console.error('Supabase fetch failed', e);
      }

      // Fallback
      if (lessons.length === 0) {
        const storedDuration = localStorage.getItem('math_learning_duration');
        const storedMap = localStorage.getItem('math_knowledge_map');
        if (storedDuration) setLearningDuration(storedDuration);

        if (storedMap) {
          try {
            const map = JSON.parse(storedMap);
            const sortedWeakEntries = Object.entries(map)
              .filter(([_, data]: any) => data.status === 'Hổng' || data.needsWork)
              .sort(([chapA], [chapB]) => String(chapA).localeCompare(String(chapB), undefined, { numeric: true, sensitivity: 'base' }));

            sortedWeakEntries.forEach(([chapter, data]: any) => {
              if (data.lessons && Array.isArray(data.lessons)) {
                const sortedLessons = [...data.lessons].sort((a, b) =>
                  String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' })
                );
                sortedLessons.forEach((lessonName: string) => {
                  lessons.push({
                    chapter,
                    title: lessonName,
                    completed: false
                  });
                });
              } else {
                lessons.push({
                  chapter,
                  title: "Ôn tập " + chapter,
                  completed: false
                });
              }
            });
          } catch (e) {
            console.error("Failed to parse knowledge map", e);
          }
        }
      }

      // Load videos based on grade and map to lessons
      try {
        const grade = storedUser?.grade || "2";
        const videoRes = await fetch(\`/api/videos?grade=\${grade}\`);
        const videos = await videoRes.json();

        if (videos && videos.length > 0) {
          const mapTitleToVideos = (title: string, chapterName: string) => {
             // Create a normalized string for comparison
            const normalize = (s: string) => s.toLowerCase().trim().replace(/\\s+/g, ' ');
            const nTitle = normalize(title);
            
            return videos.filter((v: any) => {
               if (!v.lesson_name) return false;
               const nLessonName = normalize(v.lesson_name);
               // Try to match exact, or partial inclusion
               return nLessonName.includes(nTitle) || nTitle.includes(nLessonName);
            });
          };

          lessons.forEach((l: any) => {
            const matchedVideos = mapTitleToVideos(l.title, l.chapter);
            if (matchedVideos.length > 0) {
              l.videos = matchedVideos;
            }
          });
        }
      } catch (e) {
        console.error("Failed to fetch videos", e);
      }

      setWeakLessons(lessons);
      if (lessons.length > 0) {
        setActiveLesson(lessons[0]);
      }
    };

    fetchPath();
  }, []);
`;

const regex = /useEffect\(\(\) => \{\s*const fetchPath = async \(\) => \{[\s\S]*?fetchPath\(\);\s*\}, \[\]\);/m;
content = content.replace(regex, replacement.trim());
fs.writeFileSync(file, content);
console.log('patched');
