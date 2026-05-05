import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertAssessmentSchema, insertGameScoreSchema, insertLearningPathSchema } from "@shared/schema";
import { getChatResponse, generateMiniQuiz, buildOntologyContext, analyzeMathDrawing } from "./openai";
import adaptiveRoutes from "./adaptive-routes";
import optimizedAdaptiveRoutes from "./optimized-adaptive-routes";
import performanceRoutes from "./performance-routes";
import { getUserMatchHistory, supabaseServer } from "./supabase-server";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Fix for __dirname in ESM if needed, though usually not needed if using standard fs with absolute paths or process.cwd()
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function registerRoutes(app: Express): Promise<Server> {
  // Adaptive Learning routes (original)
  app.use("/api/adaptive", adaptiveRoutes);

  // Optimized Adaptive Learning routes
  app.use("/api/adaptive-optimized", optimizedAdaptiveRoutes);

  // Performance monitoring routes
  app.use("/api/performance", performanceRoutes);

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);

      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser(userData);
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);

      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const updates = req.body;
      const user = await storage.updateUser(req.params.id, updates);
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Assessment routes
  app.post("/api/assessments", async (req, res) => {
    try {
      const assessmentData = insertAssessmentSchema.parse(req.body);
      const assessment = await storage.createAssessment(assessmentData);
      res.json(assessment);
    } catch (error) {
      res.status(400).json({ message: "Invalid assessment data" });
    }
  });

  app.get("/api/assessments/user/:userId", async (req, res) => {
    try {
      const assessments = await storage.getAssessmentsByUser(req.params.userId);
      res.json(assessments);
    } catch (error) {
      res.status(500).json({ message: "Failed to get assessments" });
    }
  });

  // ============================================================
  // POST /api/assessments/analyze
  // Không dùng AI — đánh giá thuần theo data: làm sai chương nào thì chương đó yếu.
  // Nhận knowledgeMap (đã aggregate theo chapter từ client), trả về analysis + lưu Supabase.
  // ============================================================
  app.post("/api/assessments/analyze", async (req, res) => {
    try {
      const { responseLogs, userId, userGrade, overallScore, totalQuestions, knowledgeMap: bodyMap, learningDuration } = req.body;
      const responseLogsArr = Array.isArray(responseLogs) ? responseLogs : [];
      const knowledgeMap = bodyMap && typeof bodyMap === "object" ? bodyMap : {};

      if (responseLogsArr.length === 0 && Object.keys(knowledgeMap).length === 0) {
        return res.status(400).json({ message: "responseLogs or knowledgeMap is required" });
      }

      // Nếu client không gửi knowledgeMap thì aggregate từ responseLogs (cùng logic client)
      let mapToUse = knowledgeMap;
      if (Object.keys(mapToUse).length === 0 && responseLogsArr.length > 0) {
        const chapterStats: Record<string, { correct: number; total: number; lessons: string[] }> = {};
        responseLogsArr.forEach((r: any) => {
          const key = r.chapter || r.topic || "Chương khác";
          if (!chapterStats[key]) chapterStats[key] = { correct: 0, total: 0, lessons: [] };
          chapterStats[key].total++;
          if (r.isCorrect) chapterStats[key].correct++;
          if (r.lesson && !chapterStats[key].lessons.includes(r.lesson)) chapterStats[key].lessons.push(r.lesson);
        });
        mapToUse = {};
        Object.entries(chapterStats).forEach(([chapter, stats]) => {
          const rate = stats.total > 0 ? stats.correct / stats.total : 0;
          (mapToUse as any)[chapter] = {
            status: rate >= 0.7 ? "Vững" : "Hổng",
            needsWork: rate < 0.7,
            lessons: stats.lessons,
            correct: stats.correct,
            total: stats.total
          };
        });
      }

      const totalQuestionsCount = totalQuestions ?? responseLogsArr.length;
      const correctCount = responseLogsArr.length > 0
        ? responseLogsArr.filter((r: any) => r.isCorrect).length
        : Object.values(mapToUse).reduce((sum: number, d: any) => sum + (d.correct || 0), 0);
      const overallScoreNum = totalQuestionsCount > 0 ? Math.round((correctCount / totalQuestionsCount) * 100) : (overallScore ?? 0);

      // Build analysis thuần từ map (mapping đúng theo chương/bài từ data)
      const tiles = Object.entries(mapToUse).map(([name, data]: [string, any]) => {
        const total = data.total || 0;
        const correct = data.correct || 0;
        const score = total > 0 ? Math.round((correct / total) * 100) : 0;
        const needsWork = data.needsWork === true || data.status === "Hổng";
        return {
          id: name.slice(0, 3).toUpperCase().replace(/\s/g, "") || "CH",
          name,
          strength: needsWork ? "weak" : "strong",
          score,
          totalQuestions: total,
          correctAnswers: correct,
          needsPractice: needsWork,
          priority: needsWork ? (score < 50 ? 1 : 2) : 3
        };
      });
      const weakTopics = tiles.filter((t: any) => t.needsPractice).sort((a: any, b: any) => a.score - b.score);
      const strongTopics = tiles.filter((t: any) => !t.needsPractice);

      const learningPath = weakTopics.slice(0, 8).map((t: any, i: number) => ({
        order: i + 1,
        topic: t.name,
        emoji: ["🌱", "📚", "📐", "🔢", "📊", "🧮", "📏", "📖"][i] || "📖",
        status: i === 0 ? "current" : "upcoming",
        estimatedWeeks: t.score < 40 ? 3 : t.score < 70 ? 2 : 1,
        reason: `Luyện tập chủ đề: ${t.name}`
      }));

      const summary = overallScoreNum >= 80
        ? `Xuất sắc! Em đã nắm vững ${strongTopics.length} chủ đề với điểm số rất tốt.`
        : overallScoreNum >= 60
          ? `Khá tốt! Em đạt ${overallScoreNum}%. Có ${weakTopics.length} chủ đề cần ôn luyện thêm.`
          : `Em đạt ${overallScoreNum}%. Lộ trình sẽ giúp em cải thiện từng bước!`;

      const analysis = {
        overallScore: overallScoreNum,
        totalQuestions: totalQuestionsCount,
        correctAnswers: correctCount,
        knowledgeTiles: tiles,
        learningPath,
        summary,
        strengths: strongTopics.map((t: any) => t.name),
        weaknesses: weakTopics.map((t: any) => t.name)
      };

      console.log(`[Assessment Analyze] Data-based analysis for user ${userId}, ${weakTopics.length} weak topics`);

      if (userId && supabaseServer) {
        try {
          await supabaseServer
            .from("user_assessment_results")
            .upsert({
              user_id: userId,
              score: analysis.overallScore,
              total_questions: analysis.totalQuestions,
              correct_answers: analysis.correctAnswers,
              knowledge_tiles: JSON.stringify(analysis.knowledgeTiles),
              learning_path: JSON.stringify(analysis.learningPath),
              summary: analysis.summary,
              strengths: JSON.stringify(analysis.strengths),
              weaknesses: JSON.stringify(analysis.weaknesses),
              response_logs: JSON.stringify(responseLogsArr),
              assessed_at: new Date().toISOString()
            }, { onConflict: "user_id" });

          const duration = learningDuration || "30";
          if (Object.keys(mapToUse).length > 0) {
            const weakChapters = Object.entries(mapToUse)
              .filter(([_, data]: any) => data.status === "Hổng" || data.needsWork)
              .sort(([a], [b]) => String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" }))
              .map(([chapter, data]: any) => ({
                chapter,
                lessons: (data.lessons || []).sort((a: string, b: string) => String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" })),
                status: "pending"
              }));

            await supabaseServer.from("learning_paths").delete().eq("user_id", userId);
            await supabaseServer.from("learning_paths").insert({
              user_id: userId,
              title: `Lộ trình ${duration} ngày`,
              subject: "math",
              estimated_duration: `${duration} days`,
              topics: weakChapters,
              status: "active",
              priority: "foundational-gaps"
            });
          }
        } catch (dbError) {
          console.error("[Assessment Analyze] DB save failed:", dbError);
        }
      }

      res.json({ success: true, analysis });
    } catch (error) {
      console.error("[Assessment Analyze] Error:", error);
      res.status(500).json({ message: "Failed to analyze assessment" });
    }
  });

  // Learning path routes
  app.post("/api/learning-paths", async (req, res) => {
    try {
      const learningPathData = insertLearningPathSchema.parse(req.body);
      const path = await storage.createLearningPath(learningPathData);
      res.json(path);
    } catch (error) {
      res.status(400).json({ message: "Invalid learning path data" });
    }
  });

  app.get("/api/learning-paths/user/:userId", async (req, res) => {
    try {
      const paths = await storage.getLearningPathsByUser(req.params.userId);
      res.json(paths);
    } catch (error) {
      res.status(500).json({ message: "Failed to get learning paths" });
    }
  });


  app.get("/api/videos", async (req, res) => {
    try {
      const grade = String(req.query.grade || "2");
      const gradeFileMap: Record<string, string> = {
        "1": "data_video1.json",
        "2": "data_video2.json",
        "3": "data_video3.json",
        "4": "data_video4.json",
        "5": "data_video5.json",
      };
      const dataFileName = gradeFileMap[grade] ?? "data_video2.json";
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

  // Query params: grade (1|2, default 2), semester (1|2, default 1)
  app.get("/api/assessment-questions", async (req, res) => {
    try {
      const grade = String(req.query.grade || "2");

      // Map data file theo khối lớp:
      // Lớp 1 → data1.json  |  Lớp 2 → data.json  |  Lớp 3 → data3.json
      // Lớp 4 → data4.json  |  Lớp 5 → data5.json
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
        return res.status(404).json({ message: `Data file for grade ${grade} not found` });
      }

      const fileContent = fs.readFileSync(dataPath, "utf-8");
      const jsonData = JSON.parse(fileContent);
      const allQuestions = jsonData.questions;

      // Lọc theo kì học: đọc marker KI1/KI2 trong ID câu hỏi
      // semester=1 → chỉ lấy câu có KI1 trong ID
      // semester=2 → chỉ lấy câu có KI2 trong ID
      // Nếu file không có đủ 2 kì (vd: data1.json chỉ có KI1) → bỏ qua filter, lấy tất cả
      const semester = String(req.query.semester || "1");
      const semesterMarker = `KI${semester}`;
      const bySemester = allQuestions.filter((q: any) =>
        q.id && q.id.includes(semesterMarker)
      );
      // Dùng pool đã lọc nếu có đủ câu (ít nhất 20), ngược lại dùng toàn bộ
      const questionPool = bySemester.length >= 20 ? bySemester : allQuestions;
      console.log(
        `[API] grade=${grade} semester=${semester}: pool=${questionPool.length}/${allQuestions.length} (filter="${semesterMarker}", fallback=${bySemester.length < 20})`
      );

      // 1. Build chapter number -> full display name từ TOÀN BỘ file
      // Ưu tiên: chapter_name nếu có; nếu không có thì lấy lesson_name của câu đầu tiên trong chương đó
      const chapterNumToName: Record<string, string> = {};
      allQuestions.forEach((q: any) => {
        const match = String(q.id).match(/C(\d+)/);
        if (match && q.chapter_name && String(q.chapter_name).trim()) {
          const num = match[1];
          if (!chapterNumToName[num]) chapterNumToName[num] = String(q.chapter_name).trim();
        }
      });
      // Fallback: chương không có chapter_name → lấy lesson_name của BÀI ĐẦU TIÊN trong chương (id dạng C(n)B(m), lấy m nhỏ nhất)
      const firstQuestionByChapter: Record<string, any> = {};
      allQuestions.forEach((q: any) => {
        const match = String(q.id).match(/C(\d+)B(\d+)/);
        if (!match) return;
        const [, cNum, bNum] = match;
        if (chapterNumToName[cNum]) return;
        const prev = firstQuestionByChapter[cNum];
        if (!prev || parseInt(bNum, 10) < parseInt(prev.bNum, 10)) {
          firstQuestionByChapter[cNum] = { q, bNum };
        }
      });
      Object.entries(firstQuestionByChapter).forEach(([num, { q }]) => {
        if (chapterNumToName[num]) return;
        const lessonName = q.lesson_name && String(q.lesson_name).trim();
        chapterNumToName[num] = lessonName
          ? `Chủ đề ${num}. ${lessonName.replace(/^BÀI\s*\d+\s*[–\-]\s*/i, "").trim()}`
          : `Chủ đề ${num}`;
      });

      // 2. Group IDs by Chapter, dùng tên đầy đủ làm key thống nhất (mapping đúng theo data)
      const chapterGroups: { [key: string]: string[] } = {};
      questionPool.forEach((q: any) => {
        let chapter = q.chapter_name;
        if (!chapter || !String(chapter).trim()) {
          const match = String(q.id).match(/C(\d+)/);
          const num = match ? match[1] : null;
          chapter = (num && chapterNumToName[num]) ? chapterNumToName[num] : (match ? `CHỦ ĐỀ ${match[1]}` : "CHỦ ĐỀ KHÁC");
        }
        q.chapter_name = chapter;

        if (!chapterGroups[chapter]) {
          chapterGroups[chapter] = [];
        }
        chapterGroups[chapter].push(q.id);
      });

      const chapters = Object.keys(chapterGroups);
      const totalNeeded = 40;
      const numChapters = chapters.length;
      const baseCountPerChapter = Math.floor(totalNeeded / numChapters);

      let selectedIds: string[] = [];
      const usedIds = new Set<string>();

      // 1. Pick base count from each chapter
      chapters.forEach(chap => {
        const ids = chapterGroups[chap];
        // Shuffle ids for this chapter
        const shuffled = [...ids].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, baseCountPerChapter);
        selected.forEach(id => {
          selectedIds.push(id);
          usedIds.add(id);
        });
      });

      // 2. Fill remaining slots randomly from ANY chapter (của pool đã lọc)
      let remainingNeeded = totalNeeded - selectedIds.length;
      if (remainingNeeded > 0) {
        const remainingCandidates = questionPool
          .filter((q: any) => !usedIds.has(q.id))
          .map((q: any) => q.id);

        const shuffledRemaining = remainingCandidates.sort(() => 0.5 - Math.random());
        const extraIds = shuffledRemaining.slice(0, remainingNeeded);
        selectedIds = [...selectedIds, ...extraIds];
      }

      // 3. Map IDs back to full question data và format cho frontend
      const finalQuestions = selectedIds.map(id => {
        const q = questionPool.find((item: any) => item.id === id);

        // Map difficulty string to number
        let difficultyLevel = 2; // Default T (Thông hiểu)
        if (q.difficulty === "N") difficultyLevel = 1;
        if (q.difficulty === "T") difficultyLevel = 2;
        if (q.difficulty === "V") difficultyLevel = 3;
        if (q.difficulty === "VC") difficultyLevel = 4;

        const chapterName = q.chapter_name;

        return {
          id: q.id,
          question: q.content,
          options: q.choices,
          correctAnswer: q.choices[q.correct_answer],
          explanation: q.explanation,
          topic: q.lesson_name || chapterName, // Use lesson name or chapter for granularity
          chapter: chapterName,
          lesson: q.lesson_name,
          difficulty: difficultyLevel,
          misconceptions: [] // Dataset doesn't have misconceptions yet
        };
      });

      res.json(finalQuestions);
    } catch (error) {
      console.error("Failed to generate assessment questions:", error);
      res.status(500).json({ message: "Failed to generate assessment questions" });
    }
  });

  // Question routes
  app.get("/api/questions/:subject", async (req, res) => {
    try {
      const { subject } = req.params;
      const { topic, count, difficulty } = req.query;

      if (count) {
        const questions = await storage.getRandomQuestions(
          subject,
          parseInt(count as string),
          difficulty ? parseInt(difficulty as string) : undefined
        );
        res.json(questions);
      } else {
        const questions = await storage.getQuestionsBySubjectAndTopic(subject, topic as string);
        res.json(questions);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to get questions" });
    }
  });

  // Game score routes
  app.post("/api/game-scores", async (req, res) => {
    try {
      const scoreData = insertGameScoreSchema.parse(req.body);
      const score = await storage.createGameScore(scoreData);
      res.json(score);
    } catch (error) {
      res.status(400).json({ message: "Invalid score data" });
    }
  });

  app.get("/api/leaderboard", async (req, res) => {
    try {
      const { limit } = req.query;
      const scores = await storage.getTopGameScores(limit ? parseInt(limit as string) : 10);
      res.json(scores);
    } catch (error) {
      res.status(500).json({ message: "Failed to get leaderboard" });
    }
  });

  // AI Chat routes
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, context, errorPatterns, shapeData, imageData } = req.body;
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      // Handle suggested questions with detailed responses
      const suggestedQuestionResponses: { [key: string]: string } = {
        "Làm thế nào để xác định hệ số góc từ đồ thị?": `📈 **Cách xác định hệ số góc từ đồ thị**

🎯 **Phương pháp 1: Sử dụng hai điểm**
1. Chọn 2 điểm bất kỳ trên đường thẳng: (x₁, y₁) và (x₂, y₂)
2. Áp dụng công thức: a = (y₂ - y₁) / (x₂ - x₁)

📊 **Phương pháp 2: Quan sát độ dốc**
- Nếu đường thẳng đi lên từ trái sang phải → a > 0
- Nếu đường thẳng đi xuống từ trái sang phải → a < 0
- Đường thẳng càng dốc → |a| càng lớn

💡 **Ví dụ thực tế:**
Từ điểm (0, 2) đến (2, 6):
a = (6 - 2) / (2 - 0) = 4/2 = 2

🔍 **Mẹo nhớ:**
Hệ số góc = Độ thay đổi của y / Độ thay đổi của x`,

        "Tại sao đồ thị hàm số bậc nhất luôn là đường thẳng?": `📐 **Tại sao đồ thị hàm số bậc nhất là đường thẳng?**

🎯 **Lý do toán học:**
Hàm số bậc nhất có dạng y = ax + b
- Đây là phương trình tuyến tính
- Tỷ lệ thay đổi giữa x và y luôn không đổi (= a)

📊 **Giải thích trực quan:**
- Khi x tăng 1 đơn vị → y tăng a đơn vị
- Sự thay đổi đều đặn này tạo ra đường thẳng
- Không có sự cong vênh hay bẻ khúc

💡 **So sánh với hàm khác:**
- Hàm bậc 2: y = ax² + bx + c → Parabol (cong)
- Hàm bậc 1: y = ax + b → Đường thẳng
- Hàm số căn: y = √x → Đường cong

🤔 **Thí nghiệm tư duy:**
Thử vẽ các điểm (0,b), (1,a+b), (2,2a+b)...
Bạn sẽ thấy chúng thẳng hàng!`,

        "Cách tìm giao điểm của hai đường thẳng?": `⚡ **Tìm giao điểm của hai đường thẳng**

🎯 **Phương pháp giải:**
Cho: y = a₁x + b₁ và y = a₂x + b₂
Tại giao điểm: y₁ = y₂

📝 **Các bước thực hiện:**
1. **Lập phương trình:** a₁x + b₁ = a₂x + b₂
2. **Giải tìm x:** (a₁ - a₂)x = b₂ - b₁ → x = (b₂ - b₁)/(a₁ - a₂)
3. **Tìm y:** Thay x vào một trong hai phương trình

💡 **Ví dụ chi tiết:**
y = 2x + 1 và y = -x + 4
→ 2x + 1 = -x + 4
→ 3x = 3
→ x = 1
→ y = 2(1) + 1 = 3
→ Giao điểm: (1, 3)

⚠️ **Trường hợp đặc biệt:**
- Nếu a₁ = a₂ và b₁ ≠ b₂ → Song song (không có giao điểm)
- Nếu a₁ = a₂ và b₁ = b₂ → Trùng nhau (vô số giao điểm)`,

        "Ý nghĩa của tung độ gốc trong thực tế?": `🌟 **Ý nghĩa thực tế của tung độ gốc (b)**

🎯 **Định nghĩa:**
Tung độ gốc là giá trị y khi x = 0
Trong y = ax + b, tung độ gốc là b

🏠 **Ví dụ thực tế:**

**1. Chi phí điện thoại:**
y = 50x + 200 (ngàn đồng)
- x: số phút gọi
- 200: phí cố định hàng tháng (tung độ gốc)
- 50: giá mỗi phút gọi

**2. Nhiệt độ và độ cao:**
y = -6x + 20 (°C)
- x: độ cao (km)
- 20: nhiệt độ tại mực nước biển (tung độ gốc)
- -6: nhiệt độ giảm 6°C mỗi km

**3. Tiết kiệm tiền:**
y = 100x + 500 (ngàn đồng)
- x: số tháng
- 500: số tiền ban đầu (tung độ gốc)
- 100: số tiền tiết kiệm mỗi tháng

💡 **Tóm lại:**
Tung độ gốc = Giá trị khởi điểm, điều kiện ban đầu`,

        "Khi nào hai đường thẳng song song với nhau?": `📏 **Điều kiện để hai đường thẳng song song**

🎯 **Điều kiện chính:**
Hai đường thẳng y = a₁x + b₁ và y = a₂x + b₂ song song khi:
- **a₁ = a₂** (cùng hệ số góc)
- **b₁ ≠ b₂** (khác tung độ gốc)

📊 **Giải thích trực quan:**
- Cùng hệ số góc → cùng độ dốc
- Khác tung độ gốc → khác vị trí xuất phát
- Kết quả: hai đường thẳng không bao giờ cắt nhau

💡 **Ví dụ cụ thể:**
- y = 2x + 3 và y = 2x + 5 → Song song
- y = -x + 1 và y = -x - 2 → Song song
- y = 3x + 4 và y = 3x + 4 → Trùng nhau (không phải song song)

🔍 **Ứng dụng thực tế:**
- Đường ray xe lửa
- Làn đường cao tốc
- Các tầng trong tòa nhà

⚠️ **Lưu ý quan trọng:**
Nếu a₁ = a₂ VÀ b₁ = b₂ → hai đường thẳng trùng nhau (không song song)`
      };

      // Check if message matches any suggested question
      for (const [question, response] of Object.entries(suggestedQuestionResponses)) {
        if (message.includes(question)) {
          return res.json({ response });
        }
      }

      // Check for learning intent keywords
      const learningKeywords = ['muốn học', 'muốn được học', 'học môn', 'học', 'tôi muốn học', 'em muốn học', 'hôm nay tôi muốn', 'hôm nay em muốn'];
      const messageLower = message.toLowerCase();
      const hasLearningIntent = learningKeywords.some(keyword => messageLower.includes(keyword));

      if (hasLearningIntent) {
        return res.json({
          response: "Tôi rất sẵn lòng được giúp bạn! Hãy bấm vào tính năng để tôi được hiểu bạn và tạo lộ trình học tập phù hợp nhất nhé! 🎯✨",
          cta: {
            text: "Bắt đầu cá nhân hoá",
            href: "/onboarding"
          }
        });
      }

      // Handle visual questions with shape data or image data
      if (shapeData || imageData) {
        // Mock responses for different math topics based on lesson content
        const mockMathResponses = [
          {
            content: `📐 **Hàm số bậc nhất** - Phần bạn đã chọn

🎯 **Khái niệm chính:**
Hàm số bậc nhất có dạng y = ax + b (a ≠ 0)
- a: hệ số góc (độ dốc của đường thẳng)
- b: tung độ gốc (điểm cắt trục y)

📊 **Đặc điểm đồ thị:**
- Đồ thị là đường thẳng
- Nếu a > 0: hàm số đồng biến
- Nếu a < 0: hàm số nghịch biến

💡 **Ví dụ thực tế:**
y = 2x + 3 có nghĩa là:
- Mỗi khi x tăng 1, y tăng 2
- Khi x = 0, y = 3

🤔 **Câu hỏi kiểm tra hiểu:**
Với hàm số y = -x + 5, hãy tìm giá trị y khi x = 2?`
          },
          {
            content: `📈 **Cách vẽ đồ thị hàm số bậc nhất**

🎯 **Bước 1: Tìm 2 điểm**
- Cho x = 0 → tìm y
- Cho y = 0 → tìm x

📝 **Bước 2: Vẽ đường thẳng**
- Nối 2 điểm vừa tìm được
- Kéo dài thành đường thẳng

💡 **Mẹo nhớ:**
- Hệ số a dương: đường thẳng đi lên từ trái sang phải
- Hệ số a âm: đường thẳng đi xuống từ trái sang phải

🔍 **Lưu ý quan trọng:**
Đồ thị hàm số bậc nhất luôn là đường thẳng không qua gốc tọa độ (trừ khi b = 0)`
          },
          {
            content: `⚡ **Tìm giao điểm của hai đường thẳng**

🎯 **Phương pháp:**
Cho y₁ = a₁x + b₁ và y₂ = a₂x + b₂
Tại giao điểm: y₁ = y₂

📝 **Các bước giải:**
1. Lập phương trình: a₁x + b₁ = a₂x + b₂
2. Giải phương trình tìm x
3. Thay x vào một trong hai hàm để tìm y

💡 **Ví dụ cụ thể:**
y = 2x + 1 và y = -x + 4
→ 2x + 1 = -x + 4
→ 3x = 3
→ x = 1, y = 3
→ Giao điểm: (1; 3)

🤓 **Kiến thức mở rộng:**
Hai đường thẳng song song khi a₁ = a₂ nhưng b₁ ≠ b₂`
          }
        ];

        // Select random response or based on position
        const responseIndex = Math.floor(Math.random() * mockMathResponses.length);
        const selectedResponse = mockMathResponses[responseIndex];

        return res.json({ response: selectedResponse.content });
      }

      const augmented = [context, buildOntologyContext(context)].filter(Boolean).join("\n\n");
      const response = await getChatResponse(message, augmented, errorPatterns);
      res.json({ response });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ message: "Failed to get AI response" });
    }
  });

  // Generate mini quiz for reinforcement learning
  app.post("/api/mini-quiz", async (req, res) => {
    try {
      const { topic, difficulty } = req.body;
      if (!topic || !difficulty) {
        return res.status(400).json({ message: "Topic and difficulty are required" });
      }

      const questions = await generateMiniQuiz(topic, difficulty);
      res.json({ questions });
    } catch (error) {
      console.error("Mini quiz generation error:", error);
      res.status(500).json({ message: "Failed to generate mini quiz" });
    }
  });

  // Demo: reset user progress/state
  app.post("/api/demo/reset", async (req, res) => {
    try {
      const { userId } = req.body || {};
      if (!userId) return res.status(400).json({ message: "userId is required" });
      await storage.resetUserData(userId);

      // Also delete from Supabase if present
      if (supabaseServer) {
        try {
          await supabaseServer
            .from('user_assessment_results')
            .delete()
            .eq('user_id', userId);

          await supabaseServer
            .from('learning_paths')
            .delete()
            .eq('user_id', userId);
        } catch (dbError) {
          console.error('[Demo Reset] Supabase delete error:', dbError);
        }
      }

      res.json({ ok: true });
    } catch (error) {
      console.error('[Demo Reset] Failed to reset demo data:', error);
      res.status(500).json({ message: "Failed to reset demo data" });
    }
  });

  // Get user assessment results from Supabase
  app.get("/api/user-assessment-results/:userId", async (req, res) => {
    try {
      const { userId } = req.params;

      if (!supabaseServer) {
        return res.status(503).json({ message: "Supabase not configured" });
      }

      const { data, error } = await supabaseServer
        .from('user_assessment_results')
        .select('*')
        .eq('user_id', userId)
        .order('assessed_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is 'not found'
        console.error('[API] Error fetching user_assessment_results:', error);
        return res.status(500).json({ message: "Failed to fetch results" });
      }

      res.json(data || null);
    } catch (error) {
      console.error('[API] Unexpected error fetching user_assessment_results:', error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // Get learning path from Supabase (bypassing RLS for demo mode)
  app.get("/api/learning-paths/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      if (!supabaseServer) return res.status(503).json({ message: "Supabase not configured" });

      const { data, error } = await supabaseServer
        .from('learning_paths')
        .select('topics, estimated_duration')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        return res.status(500).json({ message: "Failed to fetch paths" });
      }

      res.json(data || null);
    } catch (e) {
      res.status(500).json({ message: "Internal Error" });
    }
  });

  // ─── GameShow History & Leaderboard ──────────────────────

  // Lịch sử trận đấu của 1 user
  app.get("/api/gameshow/history/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const limit = parseInt((req.query.limit as string) ?? "20");
      const history = await getUserMatchHistory(userId, limit);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to get match history" });
    }
  });

  // Helper: disable cache so client luôn nhận dữ liệu mới sau khi chơi xong
  const noCache = (res: any) => {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
  };

  // Leaderboard: top users theo point tích luỹ (dùng RPC để bypass RLS khi dùng ANON key)
  app.get("/api/gameshow/leaderboard", async (req, res) => {
    noCache(res);
    try {
      if (!supabaseServer) return res.json([]);
      const limit = parseInt((req.query.limit as string) ?? "20");

      const { data, error } = await supabaseServer.rpc("get_gameshow_leaderboard", { p_limit: limit });
      if (error) return res.status(500).json({ message: error.message });

      const rows = (data as any[]) || [];
      const leaderboard = rows.map((s: any, i: number) => ({
        rank: i + 1,
        userId: s.user_id,
        displayName: s.full_name || "Ẩn danh",
        totalScore: s.gameshow_points || 0,
        wins: s.total_wins || 0,
        avatar: s.avatar_url || null,
      }));

      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: "Failed to get gameshow leaderboard" });
    }
  });

  // Lấy rank và stats hiện tại cho 1 user (dùng RPC để bypass RLS khi dùng ANON key)
  app.get("/api/gameshow/stats/:userId", async (req, res) => {
    noCache(res);
    try {
      const { userId } = req.params;
      if (!supabaseServer) return res.json({ rank: null, totalScore: 0, wins: 0, matches: 0 });

      const { data, error } = await supabaseServer.rpc("get_user_stats_gameshow", { p_user_id: userId });
      if (error) {
        return res.status(500).json({ message: error.message });
      }
      const row = (data as any) || {};
      const points = Number(row.gameshow_points) || 0;
      const wins = Number(row.total_wins) || 0;
      const matches = Number(row.total_matches) || 0;
      const rank = row.rank != null ? Number(row.rank) : null;

      res.json({ rank, totalScore: points, wins, matches });
    } catch (error) {
      res.status(500).json({ message: "Failed to get gameshow user stats" });
    }
  });

  // Debug: xem thô Supabase trả gì cho user_stats (để so sánh với /api/gameshow/stats)
  app.get("/api/gameshow/debug-stats/:userId", async (req, res) => {
    noCache(res);
    try {
      const { userId } = req.params;
      if (!supabaseServer) return res.json({ raw: null, error: "no_supabase_client" });
      const { data, error } = await supabaseServer
        .from("user_stats")
        .select("id, user_id, gameshow_points, total_wins, total_matches, updated_at")
        .eq("user_id", userId)
        .single();
      return res.json({
        from_supabase: { data, error: error ? { message: error.message, code: error.code } : null },
        has_row: !!data,
      });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
