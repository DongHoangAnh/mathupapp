import OpenAI from "openai";
import { getFrameById, findMisconceptionFrameByError } from "./ontology";
import { tutorKnowledgeBase, selectTutorResponse } from "./ai-knowledge-base";

// Initialize OpenAI client — đọc VITE_OPENAI_KEY (prefix theo Vite) hoặc OPENAI_API_KEY
const apiKey = process.env.VITE_OPENAI_KEY || process.env.OPENAI_API_KEY;
const openaiEnabled = Boolean(apiKey);
const openai = openaiEnabled ? new OpenAI({ apiKey }) : null;

const AI_MODEL = "gpt-5.2"; // Mô hình mới nhất (released Dec 2025)

export async function getChatResponse(
  message: string,
  context?: string,
  errorPatterns?: { misconceptionId: string; question: string; chosen: string; correct: string; }[]
): Promise<string> {
  try {
    if (!openaiEnabled || !openai) {
      // Use knowledge base for offline responses
      const misconceptionId = errorPatterns?.[0]?.misconceptionId;
      return selectTutorResponse(message, misconceptionId, 'confused', 'intermediate');
    }

    // Enhanced context building with knowledge base
    let enhancedContext = context || '';
    let knowledgeContext = '';

    if (errorPatterns && errorPatterns.length > 0) {
      const recentError = errorPatterns[0];
      const topic = extractTopicFromMisconception(recentError.misconceptionId);

      if (topic && (tutorKnowledgeBase.topicFrames as any)[topic]) {
        const frame = (tutorKnowledgeBase.topicFrames as any)[topic];
        knowledgeContext = `
KHUNG KIẾN THỨC CHỦ ĐỀ: ${topic}
Nguyên lý cốt lõi: ${frame.keyPrinciples.join('; ')}
Lỗi thường gặp: ${frame.commonErrors.join('; ')}
Bước hướng dẫn: ${frame.scaffoldingSteps?.join('; ') || 'Theo từng bước cơ bản'}

CHI TIẾT LỖI:
Câu hỏi: "${recentError.question}"
Học sinh chọn: "${recentError.chosen}"
Đáp án đúng: "${recentError.correct}"
        `;
      }

      // Add misconception-specific intervention
      if ((tutorKnowledgeBase.misconceptionInterventions as any)[recentError.misconceptionId]) {
        const intervention = (tutorKnowledgeBase.misconceptionInterventions as any)[recentError.misconceptionId];
        knowledgeContext += `
PHƯƠNG PHÁP KHẮC PHỤC:
Giải thích: ${intervention.explanation}
Ví dụ tương tự: ${intervention.analogy}
Cách làm đúng: ${intervention.correctMethod}
        `;
      }
    }

    const systemPrompt = `Bạn là Stella - một trợ lý AI Socratic thông minh và thân thiện, chuyên về toán học cho học sinh Việt Nam lớp 9.

NGUYÊN TẮC CỐT LÕI:
- Sử dụng phương pháp Socratic: đặt câu hỏi để dẫn dắt học sinh tự khám phá
- KHÔNG bao giờ đưa ra đáp án trực tiếp
- Khuyến khích học sinh giải thích suy nghĩ của mình
- Thể hiện sự kiên nhẫn và động viên
- Sử dụng ví dụ cụ thể và hình ảnh trực quan
- Kết nối với thực tế để tạo ý nghĩa

PHONG CÁCH GIAO TIẾP:
- Thân thiện, gần gũi như một người bạn thông minh
- Sử dụng emoji phù hợp để tạo không khí tích cực  
- Đặt câu hỏi mở để khích lệ suy nghĩ
- Thể hiện sự hào hứng khi học sinh tiến bộ

${enhancedContext ? `\nBối cảnh bài toán: ${enhancedContext}` : ''}
${knowledgeContext}

Hãy phản hồi theo phong cách Socratic, giúp học sinh tự khám phá ra lỗi sai và cách sửa chữa.`;

    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: message
        }
      ],
      max_completion_tokens: 600,
      temperature: 0.8,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    });

    return response.choices[0].message.content || "Hmm, có vẻ như tôi cần suy nghĩ thêm về câu hỏi này. Bạn có thể chia sẻ thêm về cách bạn tiếp cận bài toán này không? 🤔";
  } catch (error) {
    console.error("OpenAI API error:", error);
    return "Xin lỗi, tôi đang gặp một chút khó khăn kỹ thuật. Nhưng đừng lo! Hãy thử chia nhỏ bài toán thành các bước đơn giản hơn và làm từng bước một nhé! 💪";
  }
}

// Helper function to extract topic from misconception ID
function extractTopicFromMisconception(misconceptionId: string): string | null {
  const topicMap: { [key: string]: string } = {
    'M-FRAC': 'fractions',
    'M-GEO': 'geometry',
    'M-LINEAR': 'linear-equation',
    'M-QUAD': 'quadratic-equation',
    'M-ARITH': 'basic-arithmetic'
  };

  for (const [prefix, topic] of Object.entries(topicMap)) {
    if (misconceptionId.startsWith(prefix)) {
      return topic;
    }
  }
  return null;
}

export async function generateMiniQuiz(topic: string, difficulty: number): Promise<{
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}[]> {
  try {
    if (!openaiEnabled || !openai) {
      // Provide a simple fallback so the app remains usable without an API key
      return [
        {
          question: `Câu hỏi mẫu về chủ đề "${topic}": Giá trị của 2x khi x = ${difficulty + 1} là bao nhiêu?`,
          options: ["2", "4", `${2 * (difficulty + 1)}`, "8"],
          correctAnswer: `${2 * (difficulty + 1)}`,
          explanation: `Thay x = ${difficulty + 1} vào biểu thức 2x, ta được 2 * ${difficulty + 1} = ${2 * (difficulty + 1)}.`
        },
        {
          question: `Câu hỏi mẫu: Nếu a + b = ${difficulty + 5} và a = 2, thì b bằng bao nhiêu?`,
          options: ["1", `${difficulty + 3}`, "5", "7"],
          correctAnswer: `${difficulty + 3}`,
          explanation: `b = ${difficulty + 5} - 2 = ${difficulty + 3}.`
        },
        {
          question: `Câu hỏi mẫu: Diện tích hình chữ nhật có chiều dài ${difficulty + 3} và chiều rộng 2 là bao nhiêu?`,
          options: ["2", `${2 * (difficulty + 3)}`, "6", "8"],
          correctAnswer: `${2 * (difficulty + 3)}`,
          explanation: `S = dài * rộng = ${difficulty + 3} * 2 = ${2 * (difficulty + 3)}.`
        }
      ];
    }
    const prompt = `Tạo 3 câu hỏi trắc nghiệm toán học về chủ đề "${topic}" với độ khó ${difficulty}/5 cho học sinh lớp 9. 
    Trả lời dưới dạng JSON với format:
    {
      "questions": [
        {
          "question": "câu hỏi",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": "đáp án đúng",
          "explanation": "giải thích chi tiết"
        }
      ]
    }`;

    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content: "Bạn là chuyên gia tạo câu hỏi toán học. Hãy trả lời bằng JSON hợp lệ."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || '{"questions": []}');
    return result.questions || [];
  } catch (error) {
    console.error("Error generating mini quiz:", error);
    return [];
  }
}

// Build RAG-like context from ontology using a simple errorPattern or concept id found in the context string
export function buildOntologyContext(rawContext?: string): string | undefined {
  if (!rawContext) return undefined;
  try {
    // naive extraction: look for errorPattern tokens used in our demo maps
    const patterns = [
      'perimeter_instead_of_area',
      'add_sides_instead_of_multiply',
      'double_area_error',
      'sign_error_transposition',
    ];
    const found = patterns.find(p => rawContext.includes(p));
    if (found) {
      const frame = findMisconceptionFrameByError(found);
      if (frame) {
        const hints = frame.commonMisconceptions.find(m => m.errorPattern === found)?.scaffoldingHints || [];
        return `Khung kiến thức: ${frame.conceptName}\nĐịnh nghĩa: ${frame.definition}\nGợi ý: ${hints.join(' | ')}`;
      }
    }
    // fallback: find by simple frame id
    const idMatch = rawContext.match(/FRAME:([A-Z0-9\-]+)/);
    if (idMatch) {
      const fr = getFrameById(idMatch[1]);
      if (fr) return `Khung kiến thức: ${fr.conceptName}\nĐịnh nghĩa: ${fr.definition}`;
    }
  } catch { }
  return undefined;
}

// Image analysis function for visual questions
export async function analyzeMathDrawing(base64Image: string, context: string): Promise<string> {
  try {
    if (!openaiEnabled || !openai) {
      return "Xin lỗi, tính năng phân tích hình ảnh hiện không khả dụng. Vui lòng mô tả vấn đề bằng lời để tôi có thể giúp bạn.";
    }

    const prompt = `Bạn là một trợ lý AI giáo dục toán học tiếng Việt. Học sinh đã khoanh vùng một phần trong video học toán mà họ không hiểu. 

Bối cảnh bài học: ${context}

Hãy phân tích hình ảnh và:
1. Xác định phần toán học mà học sinh đã khoanh vùng
2. Giải thích khái niệm hoặc bước giải liên quan một cách dễ hiểu
3. Đưa ra ví dụ tương tự nếu cần thiết
4. Hướng dẫn cách học sinh có thể tiếp tục học

Trả lời bằng tiếng Việt, ngôn ngữ thân thiện và dễ hiểu cho học sinh trung học.`;

    // the newest OpenAI model is "gpt-5.2" which was released December 11, 2025
    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      max_completion_tokens: 1024,
    });

    return response.choices[0].message.content || "Không thể phân tích hình ảnh này. Vui lòng thử lại.";
  } catch (error) {
    console.error("Error analyzing math drawing:", error);
    return "Đã xảy ra lỗi khi phân tích hình ảnh. Vui lòng mô tả vấn đề bằng lời để tôi có thể giúp bạn tốt hơn.";
  }
}

// ============================================================
// Assessment Analysis: Tạo Knowledge Map + Learning Path từ kết quả bài test
// ============================================================

export interface KnowledgeTile {
  id: string;         // Mã ngắn, vd: "PS", "HH", "ĐS"
  name: string;       // Tên đầy đủ chủ đề
  strength: "strong" | "medium" | "weak";  // Mức độ
  score: number;      // 0–100
  totalQuestions: number;
  correctAnswers: number;
  needsPractice: boolean;
  priority: number;   // 1 = ưu tiên nhất
}

export interface LearningMilestone {
  order: number;      // 1, 2, 3...
  topic: string;      // Tên chủ đề
  emoji: string;
  status: "current" | "upcoming" | "completed";
  estimatedWeeks: number;
  reason: string;     // Tại sao cần học cái này
}

export interface AssessmentAnalysisResult {
  overallScore: number;
  totalQuestions: number;
  correctAnswers: number;
  knowledgeTiles: KnowledgeTile[];
  learningPath: LearningMilestone[];
  summary: string;    // Nhận xét tổng quan cho học sinh
  strengths: string[];
  weaknesses: string[];
}

/**
 * Phân tích kết quả assessment bằng AI để tạo:
 * 1. Bản đồ tri thức (knowledge tiles) với màu sắc theo mức độ
 * 2. Lộ trình chinh phục (learning milestones) được cá nhân hóa
 */
export async function analyzeAssessmentWithAI(
  responses: Array<{
    questionId: string | number;
    topic: string;
    chapter: string;
    lesson?: string;
    difficulty: number;
    isCorrect: boolean;
    responseTime: number;
    selectedOption: string;
    correctAnswer: string;
  }>,
  userGrade?: string
): Promise<AssessmentAnalysisResult> {

  // === Bước 1: Tính thống kê cơ bản theo chapter/topic ===
  const chapterStats: Record<string, {
    correct: number; total: number; totalTime: number;
    avgDifficulty: number; lessons: Set<string>;
  }> = {};

  responses.forEach(r => {
    const key = r.chapter || r.topic || "Chủ đề khác";
    if (!chapterStats[key]) {
      chapterStats[key] = { correct: 0, total: 0, totalTime: 0, avgDifficulty: 0, lessons: new Set() };
    }
    chapterStats[key].total++;
    if (r.isCorrect) chapterStats[key].correct++;
    chapterStats[key].totalTime += r.responseTime;
    chapterStats[key].avgDifficulty += r.difficulty;
    if (r.lesson) chapterStats[key].lessons.add(r.lesson);
  });

  const totalCorrect = responses.filter(r => r.isCorrect).length;
  const overallScore = responses.length > 0 ? Math.round(totalCorrect / responses.length * 100) : 0;

  // Rút gọn tên chapter thành ID ngắn (vd: "CHƯƠNG 1: PHÂN SỐ" → "PS")
  const makeShortId = (name: string): string => {
    const common: Record<string, string> = {
      'phân số': 'PS', 'hình học': 'HH', 'đại số': 'ĐS', 'thống kê': 'TK',
      'xác suất': 'XS', 'số học': 'SH', 'hàm số': 'HS', 'phương trình': 'PT',
      'bất phương trình': 'BPT', 'hệ phương trình': 'HPT', 'lượng giác': 'LG',
      'logarit': 'LOG', 'giải tích': 'GT', 'tổ hợp': 'TH', 'chuỗi số': 'CS',
      'số nguyên': 'SN', 'phép tính': 'PT2', 'hình phẳng': 'HP'
    };
    const lower = name.toLowerCase();
    for (const [key, val] of Object.entries(common)) {
      if (lower.includes(key)) return val;
    }
    // Lấy chữ hoa viết tắt
    const words = name.split(/[\s\-:_]+/).filter(w => w.length > 1);
    return words.map(w => w[0].toUpperCase()).join('').slice(0, 3) || name.slice(0, 2).toUpperCase();
  };

  const emojiForTopic = (name: string): string => {
    const lower = name.toLowerCase();
    if (lower.includes('phân số') || lower.includes('phân số')) return '🍕';
    if (lower.includes('hình học') || lower.includes('hình phẳng')) return '📐';
    if (lower.includes('đại số') || lower.includes('phương trình')) return '🔢';
    if (lower.includes('thống kê') || lower.includes('xác suất')) return '📊';
    if (lower.includes('số học') || lower.includes('phép tính')) return '🌱';
    if (lower.includes('hàm số') || lower.includes('hàm')) return '📈';
    if (lower.includes('logarit') || lower.includes('lượng giác')) return '🔬';
    if (lower.includes('tổ hợp') || lower.includes('chuỗi')) return '🧩';
    return '📚';
  };

  // === Bước 2: Tạo Knowledge Tiles từ thống kê ===
  const fallbackTiles: KnowledgeTile[] = Object.entries(chapterStats)
    .map(([chapter, stats], idx) => {
      const rate = stats.total > 0 ? stats.correct / stats.total : 0;
      const strength: "strong" | "medium" | "weak" =
        rate >= 0.8 ? "strong" : rate >= 0.5 ? "medium" : "weak";
      return {
        id: makeShortId(chapter),
        name: chapter,
        strength,
        score: Math.round(rate * 100),
        totalQuestions: stats.total,
        correctAnswers: stats.correct,
        needsPractice: rate < 0.7,
        priority: rate < 0.5 ? 1 : rate < 0.7 ? 2 : 3
      };
    })
    .sort((a, b) => a.priority - b.priority);

  // Tạo learning path từ thống kê - ưu tiên chủ đề yếu nhất trước
  const weakChapters = fallbackTiles.filter(t => t.needsPractice).sort((a, b) => a.score - b.score);
  const strongChapters = fallbackTiles.filter(t => !t.needsPractice);

  const fallbackMilestones: LearningMilestone[] = [
    ...weakChapters.slice(0, 4).map((t, i) => ({
      order: i + 1,
      topic: t.name,
      emoji: emojiForTopic(t.name),
      status: (i === 0 ? "current" : "upcoming") as "current" | "upcoming",
      estimatedWeeks: t.score < 30 ? 3 : t.score < 60 ? 2 : 1,
      reason: `Bạn đạt ${t.score}% ở chủ đề này — cần củng cố thêm`
    })),
    ...strongChapters.slice(0, 2).map((t, i) => ({
      order: weakChapters.length + i + 1,
      topic: t.name,
      emoji: emojiForTopic(t.name),
      status: "upcoming" as "upcoming",
      estimatedWeeks: 1,
      reason: `Bạn đã vững (${t.score}%) — tiếp tục nâng cao`
    }))
  ];

  const fallbackResult: AssessmentAnalysisResult = {
    overallScore,
    totalQuestions: responses.length,
    correctAnswers: totalCorrect,
    knowledgeTiles: fallbackTiles,
    learningPath: fallbackMilestones,
    summary: overallScore >= 80
      ? `Xuất sắc! Bạn nắm vững kiến thức toán học với ${overallScore}% câu đúng.`
      : overallScore >= 60
        ? `Khá tốt! Bạn đạt ${overallScore}% — có một số chủ đề cần luyện thêm.`
        : `Bạn đạt ${overallScore}% — đừng lo, lộ trình học sẽ giúp bạn cải thiện từng bước!`,
    strengths: strongChapters.slice(0, 3).map(t => t.name),
    weaknesses: weakChapters.slice(0, 3).map(t => t.name)
  };

  // === Bước 3: Gọi AI nếu có OpenAI key để phân tích sâu hơn ===
  if (!openaiEnabled || !openai) {
    console.log("⚠️ OpenAI not available, using statistical analysis for assessment");
    return fallbackResult;
  }

  try {
    // Tóm tắt kết quả theo chapter để gửi lên AI (giảm token)
    const summaryForAI = Object.entries(chapterStats).map(([chapter, stats]) => ({
      chapter,
      correct: stats.correct,
      total: stats.total,
      rate: Math.round(stats.correct / stats.total * 100),
      avgResponseTimeSeconds: Math.round(stats.totalTime / stats.total / 1000)
    }));

    const prompt = `Bạn là chuyên gia giáo dục toán học Việt Nam. Hãy phân tích kết quả bài kiểm tra chẩn đoán của học sinh${userGrade ? ` lớp ${userGrade}` : ''} và tạo ra:
1. Bản đồ tri thức (knowledge tiles) — đánh giá từng chủ đề
2. Lộ trình học tập (5 milestones) — sắp xếp theo ưu tiên

KẾT QUẢ BÀI KIỂM TRA:
- Tổng số câu: ${responses.length}
- Số câu đúng: ${totalCorrect}
- Điểm tổng: ${overallScore}%
- Chi tiết theo chương:
${JSON.stringify(summaryForAI, null, 2)}

Trả lời CHÍNH XÁC theo JSON sau (không thêm text ngoài JSON):
{
  "summary": "Nhận xét ngắn gọn, động viên học sinh (1-2 câu)",
  "strengths": ["tên chủ đề mạnh 1", "tên chủ đề mạnh 2"],
  "weaknesses": ["tên chủ đề yếu 1", "tên chủ đề yếu 2"],
  "knowledgeTiles": [
    {
      "id": "Mã 2-3 ký tự (vd: PS, HH, ĐS)",
      "name": "Tên đầy đủ chủ đề",
      "strength": "strong hoặc medium hoặc weak",
      "score": 85,
      "totalQuestions": 8,
      "correctAnswers": 7,
      "needsPractice": false,
      "priority": 3
    }
  ],
  "learningPath": [
    {
      "order": 1,
      "topic": "Tên chủ đề ưu tiên nhất",
      "emoji": "emoji phù hợp với chủ đề",
      "status": "current",
      "estimatedWeeks": 2,
      "reason": "Lý do ngắn tại sao cần học chủ đề này trước"
    }
  ]
}

Lưu ý:
- knowledgeTiles: liệt kê TẤT CẢ chủ đề có trong bài test
- learningPath: đúng 5 milestones, sắp xếp yếu trước → mạnh sau
- strength: "weak" nếu rate < 50%, "medium" nếu 50-79%, "strong" nếu >= 80%
- Milestone 1 có status="current", còn lại status="upcoming"`;

    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: "system", content: "Bạn là chuyên gia phân tích kết quả học tập. Trả lời bằng JSON thuần túy, không markdown." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 2000,
      temperature: 0.3  // Low temp for consistent structured output
    });

    const aiResult = JSON.parse(response.choices[0].message.content || '{}');

    return {
      overallScore,
      totalQuestions: responses.length,
      correctAnswers: totalCorrect,
      knowledgeTiles: aiResult.knowledgeTiles || fallbackTiles,
      learningPath: aiResult.learningPath || fallbackMilestones,
      summary: aiResult.summary || fallbackResult.summary,
      strengths: aiResult.strengths || fallbackResult.strengths,
      weaknesses: aiResult.weaknesses || fallbackResult.weaknesses
    };

  } catch (error) {
    console.error("AI assessment analysis failed, using statistical fallback:", error);
    return fallbackResult;
  }
}