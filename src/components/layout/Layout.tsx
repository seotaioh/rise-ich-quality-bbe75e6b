import { ReactNode } from "react";
import { Navigation } from "./Navigation";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-6 py-8">
        {children}
      </main>

      <footer className="border-t border-border bg-card/30 mt-12">
        <div className="container mx-auto px-6 py-6">
          <p className="text-sm text-muted-foreground text-center">
            ICH-3000 Quality Management System © 2024 | 실시간 품질 모니터링 및 분석
          </p>
        </div>
      </footer>
    </div>
  );
};
