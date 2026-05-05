import { useState, useEffect } from "react";
import { ClipboardCheck, ChevronLeft, ChevronRight, SkipForward, Info, Brain, Eye, Zap, Target, Award, TrendingUp, Activity, CheckCircle, AlertCircle, Clock, Sparkles, BookOpen, Puzzle, Star, Calculator, FileEdit, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import KnowledgeMap from "@/components/knowledge-map";
import AppHeader from "@/components/app-header";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";
import MathRenderer from "../components/math-renderer";

// Display names and base-knowledge for AI guidance per topic
const topicDisplayNames: { [key: string]: string } = {
  'basic-arithmetic': 'Phép tính cơ bản',
  'linear-equation': 'Phương trình bậc nhất',
  'linear-function': 'Hàm số bậc nhất',
  'quadratic-function': 'Hàm số bậc hai',
  'geometry': 'Hình học',
  'system-equations': 'Hệ phương trình'
};

/** Chuẩn hóa hiển thị chủ đề: "Chủ đề N: Tên chủ đề" (hoặc "Chủ đề N" nếu không có tên trong data). */
function formatTopicDisplay(topic: string): string {
  if (topicDisplayNames[topic]) return topicDisplayNames[topic];
  const upperOnly = /^CHỦ ĐỀ\s+(\d+)$/i.exec(topic);
  if (upperOnly) return `Chủ đề ${upperOnly[1]}`;
  const withName = topic.match(/^(Chủ đề\s*\d+)\s*[.:]\s*(.+)$/i);
  if (withName) return `${withName[1]}: ${withName[2].trim()}`;
  return topic;
}

const topicKnowledgeBases: { [key: string]: string } = {
  'basic-arithmetic': 'Muốn cộng/trừ/nhân/chia nhanh, hãy xếp thẳng hàng các chữ số theo hàng đơn vị, chục, trăm... và thực hiện lần lượt từ phải sang trái. Kiểm tra lại bằng phép tính ngược nếu có thể.',
  'linear-equation': 'Phương trình bậc nhất một ẩn có dạng ax + b = 0 (a ≠ 0). Quy tắc giải: Chuyển vế đổi dấu để đưa về ax = -b, sau đó chia hai vế cho a để được x = -b/a.',
  'linear-function': 'Hàm số bậc nhất có dạng y = ax + b. Hệ số góc a cho biết độ dốc của đường thẳng: a > 0 thì đồng biến, a < 0 thì nghịch biến; b là tung độ gốc (điểm cắt trục Oy).',
  'quadratic-function': 'Hàm số bậc hai y = ax² + bx + c (a ≠ 0). Đỉnh parabol có hoành độ x = -b/(2a) và tung độ y = f(x). Trục đối xứng là x = -b/(2a).',
  'geometry': 'Trong tam giác vuông, định lý Pythagoras: a² + b² = c² (c là cạnh huyền). Với tam giác, lưu ý các công thức chu vi, diện tích, và các hệ thức lượng trong tam giác vuông.',
  'system-equations': 'Giải hệ phương trình thường dùng phương pháp thế hoặc cộng đại số. Quy tắc: Quy đồng/nhân hệ số để khử một ẩn, sau đó thế ngược lại để tìm ẩn còn lại.'
};

const assessmentQuestions = [
  {
    id: 1,
    question: "Phép tính 15 + 23 có kết quả là:",
    options: ["38", "42", "35", "40"],
    correctAnswer: "38",
    explanation: "15 + 23 = 38",
    topic: "basic-arithmetic",
    difficulty: 1
  },
  {
    id: 2,
    question: "Phương trình x + 12 = 20 có nghiệm là:",
    options: ["x = 8", "x = 32", "x = 12", "x = 20"],
    correctAnswer: "x = 8",
    explanation: "x = 20 - 12 = 8",
    topic: "linear-equation",
    difficulty: 2
  },
  {
    id: 3,
    question: "Hàm số y = 2x + 1 khi x = 4 có giá trị y là:",
    options: ["9", "8", "7", "10"],
    correctAnswer: "9",
    explanation: "y = 2(4) + 1 = 8 + 1 = 9",
    topic: "linear-function",
    difficulty: 2
  },
  {
    id: 4,
    question: "Một hình chữ nhật có chiều dài 5cm và chiều rộng 3cm. Diện tích của hình chữ nhật đó là bao nhiêu?",
    options: ["15cm²", "16cm", "8cm²", "30cm²"],
    correctAnswer: "15cm²",
    explanation: "Diện tích hình chữ nhật = chiều dài × chiều rộng = 5cm × 3cm = 15cm².",
    topic: "geometry",
    difficulty: 3,
    distractors: {
      "16cm": "perimeter_instead_of_area",
      "8cm²": "add_sides_instead_of_multiply",
      "30cm²": "double_area_error",
    }
  },
  {
    id: 5,
    question: "Phương trình 2x - 8 = 0 có nghiệm là:",
    options: ["x = 4", "x = -4", "x = 8", "x = -8"],
    correctAnswer: "x = 4",
    explanation: "2x = 8 ⟹ x = 4",
    topic: "linear-equation",
    difficulty: 2
  },
  {
    id: 6,
    question: "Hàm số nào dưới đây là hàm số bậc nhất?",
    options: ["y = x²", "y = 3x + 2", "y = 1/x", "y = x³ - 1"],
    correctAnswer: "y = 3x + 2",
    explanation: "Hàm số bậc nhất có dạng y = ax + b với a ≠ 0",
    topic: "linear-function",
    difficulty: 2
  },
  {
    id: 7,
    question: "Giải hệ phương trình: x + y = 5; x - y = 1",
    options: ["x = 3, y = 2", "x = 2, y = 3", "x = 4, y = 1", "x = 1, y = 4"],
    correctAnswer: "x = 3, y = 2",
    explanation: "Cộng hai phương trình: 2x = 6 ⟹ x = 3; thế vào: y = 2",
    topic: "system-equations",
    difficulty: 3
  }
];

// Prerequisite mapping for adaptive logic
const prereqOf: { [key: string]: string } = {
  'linear-equation': 'basic-arithmetic',
  'linear-function': 'linear-equation',
  'quadratic-function': 'linear-function',
  'system-equations': 'linear-equation',
  'geometry': 'basic-arithmetic'
};

export default function Assessment() {
  const [, navigate] = useLocation();
  const [learningDuration, setLearningDuration] = useState("30");
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [responses, setResponses] = useState<any[]>([]);
  const [sessionQuestions, setSessionQuestions] = useState<any[]>([]);
  const [knowledgeMap, setKnowledgeMap] = useState<any>({});
  const [showResults, setShowResults] = useState(false);
  const [saving, setSaving] = useState(false);
  const [responseLogs, setResponseLogs] = useState<any[]>([]);

  // Remediation state
  const [remediationMode, setRemediationMode] = useState(false);
  const [remediationTopic, setRemediationTopic] = useState<string>("");
  const [remediationQuestions, setRemediationQuestions] = useState<any[]>([]);
  const [remediationIndex, setRemediationIndex] = useState(0);
  const [tutorOpen, setTutorOpen] = useState(false);
  const [tutorMessages, setTutorMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [tutorInput, setTutorInput] = useState("");
  const [tutorLoading, setTutorLoading] = useState(false);
  const [lastIncorrect, setLastIncorrect] = useState<any>(null);

  // Real-time cognitive analysis
  const [cognitiveMetrics, setCognitiveMetrics] = useState({
    responseTime: 0,
    confidence: 0,
    patternRecognition: 0,
    conceptualUnderstanding: 0
  });
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);

  const TARGET_QUESTIONS = 40;

  useEffect(() => {
    if (started && sessionQuestions.length === 0) {
      seedFirstQuestion();
    }
  }, [started]);

  useEffect(() => {
    if (started && !remediationMode) {
      setQuestionStartTime(Date.now());
    }
  }, [currentQuestion, started, remediationMode]);

  const seedFirstQuestion = async () => {
    try {
      // Đọc grade và semester từ onboarding config hoặc user profile
      let grade = "2";
      let semester = "1";
      try {
        const onboardingStr = localStorage.getItem('onboarding');
        if (onboardingStr) {
          const ob = JSON.parse(onboardingStr);
          if (ob.grade) grade = String(ob.grade);
          if (ob.semester) semester = String(ob.semester);
        }
        // Fallback: đọc từ mathocean_user
        const userStr = localStorage.getItem('mathocean_user');
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.grade) grade = String(user.grade);
          if (user.semester) semester = String(user.semester);
        }
      } catch (e) {
        console.warn('[Assessment] Could not read grade/semester from storage, defaulting to grade=2, semester=1');
      }

      console.log(`[Assessment] Loading questions for grade ${grade}, semester ${semester}`);
      const res = await fetch(`/api/assessment-questions?grade=${grade}&semester=${semester}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          // Normalize the question format if needed, though backend should return correct format
          const normalized = data.map((q: any) => ({
            ...q,
            options: Array.isArray(q.options) ? q.options : JSON.parse(q.options || '[]')
          }));
          setSessionQuestions(normalized);
          console.log('Loaded assessment questions:', normalized.length);
        } else {
          setSessionQuestions(assessmentQuestions);
          console.log('Using fallback questions');
        }
      } else {
        setSessionQuestions(assessmentQuestions);
        console.log('API failed, using fallback');
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      setSessionQuestions(assessmentQuestions);
    }
  };

  const calculateCognitiveMetrics = (responseTime: number, isCorrect: boolean, questionDifficulty: number) => {
    const timeScore = Math.max(0, 100 - (responseTime / 1000) * 2); // Faster = higher score
    const confidenceScore = isCorrect ? Math.min(100, timeScore + 20) : Math.max(0, timeScore - 30);
    const patternScore = isCorrect ? Math.min(100, (questionDifficulty * 20) + timeScore) : Math.max(0, timeScore - 20);
    const conceptualScore = isCorrect ? Math.min(100, questionDifficulty * 25) : Math.max(0, questionDifficulty * 10);

    return {
      responseTime: Math.round(responseTime),
      confidence: Math.round(confidenceScore),
      patternRecognition: Math.round(patternScore),
      conceptualUnderstanding: Math.round(conceptualScore)
    };
  };

  const handleNext = async () => {
    if (!selectedAnswer) return;

    const responseTime = Date.now() - questionStartTime;
    const current = remediationMode ? remediationQuestions[remediationIndex] : sessionQuestions[currentQuestion];
    const wasCorrect = selectedAnswer === current.correctAnswer;

    // Calculate cognitive metrics
    const metrics = calculateCognitiveMetrics(responseTime, wasCorrect, current.difficulty || 2);
    setCognitiveMetrics(metrics);

    if (remediationMode) {
      handleRemediationNext(wasCorrect);
      return;
    }

    // Log detailed response data with enhanced misconception detection
    let misconceptionTag = null;
    if (!wasCorrect) {
      if (current.misconceptions) {
        const matchedMisconception = current.misconceptions.find((m: any) => String(m.distractor) === String(selectedAnswer));
        if (matchedMisconception) {
          misconceptionTag = matchedMisconception.id;
        }
      }

      // Khắc phục lỗi data không có misconceptions mapping -> tự động tạo lỗi dựa trên chủ đề
      if (!misconceptionTag) {
        const tName = String(current.topic || current.chapter_name || "chung");
        const code = tName.replace(/[^A-Za-z0-9]/g, '').substring(0, 4).toUpperCase();
        misconceptionTag = `M-${code}-ERR`;
      }
    }

    const currentResponse = {
      questionId: current.id,
      topic: current.topic,
      chapter: current.chapter,
      lesson: current.lesson,
      difficulty: current.difficulty,
      selectedOption: selectedAnswer,
      correctAnswer: current.correctAnswer,
      isCorrect: wasCorrect,
      misconceptionTag,
      responseTime,
      cognitiveMetrics: metrics,
      timestamp: new Date().toISOString(),
    };
    setResponseLogs(prevLogs => [...prevLogs, currentResponse]);

    const newResponse = {
      question: current.question,
      selectedAnswer,
      correctAnswer: current.correctAnswer,
      isCorrect: wasCorrect,
      topic: current.topic,
      chapter: current.chapter,
      lesson: current.lesson,
      explanation: current.explanation
    };
    const updatedResponses = [...responses, newResponse];
    setResponses(updatedResponses);

    if (currentQuestion + 1 >= TARGET_QUESTIONS) {
      completeAssessment(updatedResponses);
      return;
    }

    // Simplified logic: just move to next question as we pre-loaded all 40 questions
    // No adaptive fetching needed for fixed assessment
    /*
    // Adaptive logic with misconception awareness
    let nextTopic = current.topic;
    if (!wasCorrect && misconceptionTag) {
      nextTopic = current.topic; // Stay on topic to probe misconception
    } else if (!wasCorrect && prereqOf[current.topic]) {
      nextTopic = prereqOf[current.topic] as string;
    }

    let nextDifficulty = current.difficulty || 2;
    nextDifficulty = Math.max(1, Math.min(5, nextDifficulty + (wasCorrect ? 1 : -1)));

    try {
      const res = await fetch(`/api/questions/math?topic=${nextTopic}&count=1&difficulty=${nextDifficulty}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          // Normalize the question format
          const normalized = {
            ...data[0],
            options: Array.isArray(data[0].options) ? data[0].options : JSON.parse(data[0].options || '[]'),
            misconceptions: data[0].misconceptions ? JSON.parse(data[0].misconceptions) : []
          };
          setSessionQuestions(prev => [...prev, normalized]);
          console.log('Loaded next question from API:', normalized.question);
        } else {
          const fallback = assessmentQuestions.find(q => q.topic === nextTopic) || assessmentQuestions[Math.min(currentQuestion + 1, assessmentQuestions.length - 1)];
          setSessionQuestions(prev => [...prev, fallback]);
          console.log('Using fallback question for topic:', nextTopic);
        }
      } else {
        const fallback = assessmentQuestions[Math.min(currentQuestion + 1, assessmentQuestions.length - 1)];
        setSessionQuestions(prev => [...prev, fallback]);
        console.log('API failed, using fallback');
      }
    } catch (error) {
      console.error('Error loading next question:', error);
      const fallback = assessmentQuestions[Math.min(currentQuestion + 1, assessmentQuestions.length - 1)];
      setSessionQuestions(prev => [...prev, fallback]);
    }
    */

    setCurrentQuestion(prev => prev + 1);
    setSelectedAnswer("");
  };

  const generateKnowledgeMap = (currentResponses = responses) => {
    const chapterStats: { [key: string]: { correct: number; total: number; lessons: Set<string> } } = {};

    // Ensure we have responses to analyze
    if (currentResponses.length === 0) {
      console.warn("No responses available for knowledge map generation");
      return {};
    }

    currentResponses.forEach(response => {
      // Use chapter name if available, otherwise fallback to topic
      const chapterKey = response.chapter || response.topic || "Chương khác";

      if (!chapterStats[chapterKey]) {
        chapterStats[chapterKey] = { correct: 0, total: 0, lessons: new Set() };
      }

      chapterStats[chapterKey].total++;
      if (response.isCorrect) {
        chapterStats[chapterKey].correct++;
      }
      if (response.lesson) {
        chapterStats[chapterKey].lessons.add(response.lesson);
      }
    });

    const map: { [key: string]: { status: string; needsWork: boolean; lessons: string[]; correct: number; total: number } } = {};

    Object.entries(chapterStats).forEach(([chapter, stats]) => {
      // Logic: If user gets >= 70% correct, it is "Vững", otherwise "Hổng"
      const rate = stats.total > 0 ? stats.correct / stats.total : 0;
      const isPerfect = rate >= 0.7;
      const status = isPerfect ? "Vững" : "Hổng";

      map[chapter] = {
        status,
        needsWork: !isPerfect,
        lessons: Array.from(stats.lessons),
        correct: stats.correct,
        total: stats.total
      };
    });

    console.log("Generated knowledge map:", map);
    setKnowledgeMap(map);
    return map;
  };

  const completeAssessment = (finalResponses: any[]) => {
    const map = generateKnowledgeMap(finalResponses);
    setShowResults(true);
  };

  const handleRemediationNext = (wasCorrect: boolean) => {
    if (remediationIndex + 1 >= remediationQuestions.length) {
      finishRemediation();
      return;
    }
    setRemediationIndex(prev => prev + 1);
    setSelectedAnswer("");
  };

  const startRemediationForTopic = async (topic: string) => {
    console.log('Starting remediation for topic:', topic);
    setRemediationMode(true);
    setRemediationTopic(topic);
    setRemediationIndex(0);
    setSelectedAnswer(""); // Clear any previous answer
    setShowResults(false); // Hide results section

    // Automatically open AI tutor with context-aware welcome message
    setTutorOpen(true);

    // Generate intelligent welcome message based on test analytics
    const topicErrors = responseLogs.filter(log => log.topic === topic && log.misconceptionTag);
    const errorCounts: { [key: string]: number } = {};
    topicErrors.forEach(log => {
      if (log.misconceptionTag) {
        errorCounts[log.misconceptionTag] = (errorCounts[log.misconceptionTag] || 0) + 1;
      }
    });
    const topError = Object.entries(errorCounts).sort(([, a], [, b]) => b - a)[0];
    const avgTime = topicErrors.length > 0
      ? topicErrors.reduce((sum, log) => sum + (log.responseTime || 0), 0) / topicErrors.length / 1000
      : 0;

    let intelligentWelcome = `Chào bạn! 👋 Tôi đã phân tích kết quả kiểm tra của bạn và thấy bạn cần cải thiện ở chủ đề **${formatTopicDisplay(topic)}**.

📊 **Phân tích từ bài kiểm tra:**`;

    if (topError) {
      intelligentWelcome += `\n• Lỗi chính: Bạn đã mắc lỗi "${topError[0]}" ${topError[1]} lần`;
    }

    if (avgTime > 0) {
      intelligentWelcome += `\n• Thời gian phản ứng: Trung bình ${avgTime.toFixed(1)}s (${avgTime > 5 ? 'hơi chậm' : 'bình thường'})`;
    }

    intelligentWelcome += `

🎯 **Kế hoạch học tập:**
1. Đọc kỹ kiến thức cơ bản bên phải
2. Thử giải bài tập bên trái
3. Thảo luận với tôi nếu gặp khó khăn

Hãy bắt đầu bằng việc đọc phần "Kiến thức cơ bản" bên phải, sau đó thử giải câu hỏi đầu tiên nhé! 💪`;

    setTutorMessages([
      {
        role: "system",
        content: "Bạn là trợ lý AI Socratic thông minh. Hãy hướng dẫn học sinh khám phá ra lỗi của mình thay vì đưa ra đáp án trực tiếp."
      },
      {
        role: "assistant",
        content: intelligentWelcome
      }
    ]);

    try {
      const res = await fetch(`/api/questions/math?topic=${topic}&count=3&difficulty=2`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          // Normalize questions from API
          const normalized = data.map((q: any) => ({
            ...q,
            options: Array.isArray(q.options) ? q.options : JSON.parse(q.options || '[]'),
            misconceptions: q.misconceptions ? JSON.parse(q.misconceptions) : []
          }));
          setRemediationQuestions(normalized);
          console.log('Loaded remediation questions from API:', normalized.length);
        } else {
          const fallbacks = assessmentQuestions.filter(q => q.topic === topic).slice(0, 3);
          setRemediationQuestions(fallbacks);
          console.log('Using fallback remediation questions for topic:', topic);
        }
      } else {
        const fallbacks = assessmentQuestions.filter(q => q.topic === topic).slice(0, 3);
        setRemediationQuestions(fallbacks);
      }
    } catch (error) {
      console.error('Error loading remediation questions:', error);
      const fallbacks = assessmentQuestions.filter(q => q.topic === topic).slice(0, 3);
      setRemediationQuestions(fallbacks);
    }
  };

  const finishRemediation = () => {
    const remediationScore = responses.filter(r => r.topic === remediationTopic && r.isCorrect).length;
    const totalRemediation = responses.filter(r => r.topic === remediationTopic).length;
    const percentage = totalRemediation > 0 ? (remediationScore / totalRemediation) * 100 : 0;

    if (percentage < 80) {
      openTutorWithContext(remediationTopic);
    } else {
      setRemediationMode(false);
      setShowResults(true);
    }
  };

  const openTutorWithContext = (topic: string) => {
    setTutorOpen(true);
    const baseKnowledge = topicKnowledgeBases[topic] || "";
    const lastIncorrectQ = responses.filter(r => r.topic === topic && !r.isCorrect).pop();
    setLastIncorrect(lastIncorrectQ);

    const recentLogs = responseLogs.slice(-3);
    const context = `
Topic: ${formatTopicDisplay(topic)}
Base Knowledge: ${baseKnowledge}
Last Incorrect: ${lastIncorrectQ ? `Q: ${lastIncorrectQ.question}, Selected: ${lastIncorrectQ.selectedAnswer}, Correct: ${lastIncorrectQ.correctAnswer}` : 'None'}
Recent Response Log Summary: ${recentLogs.map(log => `${log.topic}:${log.isCorrect ? 'correct' : 'incorrect'}${log.misconceptionTag ? `:${log.misconceptionTag}` : ''}`).join(', ')}
    `.trim();

    setTutorMessages([
      {
        role: "system",
        content: "Bạn là trợ lý AI Socratic thông minh. Hãy hướng dẫn học sinh khám phá ra lỗi của mình thay vì đưa ra đáp án trực tiếp."
      },
      {
        role: "assistant",
        content: `Chào bạn! Tôi thấy bạn đang gặp khó khăn với chủ đề ${formatTopicDisplay(topic)}. Hãy kể cho tôi nghe về cách bạn tiếp cận bài toán vừa rồi nhé. Bạn đã nghĩ gì khi làm bài?`
      }
    ]);
  };

  const sendTutorMessage = async () => {
    if (!tutorInput.trim()) return;

    setTutorLoading(true);
    const userMessage = { role: "user", content: tutorInput };
    setTutorMessages(prev => [...prev, userMessage]);

    try {
      const baseKnowledge = topicKnowledgeBases[remediationTopic] || "";
      const context = `
Topic: ${formatTopicDisplay(remediationTopic)}
Base Knowledge: ${baseKnowledge}
Last Incorrect: ${lastIncorrect ? `Q: ${lastIncorrect.question}, Selected: ${lastIncorrect.selectedAnswer}, Correct: ${lastIncorrect.correctAnswer}` : 'None'}
      `.trim();

      // Prepare error patterns for enhanced AI context
      const errorPatterns = responseLogs
        .filter(log => !log.isCorrect && log.misconceptionTag)
        .slice(-3) // Get last 3 errors
        .map(log => ({
          misconceptionId: log.misconceptionTag,
          question: sessionQuestions.find(q => q.id === log.questionId)?.question || '',
          chosen: log.selectedOption,
          correct: log.correctAnswer
        }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: tutorInput,
          context,
          errorPatterns
        })
      });

      if (res.ok) {
        const data = await res.json();
        setTutorMessages(prev => [...prev, { role: "assistant", content: data.response }]);
      }
    } catch (error) {
      setTutorMessages(prev => [...prev, {
        role: "assistant",
        content: "Tôi hiểu bạn đang gặp khó khăn. Hãy thử chia nhỏ bài toán và giải từng bước một cách cẩn thận nhé."
      }]);
    }

    setTutorInput("");
    setTutorLoading(false);
  };

  const saveAssessmentResults = async () => {
    setSaving(true);
    try {
      if (responses.length === 0) {
        alert("Không có dữ liệu để lưu. Vui lòng hoàn thành bài đánh giá trước.");
        setSaving(false);
        return;
      }

      // ĐỌC userId TỪ localStorage — KHÔNG dùng supabase.auth.getUser() vì có thể hang
      const storedUser = JSON.parse(localStorage.getItem('mathocean_user') || 'null');
      const storedOnboarding = JSON.parse(localStorage.getItem('onboarding') || 'null');
      const userId = storedUser?.id || null;
      let userGrade = storedUser?.grade || storedOnboarding?.grade || "2";

      const overallScore = Math.round(responses.filter(r => r.isCorrect).length / responses.length * 100);

      let analysisData: any = null;

      // === Gửi knowledgeMap lên server (đánh giá thuần theo data: sai chương nào = yếu chương đó), không dùng AI ===
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const analyzeRes = await fetch('/api/assessments/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            responseLogs,
            userId,
            userGrade,
            overallScore,
            totalQuestions: responses.length,
            knowledgeMap,
            learningDuration
          })
        });

        clearTimeout(timeoutId);

        if (analyzeRes.ok) {
          const json = await analyzeRes.json();
          if (json.success && json.analysis) {
            analysisData = json.analysis;
            console.log('[Assessment] Analysis received (data-based, no AI):', analysisData);
          }
        } else {
          console.warn('[Assessment] API analyze failed:', analyzeRes.status);
        }
      } catch (fetchErr: any) {
        if (fetchErr?.name === 'AbortError') {
          console.warn('[Assessment] API timed out, using local knowledgeMap');
        } else {
          console.warn('[Assessment] API error:', fetchErr);
        }
      }

      // === Fallback: tính từ knowledgeMap (cùng logic với màn hình kết quả) ===
      if (!analysisData) {
        const tiles = Object.entries(knowledgeMap).map(([name, data]: any) => {
          const score = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
          return {
            id: name.slice(0, 3).toUpperCase(),
            name,
            strength: data.needsWork ? 'weak' : 'strong' as any,
            score: score,
            totalQuestions: data.total || 5,
            correctAnswers: data.correct || 0,
            needsPractice: data.needsWork,
            priority: data.needsWork ? 1 : 3
          };
        });
        const weakTopics = tiles.filter((t: any) => t.needsPractice);
        const strongTopics = tiles.filter((t: any) => !t.needsPractice);

        // Generate dynamic feedback instead of static strings
        const dynamicSummary = overallScore >= 80
          ? `Xuất sắc! Em đã nắm vững ${strongTopics.length} chủ đề chính của lớp ${userGrade} với điểm số rất tốt.`
          : overallScore >= 60
            ? `Khá tốt! Em làm đạt ${overallScore}% bài đánh giá. Có ${weakTopics.length} chủ đề trọng tâm cần ôn luyện thêm.`
            : `Em đạt ${overallScore}%. Kết quả chẩn đoán cho thấy em cần dành thêm thời gian củng cố ${weakTopics.length > 0 ? weakTopics[0].name : "một số kiến thức cơ bản"}. Đừng lo, lộ trình sẽ giúp em tiến bộ!`;

        analysisData = {
          overallScore,
          totalQuestions: responses.length,
          correctAnswers: responses.filter(r => r.isCorrect).length,
          knowledgeTiles: tiles,
          learningPath: weakTopics.slice(0, 4).map((t: any, i: number) => ({
            order: i + 1,
            topic: t.name,
            emoji: ['🌱', '📚', '📐', '🔢'][i] || '📖',
            status: i === 0 ? 'current' : 'upcoming',
            estimatedWeeks: 2,
            reason: `Luyện tập chuyên sâu ` + (t.name.split(':').pop() || t.name)
          })),
          summary: dynamicSummary,
          strengths: strongTopics.map((t: any) => t.name),
          weaknesses: weakTopics.map((t: any) => t.name)
        };
      }

      // === Lưu vào localStorage ===
      localStorage.setItem('mathocean_last_analysis', JSON.stringify({
        ...analysisData,
        assessedAt: new Date().toISOString()
      }));
      localStorage.setItem('mathocean_has_assessment', 'true');
      localStorage.setItem('math_knowledge_map', JSON.stringify(knowledgeMap));

      // === Redirect ngay về Home ===
      navigate('/learning');

    } catch (error) {
      console.error("Failed to save assessment:", error);
      // Dù có lỗi vẫn lưu cờ và chuyển về
      localStorage.setItem('mathocean_has_assessment', 'true');
      navigate('/');
    } finally {
      setSaving(false);
    }
  };


  const question = remediationMode ? remediationQuestions[remediationIndex] : sessionQuestions[currentQuestion];
  const progress = remediationMode
    ? ((remediationIndex + 1) / remediationQuestions.length) * 100
    : ((currentQuestion + 1) / TARGET_QUESTIONS) * 100;

  if (!started) {
    return (
      <>
        <style>{`
          .main-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border: 4px solid white;
            box-shadow: 0 20px 40px rgba(0, 174, 239, 0.1);
            border-radius: 40px;
          }
          .bg-underwater {
            background: linear-gradient(180deg, #EAF6FF 0%, #D1EFFF 100%);
            position: relative;
          }
          .bubble-float {
            position: absolute;
            background: rgba(255, 255, 255, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.6);
            border-radius: 50%;
            pointer-events: none;
            box-shadow: inset -5px -5px 10px rgba(0, 0, 0, 0.05), inset 5px 5px 10px rgba(255, 255, 255, 0.8);
          }
          .btn-3d {
            box-shadow: 0 8px 0 #E68A00;
            transition: all 0.1s ease;
          }
          .btn-3d:active {
            box-shadow: 0 2px 0 #E68A00;
            transform: translateY(6px);
          }
          .feature-card {
            background: white;
            border-radius: 28px;
            box-shadow: 0 8px 20px rgba(0, 174, 239, 0.08);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            border: 2px solid transparent;
          }
          .feature-card:hover {
            transform: translateY(-5px);
            border-color: #00AEEF;
            box-shadow: 0 15px 30px rgba(0, 174, 239, 0.15);
          }
          .icon-box {
            width: 70px;
            height: 70px;
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1rem;
            box-shadow: 0 6px 12px rgba(0,0,0,0.05);
          }
          /* Colors */
          .text-primary { color: #00AEEF; }
          .bg-primary { background-color: #00AEEF; }
          .border-primary { border-color: #00AEEF; }
          .text-secondary { color: #FF9F1C; }
          .bg-secondary { background-color: #FF9F1C; }
          .text-navy-blue { color: #0A2463; }
        `}</style>
        <div className="min-h-screen bg-underwater">
          <AppHeader />
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="bubble-float w-12 h-12 left-[8%] top-[15%]"></div>
            <div className="bubble-float w-24 h-24 left-[85%] top-[12%]"></div>
            <div className="bubble-float w-20 h-20 left-[42%] top-[75%]"></div>
            <div className="bubble-float w-10 h-10 left-[78%] top-[85%]"></div>
            <div className="bubble-float w-32 h-32 left-[3%] top-[65%]"></div>
          </div>

          <main className="relative z-10 container mx-auto px-4 py-16 flex justify-center items-center pt-32">
            <div className="main-card w-full max-w-5xl p-12 text-center relative">
              <div className="flex justify-center mb-8">
                <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center shadow-inner relative">
                  <div className="absolute inset-0 bg-blue-100/50 rounded-full animate-pulse"></div>
                  <Brain size={72} className="text-primary relative z-10" />
                  <div className="absolute -bottom-2 -right-2 bg-secondary p-3 rounded-2xl shadow-lg border-4 border-white">
                    <Calculator size={30} className="text-white" />
                  </div>
                </div>
              </div>
              <h1 className="text-5xl font-black text-navy-blue mb-4 tracking-tight uppercase">
                Chuẩn Đoán Nhận Thức Toán Học
              </h1>
              <p className="text-xl text-slate-500 font-bold mb-14">
                Khám phá tiềm năng toán học của bạn qua bài đánh giá chuẩn quốc tế
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                <div className="feature-card p-6 flex flex-col items-center">
                  <div className="icon-box bg-purple-100 text-purple-600">
                    <FileEdit size={40} />
                  </div>
                  <h3 className="font-black text-navy-blue text-lg leading-tight mb-2">QUY TRÌNH CHUẨN ĐOÁN</h3>
                  <p className="text-sm text-slate-500 font-semibold">Từng bước đánh giá tư duy</p>
                </div>
                <div className="feature-card p-6 flex flex-col items-center">
                  <div className="icon-box bg-yellow-100 text-yellow-600">
                    <Sparkles size={40} />
                  </div>
                  <h3 className="font-black text-navy-blue text-lg leading-tight mb-2">ĐẶC ĐIỂM NỔI BẬT</h3>
                  <p className="text-sm text-slate-500 font-semibold">Thế mạnh cá nhân riêng biệt</p>
                </div>
                <div className="feature-card p-6 flex flex-col items-center">
                  <div className="icon-box bg-green-100 text-green-600">
                    <TrendingUp size={40} />
                  </div>
                  <h3 className="font-black text-navy-blue text-lg leading-tight mb-2">PHÂN TÍCH ĐA CHIỀU</h3>
                  <p className="text-sm text-slate-500 font-semibold">Góc nhìn 360 độ về kiến thức</p>
                </div>
                <div className="feature-card p-6 flex flex-col items-center">
                  <div className="icon-box bg-red-100 text-red-600">
                    <AlertCircle size={40} />
                  </div>
                  <h3 className="font-black text-navy-blue text-lg leading-tight mb-2">THÔNG TIN TEST</h3>
                  <p className="text-sm text-slate-500 font-semibold">Chi tiết về bài kiểm tra</p>
                </div>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() => setStarted(true)}
                  className="bg-secondary btn-3d text-white font-black py-5 px-16 rounded-full text-2xl uppercase tracking-widest flex items-center gap-4 group transition-transform active:scale-95"
                >
                  BẮT ĐẦU CHUẨN ĐOÁN KIẾN THỨC
                  <ArrowRight size={30} className="group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            </div>
          </main>

          <div className="fixed bottom-0 left-0 w-full h-24 pointer-events-none opacity-40">
            <svg
              className="absolute bottom-0 w-full h-full"
              preserveAspectRatio="none"
              viewBox="0 0 1440 320"
            >
              <path
                d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                fill="#00AEEF"
              ></path>
            </svg>
          </div>


        </div>
      </>
    );
  }

  if (showResults) {
    return (
      <>
        <style>{`
          .main-card { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border: 4px solid white; box-shadow: 0 20px 40px rgba(0, 174, 239, 0.1); border-radius: 32px; }
          .bg-underwater { background: linear-gradient(180deg, #EAF6FF 0%, #D1EFFF 100%); position: relative; }
          .bubble-float { position: absolute; background: rgba(255, 255, 255, 0.4); border: 1px solid rgba(255, 255, 255, 0.6); border-radius: 50%; pointer-events: none; box-shadow: inset -5px -5px 10px rgba(0, 0, 0, 0.05), inset 5px 5px 10px rgba(255, 255, 255, 0.8); }
          .btn-3d-orange { box-shadow: 0 6px 0 #E68A00; transition: all 0.1s ease; }
          .btn-3d-orange:active { box-shadow: 0 2px 0 #E68A00; transform: translateY(4px); }
          .btn-3d-blue { box-shadow: 0 6px 0 #0088BC; transition: all 0.1s ease; }
          .btn-3d-blue:active { box-shadow: 0 2px 0 #0088BC; transform: translateY(4px); }
          .sub-card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 20px; transition: transform 0.2s ease; }
          .sub-card:hover { transform: translateY(-2px); }
          .chapter-card { background: white; border: 2px solid #EAF6FF; border-radius: 24px; padding: 16px; }
          .status-dot { width: 12px; height: 12px; border-radius: 50%; display: inline-block; }
        `}</style>
        <div className="min-h-screen bg-underwater pb-24">
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="bubble-float w-12 h-12 left-[8%] top-[15%]"></div>
            <div className="bubble-float w-24 h-24 left-[85%] top-[12%]"></div>
            <div className="bubble-float w-20 h-20 left-[42%] top-[75%]"></div>
            <div className="bubble-float w-10 h-10 left-[78%] top-[85%]"></div>
            <div className="bubble-float w-32 h-32 left-[3%] top-[65%]"></div>
          </div>

          <AppHeader />

          <main className="relative z-10 container mx-auto px-4 pt-8 flex flex-col items-center">
            <h1 className="text-3xl md:text-4xl font-black text-navy-blue mb-8 uppercase tracking-tight">KẾT QUẢ CHUẨN ĐOÁN NHẬN THỨC</h1>

            <div className="main-card w-full max-w-6xl p-8 md:p-12 mb-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-5 space-y-8">
                  <div>
                    <h2 className="text-primary font-black uppercase tracking-wider text-lg mb-6 flex items-center gap-2">
                      <TrendingUp size={24} />
                      PHÂN TÍCH NHẬN THỨC
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="sub-card p-5 text-center">
                        <Clock size={32} className="text-blue-500 mx-auto mb-2" />
                        <p className="text-[11px] font-bold text-slate-500 uppercase">Thời gian</p>
                        <p className="text-xl font-black text-navy-blue">{cognitiveMetrics.responseTime > 0 ? Math.max(0, 100 - Math.round(cognitiveMetrics.responseTime / 100)) : 85}%</p>
                      </div>
                      <div className="sub-card p-5 text-center">
                        <CheckCircle size={32} className="text-yellow-500 mx-auto mb-2" />
                        <p className="text-[11px] font-bold text-slate-500 uppercase">Độ tin cậy</p>
                        <p className="text-xl font-black text-navy-blue">{cognitiveMetrics.confidence > 0 ? cognitiveMetrics.confidence : 92}%</p>
                      </div>
                      <div className="sub-card p-5 text-center">
                        <Puzzle size={32} className="text-purple-500 mx-auto mb-2" />
                        <p className="text-[11px] font-bold text-slate-500 uppercase">Nhận diện mẫu</p>
                        <p className="text-xl font-black text-navy-blue">{cognitiveMetrics.patternRecognition > 0 ? cognitiveMetrics.patternRecognition : 78}%</p>
                      </div>
                      <div className="sub-card p-5 text-center">
                        <Zap size={32} className="text-green-500 mx-auto mb-2" />
                        <p className="text-[11px] font-bold text-slate-500 uppercase">Hiểu khái niệm</p>
                        <p className="text-xl font-black text-navy-blue">{cognitiveMetrics.conceptualUnderstanding > 0 ? cognitiveMetrics.conceptualUnderstanding : 65}%</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-50 rounded-3xl p-6 border-2 border-orange-100">
                    <h2 className="text-orange-500 font-black uppercase tracking-wider text-lg mb-4 flex items-center gap-2">
                      <AlertCircle size={24} />
                      CHỦ ĐỀ CẦN CẢI THIỆN
                    </h2>
                    <ul className="space-y-3">
                      {Object.entries(knowledgeMap)
                        .filter(([topic, data]: any) => data.needsWork)
                        .map(([topic, data]: any) => (
                          <li key={topic} className="flex items-center gap-3 text-navy-blue font-bold">
                            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                            {formatTopicDisplay(topic)}
                          </li>
                        ))}
                      {Object.entries(knowledgeMap).filter(([topic, data]: any) => data.needsWork).length === 0 && (
                        <li className="flex items-center gap-3 text-navy-blue font-bold">
                          <CheckCircle size={16} className="text-green-500" />
                          Bạn đã nắm vững tất cả chủ đề!
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Learning Duration Section */}
                  <div className="bg-blue-50/50 rounded-3xl p-6 border-2 border-blue-100 text-center">
                    <h3 className="text-navy-blue font-black uppercase text-lg mb-4 leading-tight">
                      BẠN MUỐN HỌC LỘ TRÌNH TRONG BAO NHIÊU NGÀY?
                    </h3>
                    <div className="flex flex-col gap-4">
                      <Input
                        type="number"
                        value={learningDuration}
                        onChange={(e) => setLearningDuration(e.target.value)}
                        className="text-center text-xl font-bold py-6 rounded-full border-2 border-blue-200 bg-white"
                        placeholder="Nhập số ngày (vd: 30)"
                      />
                      <button
                        onClick={saveAssessmentResults}
                        className="w-full bg-orange-500 hover:bg-orange-600 btn-3d-orange text-white font-black py-4 px-8 rounded-full text-base flex items-center justify-center gap-3 whitespace-nowrap transition-all active:scale-95"
                      >
                        TIẾP TỤC VỚI LỘ TRÌNH CÁ NHÂN HÓA
                        <ChevronRight size={24} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column - Knowledge Map */}
                <div className="lg:col-span-7 bg-blue-50/50 rounded-3xl p-8 border-2 border-white">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-navy-blue font-black uppercase tracking-wider text-lg flex items-center gap-2">
                      <Target size={24} />
                      BẢN ĐỒ TRI THỨC
                    </h2>
                    <div className="flex gap-4 text-[10px] font-bold uppercase">
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-green-500"></span> Vững
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-red-500"></span> Hổng
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(knowledgeMap).map(([title, data]: any, index) => {
                      const isSuccess = data.status === "Vững";
                      const statusColor = isSuccess ? 'bg-green-500' : 'bg-red-500';

                      // Label: CHƯƠNG N; Content: luôn hiển thị dạng "Chủ đề N: Tên chủ đề"
                      const numMatch = title.match(/chủ đề\s*(\d+)/i);
                      const label = numMatch ? `CHƯƠNG ${numMatch[1]}` : `CHƯƠNG ${index + 1}`;
                      const content = formatTopicDisplay(title);

                      return (
                        <div key={title} className="bg-white p-5 rounded-[24px] border-2 border-slate-100 relative group hover:border-blue-200 transition-colors shadow-sm">
                          <div className={`absolute top-5 right-5 w-3 h-3 rounded-full ${statusColor}`}></div>
                          <div className="text-[10px] text-blue-400 font-bold uppercase mb-2 tracking-wider">
                            {label}
                          </div>
                          <div className="font-bold text-navy-blue text-sm uppercase leading-relaxed pr-6">
                            {content}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-center gap-4 mb-12">
              <button
                onClick={saveAssessmentResults}
                disabled={saving}
                className="w-full md:w-auto bg-primary btn-3d-blue text-white font-black py-4 px-8 rounded-full text-lg flex items-center justify-center gap-3 disabled:opacity-70">
                <Activity size={24} />
                {saving ? 'ĐANG LƯU...' : 'LƯU KẾT QUẢ & TẠO LỘ TRÌNH HỌC TẬP'}
              </button>
            </div>
          </main>

          <div className="fixed bottom-0 left-0 w-full h-16 pointer-events-none opacity-40">
            <svg className="absolute bottom-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 320">
              <path
                d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                fill="#00AEEF"></path>
            </svg>
          </div>
        </div>
      </>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải câu hỏi tiếp theo...</p>
        </Card>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .main-card { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border: 4px solid white; box-shadow: 0 20px 40px rgba(0, 174, 239, 0.1); border-radius: 32px; }
        .bg-underwater { background: linear-gradient(180deg, #EAF6FF 0%, #D1EFFF 100%); position: relative; }
        .bubble-float { position: absolute; background: rgba(255, 255, 255, 0.4); border: 1px solid rgba(255, 255, 255, 0.6); border-radius: 50%; pointer-events: none; box-shadow: inset -5px -5px 10px rgba(0, 0, 0, 0.05), inset 5px 5px 10px rgba(255, 255, 255, 0.8); }
        .btn-3d-orange { box-shadow: 0 6px 0 #E68A00; transition: all 0.1s ease; }
        .btn-3d-orange:active { box-shadow: 0 2px 0 #E68A00; transform: translateY(4px); }
        .answer-pill { border: 2px solid #D1EFFF; transition: all 0.2s ease; }
        .answer-pill:hover { border-color: #00AEEF; background-color: #F0F9FF; transform: scale(1.01); }
        .progress-path { background: #D1EFFF; border-radius: 999px; height: 12px; position: relative; overflow: hidden; }
        .progress-fill { background: linear-gradient(90deg, #00AEEF, #00D2FF); height: 100%; border-radius: 999px; position: relative; }
        .progress-fill::after { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: radial-gradient(circle, white 10%, transparent 10%); background-size: 10px 10px; opacity: 0.3; }
        .real-time-stat { background: #F8FAFC; border-radius: 20px; padding: 12px; display: flex; flex-direction: column; align-items: center; gap: 4px; border: 1px solid #E2E8F0; }
      `}</style>
      <div className="min-h-screen bg-underwater pb-24">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="bubble-float w-12 h-12 left-[8%] top-[15%]"></div>
          <div className="bubble-float w-24 h-24 left-[85%] top-[12%]"></div>
          <div className="bubble-float w-20 h-20 left-[42%] top-[75%]"></div>
          <div className="bubble-float w-10 h-10 left-[78%] top-[85%]"></div>
          <div className="bubble-float w-32 h-32 left-[3%] top-[65%]"></div>
          <div className="absolute top-20 left-1/4 opacity-10 text-6xl text-primary font-black select-none">+</div>
          <div className="absolute top-1/2 right-10 opacity-10 text-6xl text-primary font-black select-none">÷</div>
          <div className="absolute bottom-1/4 left-10 opacity-10 text-6xl text-primary font-black select-none">×</div>
          <div className="absolute top-1/3 left-10 opacity-10 text-6xl text-primary font-black select-none">−</div>
        </div>

        <AppHeader />

        <main className="relative z-10 container mx-auto px-4 pt-32 flex flex-col items-center">
          <div className="w-full max-w-4xl mb-8">
            <div className="flex justify-between items-end mb-3">
              <span className="text-primary font-black text-xl tracking-wider">
                {remediationMode ? 'ÔN TẬP' : 'CÂU'} {remediationMode ? remediationIndex + 1 : currentQuestion + 1}/{remediationMode ? remediationQuestions.length : TARGET_QUESTIONS}
              </span>
              <div className="flex items-center gap-2 text-navy-blue/60">
                <Clock size={16} />
                <span className="font-bold text-sm">{Math.round((Date.now() - questionStartTime) / 1000)}s</span>
              </div>
            </div>
            <div className="progress-path">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>

          {/* Question Card modeled after test2.html */}
          <div className="main-card w-full max-w-4xl p-10 relative mb-8">
            <div className="text-center mb-10">
              <h2 className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-4">Câu hỏi:</h2>
              <div className="mb-4">
                {question.difficulty && (
                  <span className="inline-block bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full mb-2">
                    Độ khó: {question.difficulty}/5
                  </span>
                )}
              </div>
              <h1 className={`${question.question.length > 80 ? 'text-2xl md:text-3xl font-bold' : 'text-4xl md:text-5xl font-black'} text-navy-blue leading-tight break-words whitespace-pre-wrap`}>
                <MathRenderer content={question.question} />
              </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
              {question.options?.map((option: string, index: number) => {
                const letter = String.fromCharCode(65 + index);
                const isSelected = selectedAnswer === option;
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedAnswer(option)}
                    className={`answer-pill p-6 rounded-full flex items-center gap-6 bg-white group text-left transition-all ${isSelected ? 'border-primary bg-blue-50' : 'hover:border-primary/50'}`}
                  >
                    <span
                      className={`w-12 h-12 min-w-[3rem] rounded-full font-black text-xl flex items-center justify-center transition-colors ${isSelected ? 'bg-primary text-white' : 'bg-blue-50 text-primary group-hover:bg-primary group-hover:text-white'}`}>
                      {letter}
                    </span>
                    <span className={`${String(option).length > 30 ? 'text-lg font-semibold' : 'text-xl font-bold'} text-navy-blue break-words`}>
                      <MathRenderer content={option} />
                    </span>
                  </button>
                );
              })}
            </div>

            {selectedAnswer && (
              <div className="border-t border-slate-100 pt-8">
                <h3 className="text-center text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Phân tích thời
                  gian thực</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="real-time-stat">
                    <Clock size={24} className="text-blue-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Thời gian</span>
                    <span className="text-sm font-black text-navy-blue">{Math.round((Date.now() - questionStartTime) / 1000)}s</span>
                  </div>
                  <div className="real-time-stat">
                    <Zap size={24} className="text-orange-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Tốc độ</span>
                    <span className="text-sm font-black text-navy-blue">
                      {Math.round((Date.now() - questionStartTime) / 1000) < 5 ? 'Nhanh' : 'Thường'}
                    </span>
                  </div>
                  <div className="real-time-stat">
                    <Star size={24} className="text-yellow-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Tin cậy</span>
                    <span className="text-sm font-black text-navy-blue">{cognitiveMetrics.confidence}%</span>
                  </div>
                  <div className="real-time-stat">
                    <Puzzle size={24} className="text-purple-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Độ khó</span>
                    <span className="text-sm font-black text-navy-blue">Cấp {question.difficulty || 2}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="w-full max-w-4xl flex items-center justify-between">
            <button
              onClick={() => {
                if (remediationMode) {
                  if (remediationIndex > 0) {
                    setRemediationIndex(remediationIndex - 1);
                    setSelectedAnswer('');
                  }
                } else {
                  if (currentQuestion > 0) {
                    setCurrentQuestion(currentQuestion - 1);
                    setSelectedAnswer('');
                  }
                }
              }}
              disabled={currentQuestion === 0 && !remediationMode}
              className="px-8 py-4 rounded-full bg-white border-2 border-blue-200 text-blue-600 font-bold hover:bg-blue-50 hover:border-blue-300 transition-all flex items-center gap-2 disabled:opacity-50 shadow-sm">
              <ChevronLeft size={24} />
              CÂU TRƯỚC
            </button>
            {!remediationMode && (
              <button
                onClick={() => {
                  setSelectedAnswer("SKIPPED");
                  setTimeout(handleNext, 100);
                }}
                className="text-slate-600 font-bold hover:text-navy-blue transition-colors uppercase tracking-widest text-sm bg-white/40 px-6 py-2 rounded-full backdrop-blur-sm">
                Bỏ qua
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!selectedAnswer}
              className="bg-orange-500 hover:bg-orange-600 btn-3d-orange text-white font-black py-4 px-10 rounded-full text-lg flex items-center gap-3 disabled:opacity-70 disabled:shadow-none active:translate-y-1 transition-all">
              CÂU TIẾP
              <ChevronRight size={24} />
            </button>
          </div>
        </main>

        <div className="fixed bottom-0 left-0 w-full h-16 pointer-events-none opacity-40">
          <svg className="absolute bottom-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 320">
            <path
              d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              fill="#00AEEF"></path>
          </svg>
        </div>



        {/* Enhanced AI Tutor for Remediation */}
        {
          (tutorOpen || remediationMode) && (
            <div className="container mx-auto px-4 pb-8">
              <div className="grid lg:grid-cols-2 gap-6 mt-6">
                {/* AI Tutor Chat */}
                <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                    <CardTitle className="text-lg font-bold flex items-center justify-between">
                      <div className="flex items-center">
                        <Sparkles size={20} className="mr-2" />
                        AI Tutor - Hướng dẫn Thích ứng
                      </div>
                      {!remediationMode && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setTutorOpen(false)}
                          className="text-white hover:bg-white/20"
                        >
                          ✕
                        </Button>
                      )}
                    </CardTitle>
                    <div className="text-sm text-purple-100 mt-2">
                      💡 Dựa trên phân tích kết quả kiểm tra của bạn
                    </div>
                  </CardHeader>

                  <CardContent className="p-6">
                    {remediationMode && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                          <Brain size={16} className="mr-2" />
                          Phân tích từ bài kiểm tra
                        </h4>
                        <div className="text-sm text-blue-800 space-y-1">
                          <div>• Chủ đề yếu: <strong>{formatTopicDisplay(remediationTopic)}</strong></div>
                          <div>• Lỗi phổ biến: {(() => {
                            const topicErrors = responseLogs.filter(log => log.topic === remediationTopic && log.misconceptionTag);
                            const errorCounts: { [key: string]: number } = {};
                            topicErrors.forEach(log => {
                              if (log.misconceptionTag) {
                                errorCounts[log.misconceptionTag] = (errorCounts[log.misconceptionTag] || 0) + 1;
                              }
                            });
                            const topError = Object.entries(errorCounts).sort(([, a], [, b]) => b - a)[0];
                            return topError ? `${topError[1]} lần mắc lỗi ${topError[0]}` : 'Chưa xác định';
                          })()}</div>
                          <div>• Thời gian phản ứng TB: {(() => {
                            const topicLogs = responseLogs.filter(log => log.topic === remediationTopic);
                            const avgTime = topicLogs.length > 0
                              ? topicLogs.reduce((sum, log) => sum + (log.responseTime || 0), 0) / topicLogs.length / 1000
                              : 0;
                            return `${avgTime.toFixed(1)}s`;
                          })()}</div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4 max-h-60 overflow-y-auto">
                      {tutorMessages.filter(msg => msg.role !== 'system').map((msg, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg ${msg.role === 'user'
                            ? 'bg-blue-50 border-l-4 border-blue-500 ml-8'
                            : 'bg-purple-50 border-l-4 border-purple-500 mr-8'
                            }`}
                        >
                          <div className="text-sm font-semibold mb-1">
                            {msg.role === 'user' ? '🧑‍🎓 Bạn' : '🤖 AI Tutor'}
                          </div>
                          <div className="text-gray-700">{msg.content}</div>
                        </div>
                      ))}

                      {remediationMode && tutorMessages.filter(msg => msg.role !== 'system').length === 0 && (
                        <div className="bg-purple-50 border-l-4 border-purple-500 mr-8 p-3 rounded-lg">
                          <div className="text-sm font-semibold mb-1">🤖 AI Tutor</div>
                          <div className="text-gray-700">
                            Chào bạn! Tôi đã phân tích kết quả kiểm tra của bạn và thấy bạn cần cải thiện ở chủ đề <strong>{formatTopicDisplay(remediationTopic)}</strong>.
                            Hãy đọc kỹ kiến thức cơ bản bên phải, sau đó thử giải bài tập. Tôi sẽ hướng dẫn bạn từng bước! 💪
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2 mt-4">
                      <Input
                        value={tutorInput}
                        onChange={(e) => setTutorInput(e.target.value)}
                        placeholder="Chia sẻ suy nghĩ của bạn hoặc hỏi thắc mắc..."
                        onKeyPress={(e) => e.key === 'Enter' && sendTutorMessage()}
                        className="flex-1"
                      />
                      <Button
                        onClick={sendTutorMessage}
                        disabled={tutorLoading || !tutorInput.trim()}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {tutorLoading ? '...' : 'Gửi'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Base Knowledge Panel */}
                <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                    <CardTitle className="text-lg font-bold flex items-center">
                      <BookOpen size={20} className="mr-2" />
                      Kiến thức cơ bản - {formatTopicDisplay(remediationTopic)}
                    </CardTitle>
                    <div className="text-sm text-emerald-100 mt-2">
                      📚 Ôn tập kiến thức nền tảng trước khi làm bài
                    </div>
                  </CardHeader>

                  <CardContent className="p-6">
                    {(() => {
                      const getTopicKnowledge = (topic: string) => {
                        const knowledgeBase: { [key: string]: any } = {
                          'basic-arithmetic': {
                            title: 'Phép tính cơ bản',
                            concepts: [
                              {
                                name: 'Thứ tự thực hiện phép tính',
                                content: 'Nhớ quy tắc: Ngoặc → Lũy thừa → Nhân/Chia → Cộng/Trừ (từ trái sang phải)',
                                example: 'Ví dụ: 2 + 3 × 4 = 2 + 12 = 14 (không phải 20)'
                              },
                              {
                                name: 'Tính chất giao hoán',
                                content: 'a + b = b + a và a × b = b × a',
                                example: 'Ví dụ: 5 + 3 = 3 + 5 = 8'
                              },
                              {
                                name: 'Kiểm tra kết quả',
                                content: 'Luôn kiểm tra bằng phép tính ngược lại',
                                example: 'Cộng thì kiểm tra bằng trừ: 15 + 23 = 38 → 38 - 23 = 15 ✓'
                              }
                            ],
                            tips: [
                              'Tính từ từ, không vội vàng',
                              'Viết rõ ràng từng bước',
                              'Kiểm tra lại kết quả cuối'
                            ]
                          },
                          'fractions': {
                            title: 'Phân số',
                            concepts: [
                              {
                                name: 'Ý nghĩa phân số',
                                content: 'Phân số a/b biểu thị a phần của tổng thể được chia thành b phần bằng nhau',
                                example: 'Ví dụ: 3/4 có nghĩa là lấy 3 phần trong tổng số 4 phần bằng nhau'
                              },
                              {
                                name: 'Quy đồng mẫu số',
                                content: 'Để cộng/trừ phân số, phải đưa về cùng mẫu số',
                                example: 'Ví dụ: 1/4 + 1/6 = 3/12 + 2/12 = 5/12'
                              },
                              {
                                name: 'Rút gọn phân số',
                                content: 'Chia cả tử và mẫu cho ước chung lớn nhất',
                                example: 'Ví dụ: 6/8 = 3/4 (chia cả tử và mẫu cho 2)'
                              }
                            ],
                            tips: [
                              'Tìm mẫu chung nhỏ nhất khi cộng/trừ',
                              'Luôn rút gọn kết quả cuối',
                              'Hình dung phân số bằng hình tròn hoặc thanh'
                            ]
                          },
                          'geometry': {
                            title: 'Hình học',
                            concepts: [
                              {
                                name: 'Chu vi vs Diện tích',
                                content: 'Chu vi = tổng độ dài các cạnh (đơn vị: cm, m). Diện tích = bề mặt bên trong (đơn vị: cm², m²)',
                                example: 'Hình chữ nhật 5×3: Chu vi = 2×(5+3) = 16cm, Diện tích = 5×3 = 15cm²'
                              },
                              {
                                name: 'Định lý Pythagoras',
                                content: 'Trong tam giác vuông: a² + b² = c² (c là cạnh huyền)',
                                example: 'Tam giác vuông cạnh 3, 4: c² = 3² + 4² = 9 + 16 = 25 → c = 5'
                              },
                              {
                                name: 'Công thức diện tích',
                                content: 'Hình chữ nhật: S = dài × rộng. Tam giác: S = (đáy × cao)/2. Hình tròn: S = π × r²',
                                example: 'Hình tròn bán kính 3: S = 3.14 × 3² = 3.14 × 9 = 28.26'
                              }
                            ],
                            tips: [
                              'Vẽ hình để dễ hình dung',
                              'Chú ý đơn vị đo (cm, cm², m, m²)',
                              'Kiểm tra kết quả có hợp lý không'
                            ]
                          },
                          'linear-equation': {
                            title: 'Phương trình bậc nhất',
                            concepts: [
                              {
                                name: 'Quy tắc chuyển vế',
                                content: 'Chuyển vế phải đổi dấu: + thành -, - thành +',
                                example: 'x + 5 = 8 → x = 8 - 5 → x = 3'
                              },
                              {
                                name: 'Mục tiêu giải phương trình',
                                content: 'Đưa tất cả ẩn số về một vế, số về vế kia',
                                example: '2x + 3 = 7 → 2x = 7 - 3 → 2x = 4 → x = 2'
                              },
                              {
                                name: 'Kiểm tra nghiệm',
                                content: 'Thế nghiệm vào phương trình gốc để kiểm tra',
                                example: 'x = 2: 2(2) + 3 = 4 + 3 = 7 ✓'
                              }
                            ],
                            tips: [
                              'Luôn nhớ đổi dấu khi chuyển vế',
                              'Thực hiện từng bước một cách rõ ràng',
                              'Kiểm tra nghiệm bằng cách thế ngược lại'
                            ]
                          },
                          'quadratic-equation': {
                            title: 'Phương trình bậc hai',
                            concepts: [
                              {
                                name: 'Dạng tổng quát',
                                content: 'ax² + bx + c = 0 với a ≠ 0',
                                example: 'Ví dụ: 2x² - 5x + 3 = 0 (a=2, b=-5, c=3)'
                              },
                              {
                                name: 'Biệt thức Delta',
                                content: 'Δ = b² - 4ac. Nếu Δ ≥ 0 thì có nghiệm thực',
                                example: '2x² - 5x + 3 = 0: Δ = (-5)² - 4(2)(3) = 25 - 24 = 1 > 0'
                              },
                              {
                                name: 'Công thức nghiệm',
                                content: 'x = (-b ± √Δ) / 2a',
                                example: 'x = (5 ± √1) / 4 = (5 ± 1) / 4 → x₁ = 1.5, x₂ = 1'
                              }
                            ],
                            tips: [
                              'Tính Delta trước để biết có nghiệm không',
                              'Nhớ dấu ± trong công thức nghiệm',
                              'Kiểm tra nghiệm bằng cách thế vào'
                            ]
                          }
                        };
                        return knowledgeBase[topic] || {
                          title: topic,
                          concepts: [{ name: 'Kiến thức cơ bản', content: 'Đang cập nhật...', example: '' }],
                          tips: ['Đọc kỹ đề bài', 'Làm từng bước', 'Kiểm tra kết quả']
                        };
                      };

                      const knowledge = getTopicKnowledge(remediationTopic);

                      return (
                        <div className="space-y-6">
                          {/* Concepts */}
                          <div>
                            <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                              <Target size={16} className="mr-2 text-emerald-600" />
                              Khái niệm cốt lõi
                            </h4>
                            <div className="space-y-4">
                              {knowledge.concepts.map((concept: any, index: number) => (
                                <div key={index} className="border-l-4 border-emerald-400 pl-4 bg-emerald-50 p-3 rounded-r-lg">
                                  <h5 className="font-semibold text-emerald-800 mb-2">{concept.name}</h5>
                                  <p className="text-gray-700 text-sm mb-2">{concept.content}</p>
                                  {concept.example && (
                                    <div className="bg-white p-2 rounded text-sm">
                                      <span className="font-medium text-blue-600">💡 {concept.example}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Tips */}
                          <div>
                            <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                              <Zap size={16} className="mr-2 text-yellow-600" />
                              Mẹo quan trọng
                            </h4>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                              <ul className="space-y-2">
                                {knowledge.tips.map((tip: string, index: number) => (
                                  <li key={index} className="flex items-start text-sm">
                                    <span className="text-yellow-600 mr-2">✓</span>
                                    <span className="text-gray-700">{tip}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Quick Reference */}
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                            <h5 className="font-semibold text-gray-800 mb-2 flex items-center">
                              <Clock size={14} className="mr-1" />
                              Tham khảo nhanh
                            </h5>
                            <div className="text-xs text-gray-600">
                              Dựa trên phân tích: Bạn thường mất {(() => {
                                const topicLogs = responseLogs.filter(log => log.topic === remediationTopic);
                                const avgTime = topicLogs.length > 0
                                  ? topicLogs.reduce((sum, log) => sum + (log.responseTime || 0), 0) / topicLogs.length / 1000
                                  : 4.5;
                                return avgTime.toFixed(1);
                              })()}s cho chủ đề này. Hãy đọc kỹ kiến thức trước khi làm bài!
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </div>
            </div>
          )
        }

        {/* Results Section */}
        {
          showResults && (
            <Card className="mt-6 shadow-xl border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white">
                <CardTitle className="text-xl font-bold flex items-center">
                  <CheckCircle size={24} className="mr-3" />
                  Kết quả Đánh giá Nhận thức
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Overall Score */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                      <Award size={20} className="mr-2" />
                      Điểm số tổng quát
                    </h3>
                    <div className="text-3xl font-black text-blue-600 mb-2">
                      {Math.round(responses.filter(r => r.isCorrect).length / responses.length * 100)}%
                    </div>
                    <div className="text-sm text-blue-700">
                      {responses.filter(r => r.isCorrect).length}/{responses.length} câu đúng
                    </div>
                  </div>

                  {/* Cognitive Analysis */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center">
                      <Brain size={20} className="mr-2" />
                      Phân tích nhận thức
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Tốc độ phản ứng:</span>
                        <span className="font-semibold">{cognitiveMetrics.responseTime > 0 ? `${Math.round(cognitiveMetrics.responseTime)}%` : 'Tốt'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Độ tự tin:</span>
                        <span className="font-semibold">{cognitiveMetrics.confidence > 0 ? `${Math.round(cognitiveMetrics.confidence)}%` : 'Cao'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Nhận dạng mẫu:</span>
                        <span className="font-semibold">{cognitiveMetrics.patternRecognition > 0 ? `${Math.round(cognitiveMetrics.patternRecognition)}%` : 'Tốt'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Misconception Analysis */}
                <div className="mt-6">
                  <h3 className="text-lg font-bold text-purple-800 mb-4 flex items-center">
                    <AlertCircle size={20} className="mr-2" />
                    Phân tích lỗi thường gặp
                  </h3>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <p className="text-sm text-purple-700 mb-3">
                      💡 <strong>Giải thích:</strong> Phần này giúp bạn hiểu những lỗi suy nghĩ phổ biến mà bạn đã mắc phải, từ đó có thể tránh được trong tương lai.
                    </p>
                    {(() => {
                      const misconceptionCounts: { [key: string]: number } = {};
                      responseLogs.forEach((log: any) => {
                        if (log.misconceptionTag) {
                          misconceptionCounts[log.misconceptionTag] = (misconceptionCounts[log.misconceptionTag] || 0) + 1;
                        }
                      });

                      const topMisconceptions = Object.entries(misconceptionCounts)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 3);

                      return topMisconceptions.length > 0 ? (
                        <div className="space-y-2">
                          {topMisconceptions.map(([tag, count]) => (
                            <div key={tag} className="flex items-center justify-between bg-white p-3 rounded-lg border border-purple-200">
                              <div>
                                <span className="text-sm font-medium text-purple-900">
                                  {tag.endsWith('-ERR') ? 'Cần củng cố phương pháp giải' :
                                    tag === 'M-FRAC-001' ? 'Cộng phân số sai cách' :
                                      tag === 'M-GEO-001' ? 'Nhầm lẫn chu vi và diện tích' :
                                        tag === 'M-LINEAR-001' ? 'Sai dấu khi chuyển vế' :
                                          tag === 'M-ARITH-001' ? 'Lỗi tính toán cơ bản' :
                                            'Lỗi khác'}
                                </span>
                                <div className="text-xs text-purple-600 mt-1">
                                  {tag.endsWith('-ERR') ? 'Sai sót do tính toán nhầm hoặc chưa thực sự hiểu yêu cầu bài toán' :
                                    tag === 'M-FRAC-001' ? 'Cộng tử số với tử số, mẫu số với mẫu số' :
                                      tag === 'M-GEO-001' ? 'Sử dụng công thức diện tích khi hỏi chu vi' :
                                        tag === 'M-LINEAR-001' ? 'Quên đổi dấu khi chuyển số sang vế khác' :
                                          tag === 'M-ARITH-001' ? 'Sai sót trong phép tính cộng, trừ, nhân, chia' :
                                            'Mô tả lỗi chưa xác định'}
                                </div>
                              </div>
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
                                {count} lần
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-purple-600">
                          <CheckCircle size={32} className="mx-auto mb-2 text-green-500" />
                          <p className="font-medium">Tuyệt vời! Không phát hiện lỗi suy nghĩ nào.</p>
                          <p className="text-sm">Bạn đã trả lời rất cẩn thận và chính xác.</p>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Knowledge Map */}
                <div className="mt-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <Target size={20} className="mr-2" />
                    Bản đồ tri thức
                  </h3>
                  <KnowledgeMap knowledgeMap={knowledgeMap} />
                </div>

                {/* Subjects Need Improvement */}
                <div className="mt-6">
                  <h3 className="text-lg font-bold text-orange-800 mb-4 flex items-center">
                    <TrendingUp size={20} className="mr-2" />
                    Chủ đề cần cải thiện
                  </h3>
                  {Object.entries(knowledgeMap).filter(([topic, data]: any) => data.needsWork).length > 0 ? (
                    <div className="grid sm:grid-cols-2 gap-3">
                      {Object.entries(knowledgeMap)
                        .filter(([topic, data]: any) => data.needsWork)
                        .map(([topic, data]: any) => (
                          <div key={topic} className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-orange-900">{formatTopicDisplay(topic)}</h4>
                              <Badge variant="outline" className="bg-orange-100 text-orange-700">
                                {data.score}%
                              </Badge>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => startRemediationForTopic(topic)}
                              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                            >
                              Luyện tập ngay
                            </Button>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle size={48} className="mx-auto mb-3 text-green-500" />
                      <p>Tuyệt vời! Bạn đã nắm vững tất cả chủ đề.</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t">
                  <Button
                    onClick={saveAssessmentResults}
                    disabled={saving}
                    className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white py-4 text-lg font-semibold"
                  >
                    <Activity size={20} className="mr-2" />
                    {saving ? 'Đang lưu...' : 'Lưu kết quả & Tạo Lộ trình học tập'}
                  </Button>

                  <Button
                    onClick={() => {
                      // Navigate to learning page - you might need to import useLocation
                      window.location.href = '/learning';
                    }}
                    variant="outline"
                    className="flex-1 py-4 text-lg border-gray-300 hover:bg-gray-50"
                  >
                    <Eye size={20} className="mr-2" />
                    Xem lộ trình học tập
                  </Button>

                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                    className="flex-1 py-4 text-lg border-gray-300 hover:bg-gray-50"
                  >
                    <ClipboardCheck size={20} className="mr-2" />
                    Làm lại bài đánh giá
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        }
      </div>
    </>
  );
}
