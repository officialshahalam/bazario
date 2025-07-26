import React from "react";

const Home = ({ fill }: { fill: string }) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Chinese character "图" (diagram/chart) styled as an icon */}
      <path
        d="M3 5H21V19H3V5ZM5 7V17H19V7H5ZM8 9H16V11H8V9ZM8 13H16V15H8V13ZM11 9V15H13V9H11Z"
        fill={fill}
      />
    </svg>
  );
};

export default Home;