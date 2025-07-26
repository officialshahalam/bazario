import React from "react";

interface AccountsIconProps {
  fill?: string;
  className?: string;
}

const AccountsIcon: React.FC<AccountsIconProps> = ({ 
  fill = "currentColor", 
  className = "nextui-c-PJLV nextui-c-PJLV-ibxboXQ-css" 
}) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3H5C3.89 3 3 3.9 3 5ZM12 10C13.66 10 15 8.66 15 7C15 5.34 13.66 4 12 4C10.34 4 9 5.34 9 7C9 8.66 10.34 10 12 10ZM6 18C6 15.79 10.67 14.5 12 14.5C13.33 14.5 18 15.79 18 18V19H6V18Z"
        fill={fill}
      />
    </svg>
  );
};

export default AccountsIcon;