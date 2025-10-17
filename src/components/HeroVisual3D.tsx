import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';



interface Node {
  id: number;
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  size: number;
  type: 'data' | 'dna' | 'molecule';
}

export function HeroVisual3D() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const nodesRef = useRef<Node[]>([]);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);
  // Initialize nodes - Optimized
  useEffect(() => {
    const width = 600;
    const height = 600;
    const nodeCount = 20; // Reduced from 30 for better performance
    const newNodes: Node[] = [];

    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2;
      const radius = 180 + Math.random() * 80;
      const x = width / 2 + Math.cos(angle) * radius;
      const y = height / 2 + Math.sin(angle) * radius;
      
      newNodes.push({
        id: i,
        x,
        y,
        baseX: x,
        baseY: y,
        vx: 0,
        vy: 0,
        size: 2 + Math.random() * 3,
        type: i % 3 === 0 ? 'dna' : i % 3 === 1 ? 'molecule' : 'data',
      });
    }

    nodesRef.current = newNodes;
    setNodes(newNodes);
  }, []);

  // Animate nodes - Optimized with requestAnimationFrame
  useEffect(() => {
    if (nodesRef.current.length === 0) return;

    let lastTime = 0;
    const targetFPS = 45; // Cap at 45 FPS for better performance
    const frameTime = 1000 / targetFPS;

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      
      if (deltaTime < frameTime) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }
      
      lastTime = currentTime;

      const updatedNodes = nodesRef.current.map((node) => {
        // Repel from mouse
        const dx = node.x - mousePosRef.current.x;
        const dy = node.y - mousePosRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const repelRadius = 80;

        if (dist < repelRadius && dist > 0) {
          const force = (repelRadius - dist) / repelRadius;
          node.vx += (dx / dist) * force * 0.3;
          node.vy += (dy / dist) * force * 0.3;
        }

        // Return to base position
        node.vx += (node.baseX - node.x) * 0.02;
        node.vy += (node.baseY - node.y) * 0.02;

        // Apply friction
        node.vx *= 0.92;
        node.vy *= 0.92;

        // Update position
        node.x += node.vx;
        node.y += node.vy;

        return { ...node };
      });

      nodesRef.current = updatedNodes;
      setNodes([...updatedNodes]);

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mousePosRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  return (
    
    <div className="relative w-full h-full">
      <svg
        ref={svgRef}
        viewBox="0 0 600 600"
        className="w-full h-full"
        onMouseMove={handleMouseMove}
        style={{ 
          filter: 'drop-shadow(0 3px 8px rgba(0, 0, 0, 0.12))', // Simplified shadow for better performance
          willChange: 'transform',
        }}
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1BA351" />
            <stop offset="100%" stopColor="#5AC8FA" />
          </linearGradient>

          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5AC8FA" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#1BA351" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#5AC8FA" stopOpacity="0.5" />
          </linearGradient>

          <radialGradient id="glowGradient">
            <stop offset="0%" stopColor="#1BA351" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#5AC8FA" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="ambientLight">
            <stop offset="0%" stopColor="#A8E6CF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#1BA351" stopOpacity="0" />
          </radialGradient>

          {/* Filters */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="innerGlow">
            <feGaussianBlur in="SourceAlpha" stdDeviation="8" result="blur" />
            <feFlood floodColor="#FFFFFF" floodOpacity="0.3" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feBlend in="SourceGraphic" in2="glow" mode="screen" />
          </filter>
        </defs>

        {/* Background dots pattern - Reduced for performance */}
        <g opacity="0.08">
          {Array.from({ length: 200 }).map((_, i) => (
            <circle
              key={`dot-${i}`}
              cx={(i % 20) * 30 + 15}
              cy={Math.floor(i / 20) * 30 + 15}
              r="1"
              fill="#1BA351"
            />
          ))}
        </g>

        {/* Network connections */}
        <g opacity="0.3">
          {nodes.map((node, i) => {
            const nearbyNodes = nodes.filter((n, j) => {
              if (j <= i) return false;
              const dx = n.x - node.x;
              const dy = n.y - node.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              return dist < 100; // Reduced from 120 for fewer connections
            });

            return nearbyNodes.map((nearNode, j) => (
              <motion.line
                key={`line-${i}-${j}`}
                x1={node.x}
                y1={node.y}
                x2={nearNode.x}
                y2={nearNode.y}
                stroke="url(#mainGradient)"
                strokeWidth="0.5"
                animate={{
                  x1: node.x,
                  y1: node.y,
                  x2: nearNode.x,
                  y2: nearNode.y,
                }}
                transition={{ duration: 0.1 }}
              />
            ));
          })}
        </g>

        {/* Ambient light from left (mint) */}
        <circle cx="150" cy="300" r="200" fill="url(#ambientLight)" opacity="0.3" />

        {/* Central glow */}
        <motion.circle
          cx="300"
          cy="300"
          r="150"
          fill="url(#glowGradient)"
          animate={{ opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Main Figure - People */}
        <g transform="translate(300, 300)" filter="url(#innerGlow)">
          {/* Body outline */}
          <motion.path
            d="M 0,-80 C -15,-75 -25,-60 -25,-40 L -25,20 C -25,30 -20,35 -15,40 L -15,80 C -15,85 -10,90 0,90 C 10,90 15,85 15,80 L 15,40 C 20,35 25,30 25,20 L 25,-40 C 25,-60 15,-75 0,-80 Z"
            fill="url(#bodyGradient)"
            stroke="url(#mainGradient)"
            strokeWidth="2"
            filter="url(#glow)"
            animate={{ opacity: [0.9, 1, 0.9] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Head */}
          <motion.circle
            cx="0"
            cy="-95"
            r="18"
            fill="rgba(90, 200, 250, 0.2)"
            stroke="url(#mainGradient)"
            strokeWidth="1.5"
            filter="url(#glow)"
          />

          {/* Lungs/Chest area - highlighted */}
          <motion.ellipse
            cx="0"
            cy="-20"
            rx="18"
            ry="25"
            fill="rgba(216, 243, 220, 0.7)"
            stroke="#1BA351"
            strokeWidth="1.5"
            filter="url(#glow)"
            animate={{
              rx: [18, 20, 18],
              ry: [25, 27, 25],
              opacity: [0.95, 1, 0.95],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Breathing indicator - central ripple */}
          <motion.circle
            cx="0"
            cy="-20"
            r="10"
            fill="none"
            stroke="#1BA351"
            strokeWidth="1.5"
            opacity="0.8"
            animate={{
              r: [10, 35, 10],
              opacity: [0.8, 0, 0.8],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />

          {/* Leaf/nature element - left side */}
          <motion.path
            d="M -12,-20 Q -18,-15 -20,-10 Q -18,-5 -12,-8 Q -10,-12 -12,-20"
            fill="rgba(27, 163, 81, 0.5)"
            animate={{
              opacity: [0.5, 0.8, 0.5],
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Leaf/nature element - right side */}
          <motion.path
            d="M 12,-20 Q 18,-15 20,-10 Q 18,-5 12,-8 Q 10,-12 12,-20"
            fill="rgba(27, 163, 81, 0.5)"
            animate={{
              opacity: [0.5, 0.8, 0.5],
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
          />

          {/* Air circulation lines */}
          <motion.path
            d="M -15,-15 Q -8,-20 0,-22 Q 8,-20 15,-15"
            fill="none"
            stroke="#5AC8FA"
            strokeWidth="1"
            opacity="0.5"
            strokeDasharray="2 3"
            animate={{
              strokeDashoffset: [0, -10],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
        </g>

        {/* DNA Helix - right side */}
        <g transform="translate(450, 200)">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.g
              key={`dna-${i}`}
              animate={{
                y: [0, -3, 0],
                opacity: [0.6, 0.9, 0.6],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.2,
              }}
            >
              <circle
                cx={Math.sin(i * 0.5) * 8}
                cy={i * 15}
                r="3"
                fill="#1BA351"
                opacity="0.6"
              />
              <circle
                cx={-Math.sin(i * 0.5) * 8}
                cy={i * 15}
                r="3"
                fill="#5AC8FA"
                opacity="0.6"
              />
              <line
                x1={Math.sin(i * 0.5) * 8}
                y1={i * 15}
                x2={-Math.sin(i * 0.5) * 8}
                y2={i * 15}
                stroke="url(#mainGradient)"
                strokeWidth="0.5"
                opacity="0.4"
              />
            </motion.g>
          ))}
        </g>

        {/* Water molecules - left side */}
        <g transform="translate(150, 250)">
          {[0, 1, 2].map((i) => (
            <motion.g
              key={`molecule-${i}`}
              transform={`translate(${i * 25}, ${i * 30})`}
              animate={{
                y: [0, -5, 0],
                rotate: [0, 5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.4,
              }}
            >
              {/* Water molecule structure */}
              <circle cx="0" cy="0" r="4" fill="#5AC8FA" opacity="0.6" />
              <circle cx="8" cy="6" r="3" fill="#1BA351" opacity="0.5" />
              <circle cx="-8" cy="6" r="3" fill="#1BA351" opacity="0.5" />
              <line x1="0" y1="0" x2="8" y2="6" stroke="#5AC8FA" strokeWidth="0.5" opacity="0.4" />
              <line x1="0" y1="0" x2="-8" y2="6" stroke="#5AC8FA" strokeWidth="0.5" opacity="0.4" />
            </motion.g>
          ))}
        </g>

        {/* Data nodes/particles - Enhanced visibility */}
        <g>
          {nodes.map((node) => (
            <motion.g key={node.id}>
              {node.type === 'data' && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.size}
                  fill="#A8E6CF"
                  opacity="0.8"
                  filter="url(#glow)"
                />
              )}
              {node.type === 'dna' && (
                <rect
                  x={node.x - node.size / 2}
                  y={node.y - node.size / 2}
                  width={node.size}
                  height={node.size}
                  fill="#1BA351"
                  opacity="0.75"
                  transform={`rotate(45 ${node.x} ${node.y})`}
                  filter="url(#glow)"
                />
              )}
              {node.type === 'molecule' && (
                <polygon
                  points={`${node.x},${node.y - node.size} ${node.x + node.size},${node.y + node.size} ${node.x - node.size},${node.y + node.size}`}
                  fill="#5AC8FA"
                  opacity="0.75"
                  filter="url(#glow)"
                />
              )}
            </motion.g>
          ))}
        </g>

        {/* Floating info labels - Enhanced readability */}
        <g opacity="0.95">
          <motion.text
            x="100"
            y="120"
            fontSize="14"
            fill="#E9FBF2"
            fontFamily="Plus Jakarta Sans"
            fontWeight="600"
            style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))' }}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            Health Data
          </motion.text>
          <motion.text
            x="450"
            y="450"
            fontSize="14"
            fill="#DFFAFF"
            fontFamily="Plus Jakarta Sans"
            fontWeight="600"
            style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))' }}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          >
            Environment
          </motion.text>
          <motion.text
            x="220"
            y="550"
            fontSize="14"
            fill="#E9FBF2"
            fontFamily="Plus Jakarta Sans"
            fontWeight="600"
            style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))' }}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          >
            Well-Being
          </motion.text>
        </g>
      </svg>
    </div>
  );
}
