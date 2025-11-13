import { Activity, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down";
  icon: React.ReactNode;
  colorClass: string;
}

const MetricCard = ({ title, value, change, trend, icon, colorClass }: MetricCardProps) => (
  <Card className="p-6 shadow-[var(--shadow-soft)] border-border/50 hover:shadow-[var(--shadow-medium)] transition-all">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
        <p className="text-3xl font-bold text-foreground mb-1">{value}</p>
        {change && (
          <p className={`text-sm font-medium ${trend === 'down' ? 'text-success' : 'text-warning'}`}>
            {change}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-lg ${colorClass}`}>
        {icon}
      </div>
    </div>
  </Card>
);

export const DashboardHeader = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <MetricCard
        title="금일 생산량"
        value="287"
        change="+12% vs 전일"
        trend="up"
        icon={<Activity className="h-6 w-6 text-primary-foreground" />}
        colorClass="bg-primary"
      />
      <MetricCard
        title="금일 불량률"
        value="5.2%"
        change="-1.8% vs 전일"
        trend="down"
        icon={<TrendingDown className="h-6 w-6 text-success-foreground" />}
        colorClass="bg-success"
      />
      <MetricCard
        title="발생 불량"
        value="15"
        change="3건 처리 대기"
        icon={<AlertTriangle className="h-6 w-6 text-warning-foreground" />}
        colorClass="bg-warning"
      />
      <MetricCard
        title="품질 달성률"
        value="94.8%"
        change="목표: 95%"
        icon={<CheckCircle className="h-6 w-6 text-accent-foreground" />}
        colorClass="bg-accent"
      />
    </div>
  );
};
