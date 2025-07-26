declare module 'react-simple-maps' {
  import * as React from 'react';

  export interface ComposableMapProps extends React.SVGProps<SVGSVGElement> {
    projection?: string;
    projectionConfig?: object;
    width?: number;
    height?: number;
    viewBox?: string;
    preserveAspectRatio?: string;
    style?: React.CSSProperties;
  }

  export interface GeographiesProps {
    geography: string | object;
    children: (props: {
      geographies: GeographyShape[];
    }) => React.ReactNode;
  }

  export interface GeographyProps {
    geography: GeographyShape;
    onMouseEnter?: (event: React.MouseEvent<SVGPathElement, MouseEvent>) => void;
    onMouseMove?: (event: React.MouseEvent<SVGPathElement, MouseEvent>) => void;
    onMouseLeave?: (event: React.MouseEvent<SVGPathElement, MouseEvent>) => void;
    fill?: string;
    stroke?: string;
    style?: {
      default?: React.CSSProperties;
      hover?: React.CSSProperties;
      pressed?: React.CSSProperties;
    };
  }

  export interface GeographyShape {
    rsmKey: string;
    properties: {
      name: string;
      [key: string]: any;
    };
    [key: string]: any;
  }

  export const ComposableMap: React.FC<ComposableMapProps>;
  export const Geographies: React.FC<GeographiesProps>;
  export const Geography: React.FC<GeographyProps>;
}
