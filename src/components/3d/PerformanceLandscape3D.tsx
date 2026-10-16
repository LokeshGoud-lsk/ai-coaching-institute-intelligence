import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { VisualizationPoint3D } from '../../types';
import { Button } from '../common/Button';
import { RotateCw, Eye, EyeOff, Layers, BarChart3 } from 'lucide-react';

interface PerformanceLandscape3DProps {
  data: VisualizationPoint3D[];
  height?: number;
}

export const PerformanceLandscape3D: React.FC<PerformanceLandscape3DProps> = ({
  data,
  height = 450,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<VisualizationPoint3D | null>(null);
  const [isRotating, setIsRotating] = useState(true);
  const [view2DFallback, setView2DFallback] = useState(false);

  useEffect(() => {
    if (view2DFallback || !containerRef.current || data.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0f19);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(35, 25, 40);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x60a5fa, 1.2);
    directionalLight.position.set(20, 40, 20);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xa78bfa, 2, 50);
    pointLight.position.set(-15, 20, -15);
    scene.add(pointLight);

    // 3. Grid Helper & Axis Planes
    const grid = new THREE.GridHelper(30, 15, 0x3b82f6, 0x1e293b);
    grid.position.y = -0.1;
    scene.add(grid);

    // 4. Data Points & Visual Nodes
    const nodesGroup = new THREE.Group();
    const sphereGeometry = new THREE.SphereGeometry(0.75, 16, 16);
    const meshes: { mesh: THREE.Mesh; data: VisualizationPoint3D }[] = [];

    data.forEach(item => {
      // Map Attendance (40% - 100%) to X (-15 to 15)
      const x = ((item.attendancePct - 40) / 60) * 30 - 15;
      // Map Score (20% - 100%) to Y (0 to 18)
      const y = ((item.scorePct - 20) / 80) * 18;
      // Map Risk Score (0 - 100) to Z (-15 to 15)
      const z = ((item.riskScore - 0) / 100) * 30 - 15;

      // Color coding based on risk
      let colorHex = 0x10b981; // Green
      if (item.riskCategory === 'HIGH') colorHex = 0xf43f5e; // Rose
      else if (item.riskCategory === 'MEDIUM') colorHex = 0xf59e0b; // Amber

      const material = new THREE.MeshStandardMaterial({
        color: colorHex,
        roughness: 0.3,
        metalness: 0.6,
        emissive: colorHex,
        emissiveIntensity: item.riskCategory === 'HIGH' ? 0.4 : 0.15,
      });

      const mesh = new THREE.Mesh(sphereGeometry, material);
      mesh.position.set(x, y, z);
      nodesGroup.add(mesh);
      meshes.push({ mesh, data: item });

      // Add thin vertical stalk from grid to point for 3D depth perception
      const lineMaterial = new THREE.LineBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 0.25,
      });
      const points = [new THREE.Vector3(x, 0, z), new THREE.Vector3(x, y, z)];
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(lineGeometry, lineMaterial);
      nodesGroup.add(line);
    });

    scene.add(nodesGroup);

    // 5. Interaction (Raycasting & Hover)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(meshes.map(m => m.mesh));

      if (intersects.length > 0) {
        const found = meshes.find(m => m.mesh === intersects[0].object);
        if (found) {
          setHoveredPoint(found.data);
          container.style.cursor = 'pointer';
        }
      } else {
        setHoveredPoint(null);
        container.style.cursor = 'default';
      }
    };

    container.addEventListener('mousemove', onMouseMove);

    // 6. Animation Loop
    let animationFrameId: number;
    let angle = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (isRotating) {
        angle += 0.004;
        nodesGroup.rotation.y = angle;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize handling
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      camera.aspect = newWidth / height;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', onMouseMove);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [data, height, isRotating, view2DFallback]);

  return (
    <div className="glass-card overflow-hidden relative">
      {/* 3D Header Toolbar */}
      <div className="p-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-slate-900/60">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-electric-cyan" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Interactive 3D Multi-Signal Performance Landscape
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            X-Axis: Attendance % | Y-Axis: Academic Score % | Z-Axis: Risk Score (0-100)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            leftIcon={view2DFallback ? <Layers className="w-3.5 h-3.5" /> : <BarChart3 className="w-3.5 h-3.5" />}
            onClick={() => setView2DFallback(!view2DFallback)}
          >
            {view2DFallback ? 'Switch to 3D Space' : '2D Accessible View'}
          </Button>

          {!view2DFallback && (
            <Button
              size="sm"
              variant="outline"
              leftIcon={<RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin text-electric-cyan' : ''}`} />}
              onClick={() => setIsRotating(!isRotating)}
            >
              {isRotating ? 'Pause Orbit' : 'Auto Rotate'}
            </Button>
          )}
        </div>
      </div>

      {/* 2D Accessible Fallback View */}
      {view2DFallback ? (
        <div className="p-6 overflow-x-auto max-h-[450px]">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs font-semibold uppercase text-slate-400 border-b border-white/10">
              <tr>
                <th className="p-3">Student Name</th>
                <th className="p-3">Batch</th>
                <th className="p-3">Attendance</th>
                <th className="p-3">Recent Score</th>
                <th className="p-3">Risk Category</th>
                <th className="p-3">Risk Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.map(item => (
                <tr key={item.id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-medium text-white">{item.studentName}</td>
                  <td className="p-3 text-slate-400">{item.batchName}</td>
                  <td className="p-3">{item.attendancePct}%</td>
                  <td className="p-3">{item.scorePct}%</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        item.riskCategory === 'HIGH'
                          ? 'bg-rose-950 text-rose-300'
                          : item.riskCategory === 'MEDIUM'
                          ? 'bg-amber-950 text-amber-300'
                          : 'bg-emerald-950 text-emerald-300'
                      }`}
                    >
                      {item.riskCategory}
                    </span>
                  </td>
                  <td className="p-3 font-bold">{item.riskScore}/100</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* 3D WebGL Canvas Viewport */
        <div className="relative" style={{ height: `${height}px` }}>
          <div ref={containerRef} className="w-full h-full" />

          {/* Interactive Tooltip Card on Hover */}
          {hoveredPoint && (
            <div className="absolute top-4 left-4 p-3.5 rounded-xl bg-slate-900/95 border border-white/15 shadow-2xl backdrop-blur-md pointer-events-none z-20 animate-in fade-in duration-150">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">{hoveredPoint.studentName}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    hoveredPoint.riskCategory === 'HIGH'
                      ? 'bg-rose-500 text-white'
                      : hoveredPoint.riskCategory === 'MEDIUM'
                      ? 'bg-amber-500 text-black'
                      : 'bg-emerald-500 text-white'
                  }`}
                >
                  {hoveredPoint.riskCategory} RISK
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{hoveredPoint.batchName}</p>

              <div className="mt-2.5 grid grid-cols-3 gap-2 text-xs border-t border-white/10 pt-2">
                <div>
                  <span className="text-[10px] text-slate-400 block">Attendance</span>
                  <span className="font-semibold text-white">{hoveredPoint.attendancePct}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Test Score</span>
                  <span className="font-semibold text-white">{hoveredPoint.scorePct}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Risk Index</span>
                  <span className="font-bold text-rose-400">{hoveredPoint.riskScore}/100</span>
                </div>
              </div>
            </div>
          )}

          {/* Legend Overlay */}
          <div className="absolute bottom-3 right-3 p-2.5 rounded-xl bg-slate-900/80 border border-white/10 backdrop-blur-md text-[11px] flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-300">Low Risk</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-300">Medium Risk</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-slate-300">High Risk</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
