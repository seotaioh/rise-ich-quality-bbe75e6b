import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import DefectCodePage from "./pages/DefectCodePage";
import DefectAnalysis from "./pages/DefectAnalysis";
import ProcessDefects from "./pages/ProcessDefects";
import WorkerDefects from "./pages/WorkerDefects";
import WorkerPerformance from "./pages/WorkerPerformance";
import NotFound from "./pages/NotFound";
import { Layout } from "./components/layout/Layout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/defect-code" element={<Layout><DefectCodePage /></Layout>} />
          <Route path="/analysis" element={<Layout><DefectAnalysis /></Layout>} />
          <Route path="/process-defects" element={<Layout><ProcessDefects /></Layout>} />
          <Route path="/worker-defects" element={<Layout><WorkerDefects /></Layout>} />
          <Route path="/workers" element={<Layout><WorkerPerformance /></Layout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
