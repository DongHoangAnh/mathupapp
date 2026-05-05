import { useState, useRef, useEffect } from "react";
import { Play, Clock, Save, CheckCircle, Pen, Send, RotateCcw, X } from "lucide-react";
import { useChat } from "@/contexts/chat-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import AppHeader from "@/components/app-header";
import { supabase } from "@/lib/supabase";
import { Link, useLocation } from "wouter";

// Types
type Mode = "learning" | "practice";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

// Data
const currentLesson = {
  id: "lesson-8",
  title: "Bài 8: Đồ thị hàm số bậc nhất",
  description: "Học cách vẽ và phân tích đồ thị của hàm số bậc nhất y = ax + b",
  duration: "7:45",
  teacher: "MathUp Academy",
  views: 1234,
  videoId: "IqvmJqO3sYA",
  suggestedQuestions: [
    "Làm thế nào để xác định hệ số góc từ đồ thị?",
    "Tại sao đồ thị hàm số bậc nhất luôn là đường thẳng?",
    "Cách tìm giao điểm của hai đường thẳng?",
    "Ý nghĩa của tung độ gốc trong thực tế?",
    "Khi nào hai đường thẳng song song với nhau?"
  ]
};

const quizQuestion = {
  question: "Hàm số y = 2x + 3 có hệ số góc là bao nhiêu?",
  options: ["2", "3", "5", "1"],
  correctAnswer: "2",
  explanation: "Trong hàm số y = ax + b, hệ số góc chính là hệ số a. Với y = 2x + 3, hệ số góc là 2."
};

const lessonProgress = [
  { id: 1, title: "Khái niệm hàm số", completed: true },
  { id: 2, title: "Tính chất hàm số bậc nhất", completed: true },
  { id: 3, title: "Đồ thị hàm số bậc nhất", completed: false, current: true },
  { id: 4, title: "Ứng dụng thực tế", completed: false },
];

const practiceQuestions: Question[] = [
  {
    id: 1,
    question: "Trong các số sau đây, số nào là số lẻ lớn nhất có hai chữ số?",
    options: ["99", "97", "10", "98"],
    correctAnswer: "99",
    explanation: "Số lẻ lớn nhất có hai chữ số là 99."
  },
  {
    id: 2,
    question: "12 + 15 = ?",
    options: ["25", "27", "26", "28"],
    correctAnswer: "27",
    explanation: "12 + 15 = 27"
  },
  {
    id: 3,
    question: "Trong các hình sau, hình nào có 4 cạnh bằng nhau?",
    options: ["Hình vuông", "Hình chữ nhật", "Hình tam giác", "Hình tròn"],
    correctAnswer: "Hình vuông",
    explanation: "Hình vuông có 4 cạnh bằng nhau và 4 góc vuông."
  },
  {
    id: 4,
    question: "45 - 28 = ?",
    options: ["17", "16", "18", "15"],
    correctAnswer: "17",
    explanation: "45 - 28 = 17"
  },
  {
    id: 5,
    question: "Một cái bánh được chia thành 8 phần bằng nhau. Bạn ăn 2 phần. Hỏi bạn đã ăn bao nhiêu phần của cái bánh?",
    options: ["1/4", "2/8", "1/2", "Cả hai đáp án 1/4 và 2/8"],
    correctAnswer: "Cả hai đáp án 1/4 và 2/8",
    explanation: "2/8 = 1/4, vì vậy cả hai đáp án đều đúng."
  },
  {
    id: 6,
    question: "Số nào nhỏ hơn: 56 hay 65?",
    options: ["56", "65", "Bằng nhau", "Không so sánh được"],
    correctAnswer: "56",
    explanation: "56 < 65, vì vậy 56 nhỏ hơn."
  },
  {
    id: 7,
    question: "3 × 7 = ?",
    options: ["21", "20", "24", "18"],
    correctAnswer: "21",
    explanation: "3 × 7 = 21"
  },
  {
    id: 8,
    question: "Trong 1 tuần có bao nhiêu ngày?",
    options: ["5", "6", "7", "8"],
    correctAnswer: "7",
    explanation: "Một tuần có 7 ngày."
  },
  {
    id: 9,
    question: "100 - 45 = ?",
    options: ["55", "54", "65", "56"],
    correctAnswer: "55",
    explanation: "100 - 45 = 55"
  },
  {
    id: 10,
    question: "Hình tròn có bao nhiêu góc?",
    options: ["0", "1", "2", "4"],
    correctAnswer: "0",
    explanation: "Hình tròn không có góc nào."
  },
  {
    id: 11,
    question: "24 ÷ 6 = ?",
    options: ["4", "3", "5", "6"],
    correctAnswer: "4",
    explanation: "24 ÷ 6 = 4"
  },
  {
    id: 12,
    question: "Số nào lớn nhất trong các số sau: 78, 87, 77, 88?",
    options: ["78", "87", "77", "88"],
    correctAnswer: "88",
    explanation: "88 là số lớn nhất."
  },
  {
    id: 13,
    question: "15 + 15 + 15 = ?",
    options: ["30", "45", "40", "50"],
    correctAnswer: "45",
    explanation: "15 + 15 + 15 = 45"
  },
  {
    id: 14,
    question: "Nếu bạn có 20 viên kẹo và ăn 8 viên, còn lại bao nhiêu viên?",
    options: ["12", "10", "14", "11"],
    correctAnswer: "12",
    explanation: "20 - 8 = 12"
  },
  {
    id: 15,
    question: "9 × 5 = ?",
    options: ["45", "40", "50", "44"],
    correctAnswer: "45",
    explanation: "9 × 5 = 45"
  },
  {
    id: 16,
    question: "Số nào là số chẵn trong các số sau: 13, 25, 32, 47?",
    options: ["13", "25", "32", "47"],
    correctAnswer: "32",
    explanation: "32 là số chẵn (chia hết cho 2)."
  },
  {
    id: 17,
    question: "60 ÷ 10 = ?",
    options: ["6", "5", "7", "10"],
    correctAnswer: "6",
    explanation: "60 ÷ 10 = 6"
  },
  {
    id: 18,
    question: "Trong 1 năm có bao nhiêu tháng?",
    options: ["10", "11", "12", "13"],
    correctAnswer: "12",
    explanation: "Một năm có 12 tháng."
  },
  {
    id: 19,
    question: "35 + 28 = ?",
    options: ["63", "62", "64", "61"],
    correctAnswer: "63",
    explanation: "35 + 28 = 63"
  },
  {
    id: 20,
    question: "Hình tam giác có bao nhiêu cạnh?",
    options: ["2", "3", "4", "5"],
    correctAnswer: "3",
    explanation: "Hình tam giác có 3 cạnh."
  }
];

export default function Learning() {
  const [, navigate] = useLocation();
  const { openChatWithMessage } = useChat();

  // Mode state
  const [mode, setMode] = useState<Mode>("learning");

  // Learning mode states
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [notes, setNotes] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [showMiniQuiz, setShowMiniQuiz] = useState(false);
  const [miniQuizQuestions, setMiniQuizQuestions] = useState<any[]>([]);
  const [currentMiniQuiz, setCurrentMiniQuiz] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [needsReview, setNeedsReview] = useState(false);

  // Practice mode states
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [practiceAnswer, setPracticeAnswer] = useState<string>("");
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [showPracticeInfoModal, setShowPracticeInfoModal] = useState(false);
  const [studentName, setStudentName] = useState("");

  const [studentGrade, setStudentGrade] = useState("");

  // Roadmap State
  const [learningDuration, setLearningDuration] = useState("30");
  const [weakLessons, setWeakLessons] = useState<any[]>([]);
  const [activeLesson, setActiveLesson] = useState<any>(null);

  useEffect(() => {
    const fetchPath = async () => {
      let lessons: any[] = [];
      const storedUser = JSON.parse(localStorage.getItem('mathocean_user') || 'null');
      const userId = storedUser?.id;

      try {
        if (userId) {
          const res = await fetch(`/api/learning-paths/${userId}`);
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
        const videoRes = await fetch(`/api/videos?grade=${grade}`);
        const videos = await videoRes.json();

        if (videos && videos.length > 0) {
          const mapTitleToVideos = (title: string, chapterName: string) => {
            // Remove common prefixes/words for better matching
            const cleanStr = (s: string) => {
              return s.toLowerCase()
                .replace(/\s+/g, ' ')
                .replace(/bài \d+[-:]?\s*/g, '') // remove "Bài 1:", "Bài 2 -", etc
                .replace(/^ôn tập\s+/g, '')
                .trim();
            };

            const nTitle = cleanStr(title);
            const nChapter = chapterName ? cleanStr(chapterName) : '';
            
            return videos.filter((v: any) => {
               if (!v.lesson_name) return false;
               const nVideoLesson = cleanStr(v.lesson_name);
               const nVideoChapter = v.chapter_name ? cleanStr(v.chapter_name) : '';
               
               // Strong match: lesson name contains the other
               if (nVideoLesson.includes(nTitle) || nTitle.includes(nVideoLesson)) {
                 return true;
               }

               // Fallback: If both are short and very similar, or chapter matches exactly
               if (nTitle.length > 5 && nVideoLesson.length > 5) {
                  const titleWords = nTitle.split(' ').filter(w => w.length > 2);
                  if (titleWords.length > 0) {
                      const matchCount = titleWords.filter(w => nVideoLesson.includes(w)).length;
                      if (matchCount >= Math.ceil(titleWords.length * 0.7)) { // 70% of meaningful words match
                         return true;
                      }
                  }
               }

               // If the lesson is just "Ôn tập [Chương]" then match with any video that is a review for that chapter
               if (nTitle.includes('ôn tập') || title.toLowerCase().startsWith('ôn tập')) {
                  if (nChapter && nVideoChapter && (nVideoChapter.includes(nChapter) || nChapter.includes(nVideoChapter))) {
                      // Check if video is also a review
                      if (nVideoLesson.includes('ôn tập') || nVideoLesson.includes('luyện tập') || nVideoLesson.includes('kiểm tra')) {
                          return true;
                      }
                  }
               }

               return false;
            });
          };

          // Filter review videos for fallback
          const reviewVideos = videos.filter((v: any) => 
            v.lesson_name && (v.lesson_name.toLowerCase().includes('ôn tập') || v.lesson_name.toLowerCase().includes('luyện tập'))
          );

          lessons.forEach((l: any) => {
            let matchedVideos = mapTitleToVideos(l.title, l.chapter);
            
            // If strictly no video matched, try to find a chapter-level review video
            if (matchedVideos.length === 0 && l.chapter) {
                const nChapter = l.chapter.toLowerCase().replace(/\s+/g, ' ');
                matchedVideos = reviewVideos.filter((v: any) => 
                   v.chapter_name && v.chapter_name.toLowerCase().replace(/\s+/g, ' ').includes(nChapter)
                );
            }

            // Ultimate fallback: Just take any video from the same chapter
            if (matchedVideos.length === 0 && l.chapter) {
                const nChapter = l.chapter.toLowerCase().replace(/\s+/g, ' ');
                matchedVideos = videos.filter((v: any) => 
                   v.chapter_name && v.chapter_name.toLowerCase().replace(/\s+/g, ' ').includes(nChapter)
                );
            }

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
  const [drawingMode, setDrawingMode] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnShapes, setDrawnShapes] = useState<Array<{
    type: 'rectangle',
    x: number,
    y: number,
    width: number,
    height: number,
    id: string
  }>>([]);
  const [startPoint, setStartPoint] = useState<{ x: number, y: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);

  const currentQuestion = practiceQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / practiceQuestions.length) * 100;

  // Mode switching handlers
  const switchToLearning = () => {
    setMode("learning");
    // Reset practice states
    setCurrentQuestionIndex(0);
    setPracticeAnswer("");
    setUserAnswers({});
  };

  const switchToPractice = () => {
    // Show info modal first
    setShowPracticeInfoModal(true);
  };

  const startPractice = () => {
    if (studentName && studentGrade) {
      setShowPracticeInfoModal(false);
      setMode("practice");
      // Reset learning states
      setShowAnswer(false);
      setSelectedAnswer("");
    }
  };

  // Practice mode handlers
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setPracticeAnswer(userAnswers[currentQuestionIndex - 1] || "");
    }
  };

  const handleNext = () => {
    if (practiceAnswer) {
      setUserAnswers({ ...userAnswers, [currentQuestionIndex]: practiceAnswer });
    }

    if (currentQuestionIndex < practiceQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setPracticeAnswer(userAnswers[currentQuestionIndex + 1] || "");
    } else {
      navigate("/practice-results");
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  // Learning mode handlers
  const handleQuizSubmit = async () => {
    setShowAnswer(true);

    if (selectedAnswer !== quizQuestion.correctAnswer) {
      try {
        const response = await fetch('/api/mini-quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: "hàm số bậc nhất",
            difficulty: 2
          }),
        });

        const data = await response.json();
        if (data.questions && data.questions.length > 0) {
          setMiniQuizQuestions(data.questions);
          setShowMiniQuiz(true);
          setCurrentMiniQuiz(0);
        }
      } catch (error) {
        setNeedsReview(true);
      }
    } else {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2000);
    }
  };

  const handleVideoPlay = () => {
    setIsPlaying(!isPlaying);
  };

  const extractVideoId = (url: string) => {
    if (!url) return "";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : "";
  };

  const getYouTubeEmbedUrl = (videoId: string) => {
    if (!videoId) return "";
    // If it's already a full URL, extract the ID
    if (videoId.includes('http')) {
      videoId = extractVideoId(videoId);
    }
    return `https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0&modestbranding=1`;
  };

  // Drawing functions
  const toggleDrawingMode = () => {
    setDrawingMode(!drawingMode);
    if (!drawingMode) {
      setTimeout(() => setupCanvas(), 100);
    }
  };

  const setupCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      redrawShapes();
    }
  };

  const redrawShapes = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawnShapes.forEach(shape => {
      ctx.strokeStyle = selectedShapeId === shape.id ? 'rgba(255, 0, 0, 1)' : 'rgba(255, 0, 0, 0.8)';
      ctx.lineWidth = selectedShapeId === shape.id ? 4 : 3;
      ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';

      ctx.beginPath();
      ctx.rect(shape.x, shape.y, shape.width, shape.height);
      ctx.stroke();
      ctx.fill();
    });
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const point = {
      x: clientX - rect.left,
      y: clientY - rect.top
    };

    setIsDrawing(true);
    setStartPoint(point);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !startPoint) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const currentPoint = {
      x: clientX - rect.left,
      y: clientY - rect.top
    };

    redrawShapes();

    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    const width = currentPoint.x - startPoint.x;
    const height = currentPoint.y - startPoint.y;
    ctx.beginPath();
    ctx.rect(startPoint.x, startPoint.y, width, height);
    ctx.stroke();

    ctx.setLineDash([]);
  };

  const stopDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !startPoint) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const endPoint = {
      x: clientX - rect.left,
      y: clientY - rect.top
    };

    const shapeId = `shape-${Date.now()}`;
    const width = endPoint.x - startPoint.x;
    const height = endPoint.y - startPoint.y;

    if (Math.abs(width) > 30 && Math.abs(height) > 30) {
      const newShape = {
        type: 'rectangle' as const,
        x: width < 0 ? endPoint.x : startPoint.x,
        y: height < 0 ? endPoint.y : startPoint.y,
        width: Math.abs(width),
        height: Math.abs(height),
        id: shapeId
      };
      setDrawnShapes(prev => [...prev, newShape]);
      setSelectedShapeId(shapeId);
    }

    setIsDrawing(false);
    setStartPoint(null);
  };

  const clearAllShapes = () => {
    setDrawnShapes([]);
    setSelectedShapeId(null);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  useEffect(() => {
    if (drawingMode) {
      redrawShapes();
    }
  }, [drawnShapes, selectedShapeId, drawingMode]);

  const sendDrawingToChatbot = async () => {
    if (selectedShapeId) {
      const selectedShape = drawnShapes.find(shape => shape.id === selectedShapeId);
      if (selectedShape) {
        const message = `Tôi đã khoanh vùng một phần trong video mà tôi không hiểu (vùng chữ nhật). Bạn có thể giải thích cho tôi không?`;

        try {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message,
              context: `User highlighted an area they don't understand in the lesson: ${currentLesson.title}. Selected rectangle area: ${selectedShape.width}x${selectedShape.height}px`,
              shapeData: selectedShape
            }),
          });

          const data = await response.json();

          setDrawnShapes([]);
          setSelectedShapeId(null);
          setDrawingMode(false);

          openChatWithMessage(message, data.response);
        } catch (error) {
          setDrawnShapes([]);
          setSelectedShapeId(null);
          setDrawingMode(false);

          openChatWithMessage(message, "Xin lỗi, đã có lỗi xảy ra khi xử lý yêu cầu. Vui lòng thử lại.");
        }
      }
    }
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Baloo+2:wght@400;600;700;800&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <style>{`
        body {
          font-family: 'Baloo 2', cursive !important;
        }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .main-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border: 4px solid white;
          box-shadow: 0 20px 40px rgba(0, 174, 239, 0.1);
          border-radius: 32px;
        }
        .sidebar-card {
          background: white;
          border: 2px solid white;
          box-shadow: 0 10px 20px rgba(0, 174, 239, 0.05);
          border-radius: 24px;
        }
        .bubble-float {
          position: absolute;
          background: rgba(255, 255, 255, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.6);
          border-radius: 50%;
          pointer-events: none;
          box-shadow: inset -5px -5px 10px rgba(0, 0, 0, 0.05), inset 5px 5px 10px rgba(255, 255, 255, 0.8);
        }
        .btn-3d-orange {
          box-shadow: 0 4px 0 #E68A00;
          transition: all 0.1s ease;
        }
        .btn-3d-orange:active {
          box-shadow: 0 1px 0 #E68A00;
          transform: translateY(3px);
        }
        .btn-3d-blue {
          box-shadow: 0 4px 0 #0088BC;
          transition: all 0.1s ease;
        }
        .btn-3d-blue:active {
          box-shadow: 0 1px 0 #0088BC;
          transform: translateY(3px);
        }
        .notepad-lines {
          background-image: linear-gradient(#e1e8f0 1px, transparent 1px);
          background-size: 100% 28px;
          line-height: 28px;
        }
        .video-container {
          aspect-ratio: 16 / 9;
          background: #000;
          border-radius: 24px;
          overflow: hidden;
          position: relative;
        }
        .answer-btn {
          width: 100%;
          text-align: left;
          padding: 1.25rem 2rem;
          border: 2px solid #DBEAFE;
          border-radius: 40px;
          color: #0A2463;
          font-weight: bold;
          font-size: 1.125rem;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 4px 0 #DBEAFE;
        }
        .answer-btn:hover {
          border-color: #00AEEF;
          background-color: rgba(219, 234, 254, 0.5);
        }
        .answer-btn:active {
          transform: translateY(2px);
          box-shadow: 0 2px 0 #DBEAFE;
        }
        .answer-btn.selected {
          border-color: #00AEEF;
          background-color: rgba(0, 174, 239, 0.1);
        }
        .progress-trail {
          background: #E0F2FE;
          height: 12px;
          border-radius: 999px;
          position: relative;
          overflow: hidden;
        }
        .progress-bar {
          background: linear-gradient(90deg, #00AEEF 0%, #38BDF8 100%);
          height: 100%;
          border-radius: 999px;
          position: relative;
          transition: width 0.3s ease;
        }
        .progress-bubble {
          position: absolute;
          right: -4px;
          top: 50%;
          transform: translateY(-50%);
          width: 18px;
          height: 18px;
          background: white;
          border: 3px solid #00AEEF;
          border-radius: 50%;
        }
      `}</style>

      {/* Drawing Canvas Overlay */}
      {drawingMode && (
        <div className="fixed inset-0 z-50 bg-black/20">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            data-testid="drawing-canvas"
          />

          <Button
            onClick={toggleDrawingMode}
            className="absolute top-24 right-4 bg-red-500 hover:bg-red-600 text-white rounded-full p-2"
            size="sm"
          >
            <X size={20} />
          </Button>

          <div className="absolute top-24 left-4 bg-white rounded-lg shadow-lg p-4 space-y-3">
            <div className="space-y-2">
              <label className="text-xs font-medium">Vẽ hình chữ nhật</label>
              <p className="text-xs text-gray-500">Kéo thả để chọn vùng</p>
            </div>

            <Button
              onClick={clearAllShapes}
              size="sm"
              variant="outline"
              className="w-full"
            >
              <RotateCcw size={16} className="mr-2" />
              Xóa tất cả
            </Button>
          </div>

          {selectedShapeId && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Button
                onClick={sendDrawingToChatbot}
                className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg animate-pulse"
                size="lg"
              >
                <Send size={20} className="mr-2" />
                Giải đáp
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="min-h-screen bg-[#EAF6FF] pb-12">
        {/* Floating Bubbles Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="bubble-float w-12 h-12 left-[8%] top-[15%]"></div>
          <div className="bubble-float w-24 h-24 left-[85%] top-[12%]"></div>
          <div className="bubble-float w-20 h-20 left-[42%] top-[75%]"></div>
          <div className="bubble-float w-10 h-10 left-[78%] top-[85%]"></div>
          <div className="bubble-float w-32 h-32 left-[3%] top-[65%]"></div>
        </div>

        {/* Header */}
        <AppHeader />

        {/* Main Content */}
        <main className="relative z-10 container mx-auto px-4 pt-24">
          <div className="flex flex-col lg:flex-row gap-8 mb-8">
            {/* Sidebar */}
            <aside className="lg:w-1/4 space-y-6">
              {/* Mode Selection */}
              <div className="sidebar-card p-6">
                <h2 className="text-[#0A2463] font-black uppercase tracking-wider text-sm mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#00AEEF] text-xl">list_alt</span>
                  NỘI DUNG
                </h2>
                <div className="space-y-4">
                  <button
                    onClick={switchToLearning}
                    className={`w-full ${mode === 'learning' ? 'bg-[#FF9F1C] btn-3d-orange' : 'bg-[#00AEEF] btn-3d-blue'} text-white font-black py-3 rounded-2xl flex items-center justify-center gap-2`}
                  >
                    <span className="material-symbols-outlined">menu_book</span>
                    HỌC TẬP
                  </button>
                  <button
                    onClick={switchToPractice}
                    className={`w-full ${mode === 'practice' ? 'bg-[#FF9F1C] btn-3d-orange' : 'bg-[#00AEEF] btn-3d-blue'} text-white font-black py-3 rounded-2xl flex items-center justify-center gap-2`}
                  >
                    <span className="material-symbols-outlined">fitness_center</span>
                    ÔN LUYỆN
                  </button>
                </div>
              </div>

              {mode === 'learning' && (
                <>
                  {/* Progress */}
                  <div className="sidebar-card p-6">
                    <h2 className="text-[#0A2463] font-black uppercase tracking-wider text-sm mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#00AEEF] text-xl">trending_up</span>
                      TIẾN ĐỘ BÀI HỌC
                    </h2>

                    <div className="mb-4 text-center">
                      <h3 className="text-[#0A2463] font-extrabold text-lg">LỘ TRÌNH {learningDuration} NGÀY</h3>
                    </div>

                    <div className="flex flex-col items-center mb-6">
                      <div className="relative w-32 h-32 mb-2">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          <circle className="text-blue-50" cx="50" cy="50" fill="transparent" r="40"
                            stroke="currentColor" strokeWidth="10"></circle>
                          <circle className="text-[#00AEEF]" cx="50" cy="50" fill="transparent" r="40"
                            stroke="currentColor" strokeDasharray="251.2"
                            strokeDashoffset={251.2 - (251.2 * (weakLessons.filter(l => l.completed).length / (weakLessons.length || 1)))}
                            strokeLinecap="round" strokeWidth="10"></circle>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-black text-[#0A2463]">
                            {Math.round((weakLessons.filter(l => l.completed).length / (weakLessons.length || 1)) * 100)}%
                          </span>
                        </div>
                      </div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Đã hoàn thành</p>
                    </div>

                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                      {weakLessons.length === 0 ? (
                        <p className="text-sm text-center text-slate-500">Chưa có bài học cần cải thiện.</p>
                      ) : (
                        weakLessons.map((lesson, idx) => (
                          <div
                            key={idx}
                            onClick={() => { setActiveLesson(lesson); setSelectedVideoIndex(0); setIsPlaying(false); }}
                            className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors ${activeLesson === lesson ? 'bg-blue-100 border border-blue-200' : 'hover:bg-slate-50'}`}
                          >
                            <div className={`mt-1 min-w-[16px] h-4 rounded-full border-2 ${lesson.completed ? 'bg-green-500 border-green-500' : 'bg-slate-200 border-slate-300'}`}></div>
                            <div className="flex-1">
                              {(lesson.chapter !== lesson.title) && (
                                <p className={`text-xs font-bold uppercase mb-0.5 whitespace-normal ${lesson.completed ? 'text-green-600' : 'text-slate-400'}`}>
                                  {lesson.chapter}
                                </p>
                              )}
                              <p className={`text-sm font-bold leading-tight whitespace-normal ${lesson.completed ? 'text-green-700' : 'text-slate-600'} ${activeLesson === lesson ? 'text-navy-blue' : ''}`}>
                                {lesson.title}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="sidebar-card p-6">
                    <h2 className="text-[#0A2463] font-black uppercase tracking-wider text-sm mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#00AEEF] text-xl">edit_note</span>
                      GHI CHÚ CỦA BẠN
                    </h2>
                    <div className="bg-blue-50/50 rounded-xl p-4 min-h-[120px] notepad-lines">
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full border-none bg-transparent resize-none text-sm font-semibold text-slate-600 focus:ring-0 focus:outline-none"
                        rows={4}
                        placeholder="Hôm nay mình học về..."
                      />
                    </div>
                    <Button className="w-full mt-3 bg-gray-100 text-gray-700 hover:bg-gray-200" variant="outline">
                      <Save size={16} className="mr-2" />
                      Lưu ghi chú
                    </Button>
                  </div>
                </>
              )}
            </aside>

            {/* Main Content Area */}
            <section className="lg:w-3/4">
              {mode === 'learning' ? (
                // LEARNING MODE
                <div className="main-card p-6 md:p-8">
                  {/* Lesson Title */}
                  <div className="mb-6">
                    {activeLesson?.chapter && activeLesson.chapter !== activeLesson.title && (
                      <h4 className="text-sm font-bold text-slate-500 uppercase mb-2 tracking-wide">
                        {activeLesson.chapter}
                      </h4>
                    )}
                    <h1 className="text-2xl md:text-3xl font-black text-[#0A2463] font-['Baloo_2'] uppercase tracking-tight flex items-center gap-3">
                      <span className="w-10 h-10 bg-[#00AEEF]/10 rounded-lg flex items-center justify-center text-[#00AEEF]">
                        <span className="material-symbols-outlined">play_lesson</span>
                      </span>
                      {activeLesson ? activeLesson.title : 'BÀI HỌC ...'}
                    </h1>
                  </div>


                  {/* Video Player */}
                  <div className="video-container mb-8 relative">
                    {/* Always show the YouTube iframe directly */}
                    <iframe
                      width="100%"
                      height="100%"
                      src={getYouTubeEmbedUrl(activeLesson?.videos?.[selectedVideoIndex]?.video_url || currentLesson.videoId)}
                      title="Video giảng dạy toán học"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full absolute top-0 left-0"
                      data-testid="youtube-player"
                    />
                  </div>

                  {/* Video Playlist Buttons */}
                  <div>
                    <h2 className="text-[#0A2463] font-black uppercase tracking-wider text-lg mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#00AEEF]">video_library</span>
                      VIDEO BÀI GIẢNG
                    </h2>
                    <div className="flex flex-wrap gap-3 mb-6">
                      {activeLesson?.videos?.map((v: any, i: number) => (
                        <button
                          key={v.id || i}
                          onClick={() => {
                            setIsPlaying(true);
                            setSelectedVideoIndex(i);
                          }}
                          className={`transition-colors font-bold py-3 px-6 rounded-xl border-2 text-center uppercase ${selectedVideoIndex === i && isPlaying ? "bg-[#00AEEF] text-white border-[#00AEEF]" : "bg-blue-50 hover:bg-[#00AEEF] hover:text-white text-[#00AEEF] border-[#00AEEF]/10"}`}
                        >
                          VIDEO {i + 1}
                        </button>
                      ))}
                      {(!activeLesson?.videos || activeLesson.videos.length === 0) && (
                        <div className="text-gray-500 italic">Khuyến nghị video liên quan...</div>
                      )}
                    </div>
                    <div className="bg-[#FF9F1C]/10 border-l-4 border-[#FF9F1C] p-4 rounded-r-xl">
                      <p className="text-[#0A2463] font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#FF9F1C]">tips_and_updates</span>
                        MẸO: BẤM VÀO CÂU HỎI ĐỂ MỞ BOXCHAT VÀ NHẬN SỰ GỢI Ý TỪ AI
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                // PRACTICE MODE
                <div className="main-card p-8 md:p-12">
                  {/* Progress Header */}
                  <div className="mb-10">
                    <div className="flex justify-between items-center mb-4">
                      <h1 className="text-2xl font-black text-[#0A2463] font-['Baloo_2'] uppercase tracking-tight">
                        ÔN LUYỆN BÀI TẬP
                      </h1>
                      <span className="text-[#00AEEF] font-black text-lg">
                        TIẾN ĐỘ: {currentQuestionIndex + 1}/{practiceQuestions.length}
                      </span>
                    </div>
                    <div className="progress-trail">
                      <div className="progress-bar" style={{ width: `${progress}%` }}>
                        <div className="progress-bubble"></div>
                      </div>
                    </div>
                  </div>

                  {/* Question */}
                  <div className="space-y-8">
                    <div className="bg-blue-50/30 p-8 rounded-3xl border border-blue-100/50">
                      <h2 className="text-sm font-black text-[#00AEEF] uppercase tracking-[0.2em] mb-4">
                        CÂU HỎI {currentQuestion.id}:
                      </h2>
                      <p className="text-2xl md:text-3xl font-black text-[#0A2463] font-['Baloo_2'] leading-tight">
                        {currentQuestion.question}
                      </p>
                    </div>

                    {/* Answer Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentQuestion.options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => setPracticeAnswer(option)}
                          className={`answer-btn ${practiceAnswer === option ? 'selected' : ''}`}
                        >
                          <span className="w-10 h-10 rounded-full bg-blue-100 text-[#00AEEF] flex items-center justify-center font-black flex-shrink-0">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span>{option}</span>
                        </button>
                      ))}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-gray-100">
                      <button
                        onClick={handlePrevious}
                        disabled={currentQuestionIndex === 0}
                        className="flex items-center gap-2 text-[#00AEEF] font-extrabold px-8 py-3 rounded-full border-2 border-[#00AEEF]/20 hover:bg-[#00AEEF] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="material-symbols-outlined">chevron_left</span>
                        CÂU TRƯỚC
                      </button>

                      <button
                        onClick={handleSkip}
                        className="text-[#0A2463]/60 font-black hover:text-[#0A2463] transition-colors uppercase tracking-widest text-sm"
                      >
                        BỎ QUA
                      </button>

                      <button
                        onClick={handleNext}
                        disabled={!practiceAnswer}
                        className="bg-[#FF9F1C] btn-3d-orange text-white text-xl font-black py-3 px-12 rounded-full flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {currentQuestionIndex === practiceQuestions.length - 1 ? 'HOÀN THÀNH' : 'CÂU TIẾP'}
                        <span className="material-symbols-outlined">chevron_right</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        </main>

        {/* Ocean Wave at Bottom */}
        <div className="fixed bottom-0 left-0 w-full h-24 pointer-events-none opacity-20 z-0">
          <svg className="absolute bottom-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 320">
            <path
              d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              fill="#00AEEF"
            />
          </svg>
        </div>

        {/* Practice Info Modal */}
        {showPracticeInfoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl">
              <h2 className="text-2xl font-black text-[#0A2463] text-center mb-8 uppercase tracking-tight">
                THÔNG TIN ÔN LUYỆN
              </h2>

              <div className="space-y-6">
                {/* Name Input */}
                <div>
                  <label className="block text-sm font-bold text-[#0A2463] mb-2 uppercase">
                    TÊN:
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 material-symbols-outlined text-[#00AEEF]">
                      person
                    </span>
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Nhập tên của con..."
                      className="w-full pl-12 pr-4 py-3 border-2 border-blue-100 rounded-full focus:border-[#00AEEF] focus:outline-none font-semibold text-[#0A2463] placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* Grade Selection */}
                <div>
                  <label className="block text-sm font-bold text-[#0A2463] mb-2 uppercase">
                    LỚP:
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 material-symbols-outlined text-[#00AEEF]">
                      school
                    </span>
                    <select
                      value={studentGrade}
                      onChange={(e) => setStudentGrade(e.target.value)}
                      className="w-full pl-12 pr-12 py-3 border-2 border-blue-100 rounded-full focus:border-[#00AEEF] focus:outline-none font-semibold text-[#0A2463] appearance-none bg-white cursor-pointer"
                    >
                      <option value="">Chọn lớp của con</option>
                      <option value="1">Lớp 1</option>
                      <option value="2">Lớp 2</option>
                      <option value="3">Lớp 3</option>
                      <option value="4">Lớp 4</option>
                      <option value="5">Lớp 5</option>
                      <option value="6">Lớp 6</option>
                      <option value="7">Lớp 7</option>
                      <option value="8">Lớp 8</option>
                      <option value="9">Lớp 9</option>
                    </select>
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 material-symbols-outlined text-[#FF9F1C] pointer-events-none">
                      folder
                    </span>
                  </div>
                </div>

                {/* Start Button */}
                <button
                  onClick={startPractice}
                  disabled={!studentName || !studentGrade}
                  className="w-full bg-[#FF9F1C] hover:bg-[#E68A00] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-black py-4 rounded-full text-lg uppercase tracking-wide flex items-center justify-center gap-2 transition-all mt-8 btn-3d-orange"
                >
                  BẮT ĐẦU
                  <span className="material-symbols-outlined">play_circle</span>
                </button>

                {/* Close button */}
                <button
                  onClick={() => setShowPracticeInfoModal(false)}
                  className="w-full text-gray-500 hover:text-gray-700 font-bold py-2 text-sm uppercase"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Celebration Animation */}
        {showCelebration && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl p-8 text-center animate-bounce">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-black text-green-600 mb-2">Xuất sắc!</h3>
              <p className="text-gray-600">Bạn đã trả lời đúng!</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
