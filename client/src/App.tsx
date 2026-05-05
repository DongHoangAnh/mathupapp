import { useEffect, useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ChatWidget from "@/components/chat-widget";
import { ChatProvider } from "@/contexts/chat-context";
import RoleSelectionModal from "@/components/role-selection-modal";
import { useRoleCheck } from "@/hooks/use-role-check";
import Home from "@/pages/home-ocean-v2";
import Assessment from "@/pages/assessment";
import AdaptiveTest from "@/pages/adaptive-test";
import AdaptiveLearning from "@/pages/adaptive-learning";
import Onboarding from "@/pages/onboarding";
import Practice from "@/pages/practice";
import PracticeResults from "@/pages/practice-results";
import UnitQuiz from "@/pages/unit-quiz";
import Mastery from "@/pages/mastery";
import Learning from "@/pages/learning";
import GameShow from "@/pages/gameshow";
import Leaderboard from "@/pages/leaderboard";
import DiagnosticReport from "@/pages/diagnostic-report";
import NotFound from "@/pages/not-found";
import Payment from "@/pages/payment.tsx";
import PaymentCheckout from "@/pages/payment-checkout.tsx";
import PaymentSuccess from "@/pages/payment-success.tsx";
import UserDetail from "@/pages/userdetail.tsx";
import StudentDetailContent from "@/pages/studentdetail.tsx";
import ListChildAccounts from "@/pages/parent.tsx";
import ViewWeaknessAreas from "@/pages/weakness.tsx";
import ListClasses from "@/pages/classlist.tsx";
import ListStudentsInClass from "@/pages/student-in-class.tsx";
import AddCustomTest from "@/pages/customtest.tsx";
import ListUsers from "@/pages/listuser.tsx";
import SignIn from "@/pages/signin";
import SignUp from "@/pages/signup";
import Profile from "@/pages/profile";
import RoleDemo from "@/pages/role-demo";
import AuthCallback from "@/pages/auth-callback";
import TeacherClasses from "@/pages/teacher-classes";
import TeacherClassDetail from "@/pages/teacher-class-detail";
import ParentChildren from "@/pages/parent-children";
import ParentChildDetail from "@/pages/parent-child-detail";
import ParentWeakPoints from "@/pages/parent-weak-points";
import { supabase } from "@/lib/supabase";
import ProtectedRoute from "@/components/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/onboarding">
        <ProtectedRoute>
          <Onboarding />
        </ProtectedRoute>
      </Route>
      <Route path="/assessment">
        <ProtectedRoute>
          <Assessment />
        </ProtectedRoute>
      </Route>
      <Route path="/adaptive-test" component={AdaptiveTest} />
      <Route path="/adaptive-learning" component={AdaptiveLearning} />
      <Route path="/practice" component={Practice} />
      <Route path="/practice-results" component={PracticeResults} />
      <Route path="/unit-quiz" component={UnitQuiz} />
      <Route path="/mastery" component={Mastery} />
      <Route path="/learning">
        <ProtectedRoute>
          <Learning />
        </ProtectedRoute>
      </Route>
      <Route path="/gameshow" component={GameShow} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/diagnostic-report" component={DiagnosticReport} />
      <Route path="/payment" component={Payment} />
      <Route path="/payment/checkout" component={PaymentCheckout} />
      <Route path="/payment/success" component={PaymentSuccess} />
      <Route path="/userdetail" component={UserDetail} />
      <Route path="/studentdetail" component={StudentDetailContent} />
      <Route path="/parent" component={ListChildAccounts} />
      <Route path="/weakness" component={ViewWeaknessAreas} />
      <Route path="/teacher" component={ListClasses} />
      <Route path="/classdetail" component={ListStudentsInClass} />
      <Route path="/auth/callback" component={AuthCallback} />
      <Route path="/login" component={SignIn} />
      <Route path="/signup" component={SignUp} />
      <Route path="/profile" component={Profile} />
      <Route path="/customtest" component={AddCustomTest} />
      <Route path="/admin" component={ListUsers} />
      <Route path="/role-demo" component={RoleDemo} />
      <Route path="/teacher/classes/:id" component={TeacherClassDetail} />
      <Route path="/teacher/classes" component={TeacherClasses} />
      <Route path="/parent/children/:id/weak-points" component={ParentWeakPoints} />
      <Route path="/parent/children/:id" component={ParentChildDetail} />
      <Route path="/parent/children" component={ParentChildren} />

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Check if user needs to select a role
  const { needsRoleSelection, userId, isChecking, markRoleSelected } = useRoleCheck();
  const [location] = useLocation();
  const [userRole, setUserRole] = useState<string>('');

  // Don't show modal on auth pages
  const isAuthPage = location === '/login' || location === '/signup';

  useEffect(() => {
    // Listen for auth state changes (e.g., after Google OAuth redirect)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {

      if ((event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') && session?.user) {
        // Sync with localStorage
        const metadata = session.user.user_metadata || {};
        // Fetch actual subscription status from Supabase
        let isPro = metadata.isPro || false;
        let plan = metadata.plan || null;

        try {
          const { data: subData, error } = await supabase
            .from('subscriptions')
            .select('plan_type, end_date, status')
            .eq('user_id', session.user.id)
            .eq('status', 'active')
            .order('end_date', { ascending: false })
            .limit(1);

          if (!error && subData && subData.length > 0) {
            const currentSub = subData[0];
            const endDate = currentSub.end_date ? new Date(currentSub.end_date) : new Date(8640000000000000); // far future fallback
            if (endDate > new Date()) {
              isPro = true;
              plan = currentSub.plan_type;
            }
          }
        } catch (e) {
          console.error('Failed to fetch subscription status', e);
        }

        const userForStorage = {
          id: session.user.id,
          email: session.user.email,
          username: metadata.full_name || (session.user.email ? session.user.email.split('@')[0] : 'User'),
          fullName: metadata.full_name || session.user.email?.split('@')[0],
          role: metadata.role || '', // Don't default to 'student' - let user choose
          avatar: metadata.avatar_url || metadata.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuBMY6Y7iBe8JiebVAqhC0v-bFt0EuAXYjQm77vfcIev-JKNoGAsEMznAy1PdP2ZQf1qyLRLJ5SaYzbD3_HQqfUyzC_w_0VJ5MusYl4u64NLNkPyQ3vEVBdnD4Lf0hOtwNBYpKPj3A57EionFLxmJ9qe_g6WftvZZzfC0wTJn9epeiYXTINqVAY_nfUqYtnQVxw7QOYt0w--AQdC0tZ042RxhFMMNhmc8dFPOOlSIoJEDssO3Rb8MAnIE4JLP47mGFeF5cKgQTDCZ7Q",
          isPro,
          plan
        };
        localStorage.setItem('mathocean_user', JSON.stringify(userForStorage));
        window.dispatchEvent(new Event('authChange'));
        setUserRole(metadata.role || '');
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('mathocean_user');
        window.dispatchEvent(new Event('authChange'));
        setUserRole('');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ChatProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-gray-50">
            <Router />

            {/* ChatWidget - Hidden for teachers and parents */}
            {userRole !== 'teacher' && userRole !== 'parent' && <ChatWidget />}

            <Toaster />

            {/* Role Selection Modal - Shows when user doesn't have a role */}
            {/* Don't show on auth pages to avoid blocking logout flow */}
            {!isChecking && !isAuthPage && (
              <RoleSelectionModal
                isOpen={needsRoleSelection}
                userId={userId}
                onRoleSelected={markRoleSelected}
              />
            )}
          </div>
        </TooltipProvider>
      </ChatProvider>
    </QueryClientProvider>
  );
}

export default App;
