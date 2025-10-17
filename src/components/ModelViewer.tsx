// src/components/ModelViewer.tsx
/* eslint-disable react/no-unknown-property */
import * as React from 'react';
type ModelViewerProps = React.HTMLAttributes<HTMLElement> & Record<string, any>;

export default function ModelViewer(props: ModelViewerProps) {
  const MV: any = 'model-viewer';
  return <MV {...props} />;
}
