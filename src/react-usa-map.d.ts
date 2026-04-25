declare module 'react-usa-map' {
  import React from 'react';

  interface USAMapProps {
    onClick?: (event: React.MouseEvent<SVGPathElement>) => void;
    customize?: Record<string, { fill: string }>;
    defaultFill?: string;
    title?: string;
    width?: number | string;
    height?: number | string;
  }

  const USAMap: React.FC<USAMapProps>;
  export default USAMap;
}