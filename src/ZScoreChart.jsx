import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const rawData = [
  { name: "Page A", uv: 4000, pv: 2400 },
  { name: "Page B", uv: 3000, pv: 1398 },
  { name: "Page C", uv: 2000, pv: 9800 },
  { name: "Page D", uv: 2780, pv: 3908 },
  { name: "Page E", uv: 1890, pv: 4800 },
  { name: "Page F", uv: 2390, pv: 3800 },
  { name: "Page G", uv: 3490, pv: 4300 },
];


function calculateZScores(data, key) {
  const values = data.map((d) => d[key]);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const std = Math.sqrt(
    values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length
  );

  return data.map((d) => ({
    ...d,
    [`${key}Z`]: std === 0 ? 0 : (d[key] - mean) / std,
  }));
}


function getSegments(data, key, defaultColor) {
  const segments = [];
  const zKey = `${key}Z`;
  let segment = [];
  let lastColor = null;

  for (let i = 0; i < data.length; i++) {
    const point = data[i];
    const isOutlier = Math.abs(point[zKey]) > 1;
    const stroke = isOutlier ? "red" : defaultColor;

    if (stroke !== lastColor && segment.length) {
      segments.push({ data: segment, stroke: lastColor });
      segment = [];
    }

    segment.push(point);
    lastColor = stroke;
  }

  if (segment.length) {
    segments.push({ data: segment, stroke: lastColor });
  }

  return segments;
}

export default function ZScoreChart() {
  const withZ = calculateZScores(calculateZScores(rawData, "pv"), "uv");

  const pvSegments = getSegments(withZ, "pv", "#8884d8");
  const uvSegments = getSegments(withZ, "uv", "#82ca9d");

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={withZ}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />

       
        <Legend />

       
        <Line dataKey="pv" stroke="#8884d8" hide={false} legendType="line" />
        <Line dataKey="uv" stroke="#82ca9d" hide={false} legendType="line" />
        <Line
          dataKey="outlier"
          stroke="red"
          hide={false}
          name="Z-score > 1"
          legendType="line"
        />

       
        {pvSegments.map((seg, i) => (
          <Line
            key={`pv-${i}`}
            type="monotone"
            data={seg.data}
            dataKey="pv"
            stroke={seg.stroke}
            dot={{ stroke: seg.stroke, fill: seg.stroke }}
            isAnimationActive={false}
            legendType="none"
          />
        ))}

        {uvSegments.map((seg, i) => (
          <Line
            key={`uv-${i}`}
            type="monotone"
            data={seg.data}
            dataKey="uv"
            stroke={seg.stroke}
            dot={{ stroke: seg.stroke, fill: seg.stroke }}
            isAnimationActive={false}
            legendType="none"
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
