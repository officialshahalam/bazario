import React from "react";

const Logo = () => (
  <svg
    viewBox="0 0 100 100"
    width="64"
    height="64"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="100" height="100" rx="12" fill="black" />
    <g fill="white">
      {[...Array(5)].map((_, row) =>
        [...Array(5)].map((_, col) => {
          // Skip outer edges for a "glow in the center" effect
          const isEdge = row === 0 || row === 4 || col === 0 || col === 4;
          if (isEdge) return null;

          const cx = 20 + col * 15;
          const cy = 20 + row * 15;
          return <circle key={`${row}-${col}`} cx={cx} cy={cy} r="3" />;
        })
      )}
    </g>
  </svg>
);

export default Logo;
