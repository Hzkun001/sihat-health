// src/components/HeroVisual3D.tsx
import ModelViewer from './ModelViewer';

export default function HeroVisual3D() {
  return (
    <div className="relative z-[50] w-full h-full rounded-2xl overflow-hidden">
      <ModelViewer
        /* TES DULU DENGAN ASTRONAUT untuk isolasi masalah aset */
        src="/assets/3d/fresh.glb"
        alt="Astronaut test"
        camera-controls
        auto-rotate
        style={{
          width: '80%',
          height: '80%',
          borderRadius: 20,
          background: 'radial-gradient(circle at center, rgba(125, 191, 224, 0.22) 0%, rgba(0,0,0,0.2) 100%)'
        }}
      />
    </div>
  );
}
