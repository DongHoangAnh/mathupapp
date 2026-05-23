Optimizing tool selection...

Searched for files matching `**/*gameshow* **/*auth* **/*account* **/*user*`, no matches

Searched for files matching `**/client/src/pages/**`, 20 matches

Searched for files matching `**/server/**`, 20 matches

Read [](file:///d%3A/personalizedmath/server/gameshow-ws.ts#1-1), lines 1 to 300

Read [](file:///d%3A/personalizedmath/shared/schema.ts)

Read [](file:///d%3A/personalizedmath/client/src/pages/gameshow.tsx#1-1), lines 1 to 300

Read [](file:///d%3A/personalizedmath/client/src/contexts/auth-context.tsx)

Read [](file:///d%3A/personalizedmath/server/routes.ts#1-1), lines 1 to 200

Read [](file:///d%3A/personalizedmath/client/src/hooks/useGameShowWS.ts#1-1), lines 1 to 250

Read [](file:///d%3A/personalizedmath/client/src/components/protected-route.tsx)

Read [](file:///d%3A/personalizedmath/package.json)

Dưới đây là các file quan trọng liên quan **Gameshow** và **Auth/Account** để bạn phát triển app mobile: 

Created memory file [](file:///c%3A/Users/dongh/AppData/Roaming/Code/User/workspaceStorage/5b6f0a0d6adc63aaa74452e191c48844/GitHub.copilot-chat/memory-tool/memories/MjM4NDM2NzMtZGY5Yy00MmIxLTgxMGYtNjI5NDVjMTRkY2M0/gameshow-auth-files.md)

## 📦 **Các File Quan Trọng Cho Mobile Development**

### **1️⃣ GAMESHOW - Backend**
gameshow-ws.ts - WebSocket multiplayer quản lý:

**Chức năng chính:**
- `JOIN_QUEUE` → `MATCH_FOUND` → 10 câu hỏi → `GAME_OVER`
- Tự động ghép cặp 2 người chơi
- Tính điểm độc lập (không share turn)
- Lưu kết quả vào Supabase

**WebSocket messages:**
```typescript
// Client → Server
{ type: "JOIN_QUEUE", userId, displayName, grade, winRate, totalScore }
{ type: "SUBMIT_ANSWER", userId, roomId, questionIndex, answer, timeMs }
{ type: "LEAVE_QUEUE", userId }
{ type: "PING" }

// Server → Client  
{ type: "QUEUED" }
{ type: "MATCH_FOUND", roomId, questions[], opponent }
{ type: "OPPONENT_PROGRESS", userId, questionIndex, isCorrect, answeredCount }
{ type: "YOU_FINISHED", waitingFor }
{ type: "GAME_OVER", winnerId, results }
```

---

### **2️⃣ GAMESHOW - Frontend Hook**
useGameShowWS.ts - React hook:

**State machine:**
```
idle → queued → match_found → playing → you_finished → game_over
                                     ↓
                        opponent_disconnected
```

**API chính:**
```typescript
const { state, joinQueue, leaveQueue, submitAnswer, resetGame } = useGameShowWS(
  userId,
  displayName,
  grade,
  totalScore,
  winRate
);

// state.phase: "idle" | "queued" | "playing" | "game_over"
// state.questions: GameQuestion[]
// state.opponent: OpponentInfo
```

---

### **3️⃣ AUTH - Backend Routes**
routes.ts - Authentication endpoints:

```typescript
// User Registration
POST /api/auth/register
Body: { username, password, fullName, role, grade? }
Response: { user }

// User Login  
POST /api/auth/login
Body: { username, password }
Response: { user }

// Get User Profile
GET /api/users/:id
Response: { id, username, fullName, role, grade, points, level, streak, totalXP }

// Update User
PATCH /api/users/:id
Body: { points?, grade?, level?, streak? }
Response: { updatedUser }

// Get Gameshow Leaderboard
GET /api/gameshow/leaderboard?limit=10
Response: [{ rank, displayName, totalScore, avatar }]

// Get User Gameshow Stats
GET /api/gameshow/stats/:userId
Response: { totalScore, rank, matches, wins }
```

---

### **4️⃣ AUTH - Context (State Management)**
auth-context.tsx:

```typescript
interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

// Usage:
const { user, loading, signInWithGoogle, signOut } = useAuth()
```

---

### **5️⃣ DATABASE Schema** 
schema.ts:

```typescript
// Users
users {
  id, username, password, fullName, role,
  grade, subject, points, streak, level, totalXP,
  achievements (JSON), createdAt
}

// Game Scores  
gameScores {
  id, userId, gameType, score, questionsAnswered, completedAt
}

// Questions
questions {
  id, subject, topic, difficulty (1-5),
  question, options (JSON), correctAnswer, explanation
}
```

---

### **6️⃣ Quick Start untuk Mobile**

**1. User Authentication Flow:**
```
Login → Authenticate → Store user data (localStorage/secure storage)
→ Access API with userId
```

**2. Gameshow Flow:**
```
User clicks "Chơi GameShow" 
→ joinQueue(userId) 
→ Wait for opponent (show loading)
→ Match found → Display 10 questions
→ Submit answers independently
→ Both finished → Show results
→ Save to leaderboard
```

**3. WebSocket Connection:**
```
URL: ws://domain/ws/gameshow (or wss for HTTPS)
Auto-reconnect on disconnect
Send PING every 25 seconds (keep-alive)
```

---

Các file này đủ cho bạn xây dựng phần Gameshow + Auth trên mobile. Bạn cần file nào khác không? 🚀