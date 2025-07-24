
import React from 'react';

interface IconProps {
    className?: string;
}

const CheckIcon: React.FC<IconProps> = ({ className }) => {
  return (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  );
};

export default CheckIcon;
