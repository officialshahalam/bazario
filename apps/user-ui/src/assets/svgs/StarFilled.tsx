import React from "react";

const StarFilled: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5 text-yellow-500"
  >
    <path d="M12 .587l3.668 7.431 8.2 1.191-5.934 5.782 1.401 8.171L12 18.896l-7.335 3.866 1.401-8.171L.132 9.209l8.2-1.191L12 .587z" />
  </svg>
);

export default StarFilled;
