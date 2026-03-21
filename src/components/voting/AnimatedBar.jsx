import { useEffect, useState } from "react";

export default function AnimatedBar({ percentage, color, delay = 0 }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(percentage), delay + 50);
    return () => clearTimeout(t);
  }, [percentage, delay]);

  return (
    <div
      style={{
        height: 36,
        background: "#f0e6d8",
        borderRadius: 18,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${width}%`,
          background: `linear-gradient(90deg, ${color}, ${color}dd)`,
          borderRadius: 18,
          transition: "width 1.4s cubic-bezier(0.22, 0.8, 0.22, 1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          paddingRight: width > 18 ? 12 : 0,
        }}
      >
        {width > 18 && (
          <span
            style={{
              fontFamily: "'Chillax', sans-serif",
              fontSize: 16,
              color: "#fff",
              fontWeight: 700,
            }}
          >
            {percentage}%
          </span>
        )}
      </div>
      {width <= 18 && width > 0 && (
        <span
          style={{
            position: "absolute",
            left: `calc(${width}% + 8px)`,
            top: "50%",
            transform: "translateY(-50%)",
            fontFamily: "'Chillax', sans-serif",
            fontSize: 16,
            color: "#8b7355",
            fontWeight: 700,
          }}
        >
          {percentage}%
        </span>
      )}
    </div>
  );
}
