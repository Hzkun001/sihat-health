import { memo, useEffect, useMemo, useRef, useState, lazy, Suspense } from 'react'
const ModelViewer = lazy(() => import('./ModelViewer'))

export default memo(function HeroVisual3D({
  onReady,
  onProgress,
}: { onReady?: () => void; onProgress?: (p: number) => void }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const mvRef = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)

  // Render saat hampir terlihat (preload sedikit)
  useEffect(() => {
    const el = hostRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting && entry.intersectionRatio > 0.15),
      { threshold: [0, 0.15, 1], rootMargin: '200px 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Dengarkan event progress + load
  useEffect(() => {
    const el = mvRef.current
    if (!el) return

    const onProg = (e: any) => {
      const p = Math.round(Math.max(0, Math.min(1, e?.detail?.totalProgress ?? 0)) * 100)
      onProgress?.(p)
    }
    const onLoad = () => {
      onProgress?.(100)
      // kasih jeda kecil biar render stabil → lalu buka posternya
      setTimeout(() => (mvRef.current as any)?.dismissPoster?.(), 400)
      onReady?.()
    }

    el.addEventListener('progress', onProg as EventListener)
    el.addEventListener('load', onLoad as EventListener)
    return () => {
      el.removeEventListener('progress', onProg as EventListener)
      el.removeEventListener('load', onLoad as EventListener)
    }
  }, [onProgress, onReady])

  const containerStyle = useMemo(() => ({ borderRadius: 16 }), [])
  const modelStyle = useMemo(() => ({
    width: '90%',
    height: '90%',
    borderRadius: 20,
    background:
      'radial-gradient(circle at center, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.39) 100%)',
  }), [])

  return (
    <div ref={hostRef} className="relative w-full h-full overflow-hidden" style={containerStyle}>
      <div className="relative z-[50] flex items-center justify-center w-full h-full">
        {!visible && <div className="w-32 h-32 bg-black/10 rounded-2xl" />}

        {visible && (
          <Suspense fallback={<div className="w-32 h-32 bg-black/10 rounded-2xl" />}>
            <ModelViewer
              ref={mvRef as any}
              src="/assets/3d/fresh.glb"           
              poster="/assets/3d/stethoscope.png"    
              alt="Model"                
              loading="eager"                       
              environment-image="neutral"
              camera-controls
              auto-rotate
              rotation-per-second="10deg"
              style={modelStyle}
            />
          </Suspense>
        )}
      </div>
    </div>
  )
})
