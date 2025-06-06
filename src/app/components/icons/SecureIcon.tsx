import * as React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  color?: string;
  size?: number | string;
}

const SecureIcon: React.FC<IconProps> = ({ 
  color = "#fff", 
  size = 48, 
  ...props 
}) => (
  <svg
    viewBox="0 0 48 48"
    width={size}
    height={size}
    xmlns="http://www.w3.org/2000/svg"
    fill={color}
    {...props}
  >
    <g strokeWidth={0} />
    <g
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <g>
      <path
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.646 43.297h12.708c2.963 0 5.7-1.58 7.18-4.145l6.355-11.006a8.29 8.29 0 0 0 0-8.292L37.535 8.848a8.29 8.29 0 0 0-7.18-4.145h-12.71a8.29 8.29 0 0 0-7.18 4.145L4.111 19.854a8.29 8.29 0 0 0 0 8.292l6.354 11.006a8.29 8.29 0 0 0 7.18 4.145"
      />
      <circle 
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        cx={18.603} 
        cy={24} 
        r={4.936} 
      />
      <path 
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M34.332 24.018H23.539m7.176 2.953v-2.953" 
      />
    </g>
  </svg>
);

export default SecureIcon;