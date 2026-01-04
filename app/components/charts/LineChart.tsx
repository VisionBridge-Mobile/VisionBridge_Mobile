import React, { useMemo } from "react";
import { View } from "react-native";
import Svg, { Circle, Line, Path, Text as SvgText } from "react-native-svg";
import { colors } from "@/theme/colors";

type Point = { label: string; value: number };

type Props = {
  data: Point[];
  width: number;
  height?: number;
  minY?: number;
  maxY?: number;
};

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export function LineChart({ data, width, height = 220, minY, maxY }: Props) {
  const pad = 24;
  const chartW = Math.max(10, width - pad * 2);
  const chartH = Math.max(10, height - pad * 2);

  const { min, max } = useMemo(() => {
    const values = data.map((d) => d.value);
    const minV = minY ?? Math.min(...values);
    const maxV = maxY ?? Math.max(...values);
    return { min: minV, max: maxV };
  }, [data, minY, maxY]);

  const points = useMemo(() => {
    if (data.length === 0) return [];
    const span = Math.max(1, max - min);
    return data.map((d, i) => {
      const x = pad + (i / Math.max(1, data.length - 1)) * chartW;
      const t = (d.value - min) / span;
      const y = pad + (1 - clamp(t, 0, 1)) * chartH;
      return { x, y, label: d.label, value: d.value };
    });
  }, [data, chartW, chartH, min, max]);

  const pathD = useMemo(() => {
    if (points.length === 0) return "";
    return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");
  }, [points]);

  const tickYs = useMemo(() => {
    const a = min;
    const b = max;
    const mid = (a + b) / 2;
    return [a, mid, b];
  }, [min, max]);

  return (
    <View>
      <Svg width={width} height={height}>
        {/* grid */}
        {tickYs.map((v, idx) => {
          const t = (v - min) / Math.max(1, max - min);
          const y = pad + (1 - clamp(t, 0, 1)) * chartH;
          return (
            <React.Fragment key={`y-${idx}`}>
              <Line x1={pad} y1={y} x2={pad + chartW} y2={y} stroke={colors.border} strokeDasharray="4 6" />
              <SvgText x={4} y={y + 4} fill={colors.muted} fontSize="11">
                {Math.round(v)}
              </SvgText>
            </React.Fragment>
          );
        })}
        {/* x labels */}
        {points.map((p, i) => {
          if (i === 0 || i === points.length - 1 || i % 2 === 1) return null;
          return (
            <SvgText key={`x-${i}`} x={p.x - 8} y={height - 6} fill={colors.muted} fontSize="11">
              {p.label}
            </SvgText>
          );
        })}
        {/* line */}
        <Path d={pathD} stroke={colors.primary} strokeWidth={3} fill="none" />
        {points.map((p, i) => (
          <Circle key={`p-${i}`} cx={p.x} cy={p.y} r={4.5} fill={colors.primary} />
        ))}
      </Svg>
    </View>
  );
}


