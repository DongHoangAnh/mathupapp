import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import AppHeader from "@/components/app-header";
import { useLocation } from "wouter";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

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

export default function Practice() {
  const [, navigate] = useLocation();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = practiceQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / practiceQuestions.length) * 100;

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(userAnswers[currentQuestionIndex - 1] || "");
    }
  };

  const handleNext = () => {
    // Save current answer
    if (selectedAnswer) {
      setUserAnswers({ ...userAnswers, [currentQuestionIndex]: selectedAnswer });
    }

    if (currentQuestionIndex < practiceQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(userAnswers[currentQuestionIndex + 1] || "");
    } else {
      // Last question - go to results
      navigate("/practice-results");
    }
  };

  const handleSkip = () => {
    handleNext();
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

      <div className="min-h-screen bg-[#EAF6FF]">
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
        <main className="relative z-10 container mx-auto px-4 pt-24 pb-20">
          <div className="flex flex-col lg:flex-row gap-8 items-start justify-center max-w-7xl mx-auto">
            {/* Sidebar */}
            <aside className="lg:w-1/4 w-full">
              <div className="sidebar-card p-6">
                <h2 className="text-[#0A2463] font-black uppercase tracking-wider text-sm mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#00AEEF] text-xl">list_alt</span>
                  NỘI DUNG
                </h2>
                <div className="space-y-4">
                  <button
                    onClick={() => navigate('/learning')}
                    className="w-full bg-[#00AEEF] btn-3d-blue text-white font-black py-3 rounded-2xl flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">menu_book</span>
                    HỌC TẬP
                  </button>
                  <button className="w-full bg-[#FF9F1C] btn-3d-orange text-white font-black py-3 rounded-2xl flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">fitness_center</span>
                    ÔN LUYỆN
                  </button>
                </div>
              </div>
            </aside>

            {/* Main Practice Area */}
            <div className="lg:w-3/4 w-full">
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
                        onClick={() => setSelectedAnswer(option)}
                        className={`answer-btn ${selectedAnswer === option ? 'selected' : ''}`}
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
                      disabled={!selectedAnswer}
                      className="bg-[#FF9F1C] btn-3d-orange text-white text-xl font-black py-3 px-12 rounded-full flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {currentQuestionIndex === practiceQuestions.length - 1 ? 'HOÀN THÀNH' : 'CÂU TIẾP'}
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
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
      </div>
    </>
  );
}