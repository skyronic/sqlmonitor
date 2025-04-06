import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface MonitorChartProps {
  data: Array<{ timestamp: string; value: number }>;
}

export const MonitorChart: React.FC<MonitorChartProps> = ({ data }) => {
  const chartConfig = {
    value: {
      label: "Value",
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={chartConfig}>
      <AreaChart
        data={data}
        margin={{
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        }}
      >
        <CartesianGrid vertical={false} opacity={0.1} />
        <XAxis
          dataKey="timestamp"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={10}
          tickFormatter={(value) => value}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          fontSize={10}
          width={30}
          tickFormatter={(value) => value}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" />}
        />
        <Area
          dataKey="value"
          type="monotone"
          fillOpacity={0.2}
          strokeWidth={1.5}
        />
      </AreaChart>
    </ChartContainer>
  );
}; 