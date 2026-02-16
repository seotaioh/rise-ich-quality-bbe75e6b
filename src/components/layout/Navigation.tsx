import { NavLink } from "react-router-dom";
import { Activity, Home, Code2, BarChart3, Users, Settings, UserCheck, ClipboardEdit, Database, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useModel } from "@/contexts/ModelContext";

interface NavItemProps {
  to: string;
  icon: LucideIcon;
  children: string;
}

const NavItem = ({ to, icon: Icon, children }: NavItemProps) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium",
          "hover:bg-muted/80",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground"
        )
      }
    >
      <Icon className="h-4 w-4" />
      {children}
    </NavLink>
  );
};

export const Navigation = () => {
  const { selectedModel, setSelectedModelId, models } = useModel();

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 shadow-[var(--shadow-soft)]">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between py-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">생산 모델별 품질관리 시스템</h1>
              <p className="text-sm text-muted-foreground">Process Quality Management System</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">모델:</label>
            <select
              value={selectedModel.id}
              onChange={(e) => setSelectedModelId(e.target.value)}
              className="h-10 rounded-lg border-2 border-primary bg-primary/5 px-4 py-2 text-sm font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex gap-1 py-2 overflow-x-auto">
          <NavItem to="/" icon={Home}>
            대시보드
          </NavItem>
          <NavItem to="/defect-code" icon={Code2}>
            불량코드 생성
          </NavItem>
          <NavItem to="/analysis" icon={BarChart3}>
            불량 분석
          </NavItem>
          <NavItem to="/process-defects" icon={Settings}>
            공정별 불량유형
          </NavItem>
          <NavItem to="/worker-defects" icon={UserCheck}>
            작업자별 불량유형
          </NavItem>
          <NavItem to="/worker-input" icon={ClipboardEdit}>
            생산 입력
          </NavItem>
          <NavItem to="/workers" icon={Users}>
            작업자 실적
          </NavItem>
          <NavItem to="/model-manage" icon={Database}>
            모델 관리
          </NavItem>
        </div>
      </div>
    </nav>
  );
};
