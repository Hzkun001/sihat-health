import { memo, useMemo, useCallback, useEffect, useRef, useState, lazy, Suspense } from 'react'
import Waves from './waves'
const ModelViewer = lazy(() => import('./ModelViewer'))

export default memo(function HeroVisual3D() {
  const containerStyle = useMemo(() => ({
    borderRadius: 16
  }), [])

  // Pause waves saat offscreen
  const hostRef = useRef<HTMLDivElement>(null)
  const [showWaves, setShowWaves] = useState(false)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setShowWaves(e.isIntersecting), { threshold: 0.1 })
    if (hostRef.current) io.observe(hostRef.current)
    return () => io.disconnect()
  }, [])

  const modelStyle = useMemo(() => ({
    width: '90%',
    height: '90%',
    borderRadius: 20,
    background: 'transparent'
  }), [])

  return (
    <div ref={hostRef} className="relative w-full h-full overflow-hidden" style={containerStyle}>
      <div className="absolute inset-0 pointer-events-none">
        {showWaves && (
          <Waves
            lineColor="#fff"
            backgroundColor="rgba(255, 255, 255, 0.27)"
            waveSpeedX={0.014}
            waveSpeedY={0.008}
            waveAmpX={18}
            waveAmpY={8}
            xGap={10}
            yGap={20}
            friction={0.72}
            tension={0.02}
            maxCursorMove={80}
          />
        )}
      </div>

      <div className="relative z-10 flex items-center justify-center w-full h-full will-change-transform translate-z-0">
        <Suspense fallback={<div className="w-32 h-32 bg-black/10 rounded-2xl" />}>
          <ModelViewer
            src="/assets/3d/fresh.glb"
            alt="Model"
            camera-controls
            auto-rotate
            rotation-per-second="10deg"
            style={modelStyle}
          />
        </Suspense>
      </div>
    </div>
  )
})
