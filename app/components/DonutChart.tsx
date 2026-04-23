import React from 'react';
import Svg, { G, Circle as SvgCircle } from 'react-native-svg';

export const DonutChart = ({ segments, size = 160, strokeWidth = 28 }: {
  segments: { percent: number; color: string }[]; size?: number; strokeWidth?: number;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  return (
    <Svg width={size} height={size}>
      <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
        {segments.map((seg, i) => {
          const dash = (seg.percent / 100) * circumference;
          const gap = circumference - dash;
          const o = offset;
          offset += dash;
          return (
            <SvgCircle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-o}
              fill="none"
              strokeLinecap="round"
            />
          );
        })}
      </G>
    </Svg>
  );
};
