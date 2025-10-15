// src/types/model-viewer.d.ts
declare namespace JSX {
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
      'camera-controls'?: boolean | '';
      'auto-rotate'?: boolean | '';
      'rotation-per-second'?: string;
      'shadow-intensity'?: string | number;
      'environment-image'?: string;
      'exposure'?: string | number;
      'disable-zoom'?: boolean | '';
      'disable-pan'?: boolean | '';
      'interaction-prompt'?: 'auto' | 'none';
      'ar'?: boolean | '';
      'ar-modes'?: string;
      'ar-scale'?: string;
      'shadow-softness'?: string | number;
      'field-of-view'?: string;
      'max-camera-orbit'?: string;
      'min-camera-orbit'?: string;
      'camera-orbit'?: string;
      'camera-target'?: string;
      onLoad?: (event: Event) => void;
    };
  }
}
