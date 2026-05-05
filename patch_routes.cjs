const fs = require('fs');
let content = fs.readFileSync('server/routes.ts', 'utf8');

// Insert a generic GET videos route
const insertRoute = `
  app.get("/api/videos", async (req, res) => {
    try {
      const grade = String(req.query.grade || "2");
      const gradeFileMap: Record<string, string> = {
        "1": "data1.json",
        "2": "data.json",
        "3": "data3.json",
        "4": "data4.json",
        "5": "data5.json",
      };
      const dataFileName = gradeFileMap[grade] ?? "data.json";
      const dataPath = path.join(process.cwd(), dataFileName);

      if (!fs.existsSync(dataPath)) {
        return res.json([]);
      }

      const fileContent = fs.readFileSync(dataPath, "utf-8");
      const jsonData = JSON.parse(fileContent);
      
      const videos = jsonData.videos || [];
      res.json(videos);
    } catch (error) {
      console.error('[API Videos] Error:', error);
      res.status(500).json({ message: "Failed to load videos" });
    }
  });

  // Assessment Question Generation Route (from data.json or data1.json)
`;

content = content.replace('  // Assessment Question Generation Route (from data.json or data1.json)', insertRoute);

if (content.includes('/api/videos')) {
  fs.writeFileSync('server/routes.ts', content, 'utf8');
  console.log('patched');
} else {
  console.log('failed');
}
