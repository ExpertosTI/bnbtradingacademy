"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function MetricsChart({ data }: { data: Array<{ name: string; value: number }> }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" stroke="#a39e93" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#a39e93" fontSize={12} allowDecimals={false} tickLine={false} axisLine={false} width={32} />
          <Tooltip
            cursor={{ fill: "rgba(198,161,91,0.08)" }}
            contentStyle={{ background: "#121214", border: "1px solid rgba(198,161,91,0.3)", borderRadius: 16, color: "#f3efe4" }}
          />
          <Bar dataKey="value" fill="#c6a15b" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
