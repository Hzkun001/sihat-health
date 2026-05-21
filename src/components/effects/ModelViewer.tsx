// src/components/ModelViewer.tsx
/* eslint-disable react/no-unknown-property */
import * as React from 'react'

// Props longgar: dukung atribut bawaan + atribut khusus model-viewer
type ModelViewerProps = React.HTMLAttributes<HTMLElement> & Record<string, any>

// Pakai forwardRef supaya parent bisa dapat ref ke <model-viewer>
const ModelViewer = React.forwardRef<HTMLElement, ModelViewerProps>((props, ref) => {
  const MV: any = 'model-viewer'
  return <MV ref={ref as any} {...props} />
})

ModelViewer.displayName = 'ModelViewer'
export default ModelViewer
