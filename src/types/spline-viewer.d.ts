// src/types/spline-viewer.d.ts
declare namespace JSX {
  interface IntrinsicElements {
    'spline-viewer': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    > & {
      url?: string;
      loading?: 'eager' | 'lazy';
      ar?: boolean | '';
    };
  }
}
