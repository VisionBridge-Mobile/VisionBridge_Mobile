import React from "react";
import { View } from "react-native";
import Svg, { Line, Rect, Text as SvgText } from "react-native-svg";
import { colors } from "@/theme/colors";

type Bar = { label: string; value: number; tone: "green" | "blue" | "orange" };

const toneFill: Record<Bar["tone"], string> = {
  green: "#10B981",
  blue: "#3B82F6",
  orange: "#F59E0B"
};

type Props = {
  data: Bar[];
  width: number;
  height?: number;
  maxY?: number;
};

export function BarChart({ data, width, height = 220, maxY }: Props) {
  const pad = 24;
  const chartW = Math.max(10, width - pad * 2);
  const chartH = Math.max(10, height - pad * 2);
  const max = maxY ?? Math.max(100, ...data.map((d) => d.value));

  const barGap = 10;
  const barW = data.length > 0 ? (chartW - barGap * (data.length - 1)) / data.length : chartW;

  return (
    <View>
      <Svg width={width} height={height}>
        {/* y axis ticks */}
        {[0, 50, 100].map((t) => {
          const y = pad + (1 - t / 100) * chartH;
          return (
            <React.Fragment key={`y-${t}`}>
              <Line x1={pad} y1={y} x2={pad + chartW} y2={y} stroke={colors.border} strokeDasharray="4 6" />
              <SvgText x={4} y={y + 4} fill={colors.muted} fontSize="11">
                {t}
              </SvgText>
            </React.Fragment>
          );
        })}
        {data.map((b, i) => {
          const h = (b.value / max) * chartH;
          const x = pad + i * (barW + barGap);
          const y = pad + (chartH - h);
          return (
            <React.Fragment key={`b-${i}`}>
              <Rect x={x} y={y} width={barW} height={h} rx={8} fill={toneFill[b.tone]} />
              <SvgText x={x + barW / 2} y={height - 6} fill={colors.muted} fontSize="11" textAnchor="middle">
                {b.label}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}


