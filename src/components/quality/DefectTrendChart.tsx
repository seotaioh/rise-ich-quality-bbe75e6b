import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { monthlyStats } from "@/data/sampleDefects";

export const DefectTrendChart = () => {
  return (
    <Card className="p-6 shadow-[var(--shadow-soft)] border-border/50">
      <h3 className="text-lg font-semibold text-foreground mb-6">월별 불량 추이</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={monthlyStats}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="month" 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="total" 
            stroke="hsl(var(--chart-1))" 
            strokeWidth={2}
            name="생산량"
            dot={{ fill: 'hsl(var(--chart-1))', r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="defects" 
            stroke="hsl(var(--chart-4))" 
            strokeWidth={2}
            name="불량건수"
            dot={{ fill: 'hsl(var(--chart-4))', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};
