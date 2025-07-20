declare module 'react-image-magnify' {
  import * as React from 'react';

  export interface SmallImage {
    alt: string;
    isFluidWidth: boolean;
    src: string;
    width?: number;
    height?: number;
  }

  export interface LargeImage {
    src: string;
    width: number;
    height: number;
  }

  export interface ReactImageMagnifyProps {
    smallImage: SmallImage;
    largeImage: LargeImage;
    enlargedImagePosition?: 'over' | 'beside' | 'right';
    enlargedImageStyle?: React.CSSProperties;
    enlargedImageContainerDimensions?: {
      width: string;
      height: string;
    };
    lensStyle?: React.CSSProperties;
    [key: string]: any;
  }

  const ReactImageMagnify: React.FC<ReactImageMagnifyProps>;
  export default ReactImageMagnify;
}
