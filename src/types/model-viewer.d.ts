import type * as React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        src?: string;
        poster?: string;
        alt?: string;
        loading?: 'eager' | 'lazy';
        reveal?: 'auto' | 'interaction' | 'manual';
        'camera-controls'?: boolean;
        'auto-rotate'?: boolean;
        'rotation-per-second'?: string;
        'shadow-intensity'?: number | string;
        'shadow-softness'?: number | string;
        'environment-image'?: string;
        exposure?: number | string;
        'disable-zoom'?: boolean;
        'disable-pan'?: boolean;
        'interaction-prompt'?: 'auto' | 'none';
        ar?: boolean;
        'ar-modes'?: string;
        'ar-scale'?: string;
        'field-of-view'?: string;
        'max-camera-orbit'?: string;
        'min-camera-orbit'?: string;
        'camera-orbit'?: string;
        'camera-target'?: string;
        style?: React.CSSProperties;
        onLoad?: (e: Event) => void;
      };
    }
  }
}
export {};
