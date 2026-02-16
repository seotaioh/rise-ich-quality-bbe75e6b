import { Card } from "@/components/ui/card";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { toDateStr, formatDateKR, shiftDate, getMonthStart, getWeekStart } from "@/hooks/useSubmissionStats";

interface DateRangeSelectorProps {
  startDate: string;
  endDate: string;
  onStartChange: (d: string) => void;
  onEndChange: (d: string) => void;
}

type Preset = "today" | "week" | "month" | "custom";

export const DateRangeSelector = ({ startDate, endDate, onStartChange, onEndChange }: DateRangeSelectorProps) => {
  const todayISO = toDateStr(new Date());

  const setPreset = (preset: Preset) => {
    switch (preset) {
      case "today":
        onStartChange(todayISO);
        onEndChange(todayISO);
        break;
      case "week":
        onStartChange(getWeekStart(todayISO));
        onEndChange(todayISO);
        break;
      case "month":
        onStartChange(getMonthStart(todayISO));
        onEndChange(todayISO);
        break;
    }
  };

  // 날짜 하루씩 이동 (시작/종료 동시)
  const shiftRange = (days: number) => {
    onStartChange(shiftDate(startDate, days));
    onEndChange(shiftDate(endDate, days));
  };

  const isToday = startDate === todayISO && endDate === todayISO;
  const isWeek = startDate === getWeekStart(todayISO) && endDate === todayISO;
  const isMonth = startDate === getMonthStart(todayISO) && endDate === todayISO;

  const presetBtnCls = (active: boolean) =>
    `px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
      active
        ? "bg-primary text-primary-foreground"
        : "bg-muted text-muted-foreground hover:bg-muted/80"
    }`;

  return (
    <Card className="p-4 shadow-[var(--shadow-soft)] border-border/50">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-foreground">조회 기간</span>
          <div className="flex gap-1 ml-2">
            <button type="button" onClick={() => setPreset("today")} className={presetBtnCls(isToday)}>
              오늘
            </button>
            <button type="button" onClick={() => setPreset("week")} className={presetBtnCls(isWeek)}>
              이번 주
            </button>
            <button type="button" onClick={() => setPreset("month")} className={presetBtnCls(isMonth)}>
              이번 달
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={() => shiftRange(-1)}
            className="p-1.5 rounded-md hover:bg-muted transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <input
            type="date"
            className="h-9 rounded-md border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            value={startDate}
            onChange={(e) => onStartChange(e.target.value)}
          />
          <span className="text-muted-foreground text-sm">~</span>
          <input
            type="date"
            className="h-9 rounded-md border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            value={endDate}
            onChange={(e) => onEndChange(e.target.value)}
          />
          <button type="button" onClick={() => shiftRange(1)}
            className="p-1.5 rounded-md hover:bg-muted transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2 text-right">
        {startDate === endDate
          ? formatDateKR(startDate)
          : `${formatDateKR(startDate)} ~ ${formatDateKR(endDate)}`}
        {isToday && <span className="text-primary font-medium ml-1">(오늘)</span>}
      </p>
    </Card>
  );
};
