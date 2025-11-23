import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import TimeTracker from "./pages/TimeTracker";
import TodoList from "./pages/TodoList";
import Calendar from "./pages/Calendar";
import Statistics from "./pages/Statistics";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import BottomNav from "./components/BottomNav";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<><TimeTracker /><BottomNav /></>} />
          <Route path="/todos" element={<><TodoList /><BottomNav /></>} />
          <Route path="/calendar" element={<><Calendar /><BottomNav /></>} />
          <Route path="/stats" element={<><Statistics /><BottomNav /></>} />
          <Route path="/settings" element={<><Settings /><BottomNav /></>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
