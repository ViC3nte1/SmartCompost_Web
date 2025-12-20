import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HistoryPoint {
  time: string;
  temp: number;
  gas: number;
  hum: number;
}

interface HistoricalChartProps {
  data: HistoryPoint[];
  onClear: () => void;
}

export const HistoricalChart = ({ data, onClear }: HistoricalChartProps) => {
  return (
    <div className="p-6 rounded-2xl border bg-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Tren Data Sensor</h3>
          <p className="text-sm text-muted-foreground">
            {data.length} titik data (maks 50, sesi ini)
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onClear}
          disabled={data.length === 0}
          className="gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Hapus Data
        </Button>
      </div>

      {data.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          <p>Belum ada data. Hubungkan ke MQTT untuk melihat tren.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <YAxis
              yAxisId="temp"
              orientation="left"
              tick={{ fontSize: 12 }}
              label={{ value: "°C", angle: -90, position: "insideLeft" }}
              className="text-muted-foreground"
            />
            <YAxis
              yAxisId="gas"
              orientation="right"
              tick={{ fontSize: 12 }}
              label={{ value: "PPM", angle: 90, position: "insideRight" }}
              className="text-muted-foreground"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Legend />
            <Line
              yAxisId="temp"
              type="monotone"
              dataKey="temp"
              name="Suhu (°C)"
              stroke="hsl(142, 76%, 36%)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
            <Line
              yAxisId="gas"
              type="monotone"
              dataKey="gas"
              name="Gas (PPM)"
              stroke="hsl(38, 92%, 50%)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
