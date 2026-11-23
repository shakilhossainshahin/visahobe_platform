'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { cn } from '../../utils/cn.js';
import {
  type GlobeDestination,
  type InteractiveVisaGlobeProps,
  DEFAULT_ORIGIN_CITY,
  STANDARD_GLOBE_DESTINATIONS,
} from './types.js';

// Pre-computed land coordinate clusters for the tactical 3D dot-matrix & procedural Earth
const LAND_COORDINATES: Array<[number, number]> = [
  // Europe & UK
  [51.5, -0.1],
  [48.8, 2.3],
  [52.5, 13.4],
  [41.9, 12.5],
  [40.4, -3.7],
  [59.3, 18.0],
  [55.7, 37.6],
  [60.1, 24.9],
  [50.8, 4.3],
  [47.3, 8.5],
  [48.2, 16.3],
  [45.4, 9.1],
  // Middle East & Gulf (UAE, Saudi, Qatar)
  [25.2, 55.3],
  [24.4, 54.3],
  [21.5, 39.2],
  [24.7, 46.7],
  [25.3, 51.5],
  [32.0, 34.8],
  [33.3, 44.3],
  [35.6, 51.4],
  [29.3, 47.9],
  // South & Southeast Asia (Dhaka, Singapore, Malaysia, Thailand, India, Vietnam, Indonesia)
  [23.8, 90.4],
  [22.3, 91.8],
  [24.9, 91.8],
  [28.6, 77.2],
  [19.0, 72.8],
  [13.0, 80.2],
  [12.9, 77.5],
  [22.5, 88.3],
  [1.3, 103.8],
  [3.1, 101.7],
  [13.7, 100.5],
  [10.8, 106.6],
  [21.0, 105.8],
  [-6.2, 106.8],
  [14.5, 120.9],
  // East Asia (Japan, Korea, China, HK)
  [39.9, 116.4],
  [31.2, 121.5],
  [35.6, 139.6],
  [34.6, 135.5],
  [37.5, 126.9],
  [22.3, 114.1],
  [25.0, 121.5],
  // North America (US, Canada)
  [40.7, -74.0],
  [34.0, -118.2],
  [41.8, -87.6],
  [29.7, -95.3],
  [37.7, -122.4],
  [45.5, -73.5],
  [49.2, -123.1],
  [43.6, -79.3],
  [38.9, -77.0],
  [25.7, -80.1],
  [47.6, -122.3],
  // Australia & Oceania
  [-33.8, 151.2],
  [-37.8, 144.9],
  [-31.9, 115.8],
  [-27.4, 153.0],
  [-34.9, 138.6],
  [-41.2, 174.7],
  [-36.8, 174.7],
  // Africa
  [30.0, 31.2],
  [-26.2, 28.0],
  [-33.9, 18.4],
  [6.5, 3.3],
  [-1.2, 36.8],
  [33.5, -7.6],
  [9.0, 38.7],
  [14.7, -17.4],
  // South America
  [-23.5, -46.6],
  [-22.9, -43.1],
  [-34.6, -58.3],
  [4.7, -74.0],
  [-12.0, -77.0],
  [-33.4, -70.6],
  [10.4, -66.9],
];

// Major continental landmass boundary polygons for high-res procedural Earth texture
const CONTINENT_POLYGONS: Array<Array<[number, number]>> = [
  // North America
  [
    [70, -165],
    [72, -130],
    [70, -90],
    [60, -65],
    [47, -53],
    [44, -66],
    [30, -81],
    [25, -80],
    [29, -95],
    [20, -105],
    [16, -93],
    [8, -78],
    [15, -88],
    [22, -105],
    [32, -117],
    [38, -123],
    [48, -124],
    [58, -136],
    [60, -145],
    [65, -168],
    [70, -165],
  ],
  // South America
  [
    [10, -75],
    [5, -52],
    [-5, -35],
    [-20, -40],
    [-35, -55],
    [-55, -68],
    [-52, -75],
    [-35, -72],
    [-18, -70],
    [-5, -80],
    [5, -77],
    [10, -75],
  ],
  // Europe
  [
    [71, 28],
    [68, 50],
    [55, 60],
    [45, 40],
    [40, 26],
    [36, -5],
    [43, -9],
    [48, -4],
    [54, 8],
    [58, 6],
    [63, 10],
    [71, 28],
  ],
  // Africa
  [
    [37, 10],
    [32, 32],
    [28, 34],
    [12, 51],
    [5, 48],
    [-12, 40],
    [-26, 33],
    [-34, 18],
    [-33, 17],
    [-15, 12],
    [4, 9],
    [5, -1],
    [5, -10],
    [15, -17],
    [21, -17],
    [32, -5],
    [37, 10],
  ],
  // Asia
  [
    [75, 100],
    [70, 170],
    [60, 160],
    [55, 135],
    [43, 132],
    [35, 128],
    [22, 114],
    [10, 105],
    [1, 103],
    [8, 98],
    [20, 88],
    [22, 70],
    [25, 60],
    [30, 48],
    [40, 44],
    [55, 60],
    [68, 70],
    [75, 100],
  ],
  // Australia
  [
    [-12, 132],
    [-15, 136],
    [-12, 142],
    [-22, 149],
    [-33, 151],
    [-38, 147],
    [-35, 117],
    [-22, 114],
    [-15, 124],
    [-12, 132],
  ],
];

// Convert Lat/Lng to 3D Cartesian coordinates on sphere
function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// Generate procedural photorealistic/stylized Earth canvas texture
function createProceduralEarthTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // 1. Deep Ocean Azure background with subtle oceanic depth gradient
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    oceanGrad.addColorStop(0, '#024D7A'); // Polar deep
    oceanGrad.addColorStop(0.25, '#0284C7'); // Ocean azure
    oceanGrad.addColorStop(0.5, '#0369A1'); // Equatorial azure
    oceanGrad.addColorStop(0.75, '#0284C7');
    oceanGrad.addColorStop(1, '#024D7A');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Graticule Lat/Lng grid lines (subtle oceanic coordinates)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let lat = -80; lat <= 80; lat += 20) {
      const y = ((90 - lat) / 180) * canvas.height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    for (let lng = -180; lng <= 180; lng += 30) {
      const x = ((lng + 180) / 360) * canvas.width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Equator highlight (Champagne Gold hairline)
    ctx.strokeStyle = 'rgba(200, 169, 81, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    // 3. Render Continents
    ctx.fillStyle = '#0D9488'; // Tropical teal landmass
    ctx.strokeStyle = '#10B981'; // Emerald coastal highlight
    ctx.lineWidth = 2;

    for (const poly of CONTINENT_POLYGONS) {
      ctx.beginPath();
      let first = true;
      for (const [lat, lng] of poly) {
        const x = ((lng + 180) / 360) * canvas.width;
        const y = ((90 - lat) / 180) * canvas.height;
        if (first) {
          ctx.moveTo(x, y);
          first = false;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // 4. Dot-matrix landmass glow for major city clusters
    ctx.fillStyle = '#34D399';
    for (const [lat, lng] of LAND_COORDINATES) {
      const x = ((lng + 180) / 360) * canvas.width;
      const y = ((90 - lat) / 180) * canvas.height;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.generateMipmaps = true;
  return texture;
}

export function InteractiveVisaGlobe({
  destinations = STANDARD_GLOBE_DESTINATIONS,
  selectedDestinationId = 'singapore',
  onSelectDestination,
  className,
  enableInteractiveSearch = true,
  originCity = DEFAULT_ORIGIN_CITY,
  showIntelligenceCard = true,
}: InteractiveVisaGlobeProps) {
  const [selectedId, setSelectedId] = useState<string>(selectedDestinationId);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);
  const [isClient, setIsClient] = useState<boolean>(false);
  const [flightProgress, setFlightProgress] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const flightArcRef = useRef<THREE.Line | null>(null);
  const beaconMeshRef = useRef<THREE.Mesh | null>(null);
  const flightCurveRef = useRef<THREE.QuadraticBezierCurve3 | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Rotation & Drag state
  const isDraggingRef = useRef<boolean>(false);
  const prevPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rotationStateRef = useRef<{
    currentY: number;
    currentX: number;
    targetY: number;
    targetX: number;
  }>({
    currentY: 0,
    currentX: 0.2,
    targetY: 0,
    targetX: 0.2,
  });

  const activeDestination = useMemo(() => {
    return destinations.find((d) => d.id === selectedId) ?? destinations[0]!;
  }, [destinations, selectedId]);

  // Sync internal state when external prop changes
  useEffect(() => {
    if (selectedDestinationId && selectedDestinationId !== selectedId) {
      setSelectedId(selectedDestinationId);
    }
  }, [selectedDestinationId]);

  // Capability check & Reduced motion detection
  useEffect(() => {
    setIsClient(true);
    if (typeof window === 'undefined') return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setHasWebGL(false);
      return;
    }

    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      setHasWebGL(Boolean(gl));
    } catch {
      setHasWebGL(false);
    }
  }, []);

  // Update target rotation when active destination changes
  useEffect(() => {
    if (!activeDestination) return;
    // Map destination lat/lng to target globe rotation
    // Longitude maps to Y rotation (radians), Latitude maps to X rotation
    const targetY = -(activeDestination.lng * (Math.PI / 180)) - Math.PI / 2;
    const targetX = activeDestination.lat * (Math.PI / 180) * 0.4;
    rotationStateRef.current.targetY = targetY;
    rotationStateRef.current.targetX = THREE.MathUtils.clamp(targetX, -0.6, 0.6);
  }, [activeDestination]);

  // Handle destination selection
  const handleSelect = useCallback(
    (dest: GlobeDestination) => {
      setSelectedId(dest.id);
      onSelectDestination?.(dest);
    },
    [onSelectDestination],
  );

  // Filtered destinations list
  const filteredDestinations = useMemo(() => {
    return destinations.filter((dest) => {
      const matchesSearch =
        dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.countryCode.toLowerCase().includes(searchQuery.toLowerCase());

      if (categoryFilter === 'All') return matchesSearch;
      if (categoryFilter === 'e-Visa')
        return matchesSearch && dest.autonomyLevel.includes('Level 3');
      if (categoryFilter === 'Work & PR')
        return (
          matchesSearch && (dest.category.includes('Work') || dest.category.includes('Residency'))
        );
      return matchesSearch;
    });
  }, [destinations, searchQuery, categoryFilter]);

  // ==========================================
  // Three.js 60fps WebGL Earth Engine
  // ==========================================
  useEffect(() => {
    if (!hasWebGL || !isClient) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.clientWidth || 460;
    const height = canvas.clientHeight || 460;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 0, 5.2);
    cameraRef.current = camera;

    // 2. Renderer
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      rendererRef.current = renderer;
    } catch {
      setHasWebGL(false);
      return;
    }

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.6);
    dirLight.position.set(5, 3, 5);
    scene.add(dirLight);

    // 4. Globe Group
    const globeGroup = new THREE.Group();
    globeGroupRef.current = globeGroup;
    scene.add(globeGroup);

    const GLOBE_RADIUS = 1.85;

    // Base Photorealistic / Stylized Earth Sphere
    const earthTexture = createProceduralEarthTexture();
    const sphereGeo = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64);
    const sphereMat = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.55,
      metalness: 0.1,
    });
    const earthMesh = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(earthMesh);

    // Atmospheric Sky-Blue Glow Halo Sphere
    const haloGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.025, 48, 48);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.18,
      side: THREE.BackSide,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    globeGroup.add(haloMesh);

    // Outer Liquid Glass Ring
    const ringGeo = new THREE.RingGeometry(GLOBE_RADIUS * 1.08, GLOBE_RADIUS * 1.09, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xc8a951,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    globeGroup.add(ringMesh);

    // 5. Origin Marker (Dhaka DAC)
    const originPos = latLngToVector3(originCity.lat, originCity.lng, GLOBE_RADIUS);
    const originGeo = new THREE.SphereGeometry(0.045, 16, 16);
    const originMat = new THREE.MeshBasicMaterial({ color: 0xc8a951 });
    const originMesh = new THREE.Mesh(originGeo, originMat);
    originMesh.position.copy(originPos);
    globeGroup.add(originMesh);

    // Dhaka radar ring
    const radarGeo = new THREE.RingGeometry(0.06, 0.08, 32);
    const radarMat = new THREE.MeshBasicMaterial({
      color: 0xc8a951,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    });
    const radarMesh = new THREE.Mesh(radarGeo, radarMat);
    radarMesh.position.copy(originPos);
    radarMesh.lookAt(new THREE.Vector3(0, 0, 0));
    globeGroup.add(radarMesh);

    // 6. Destination Markers
    const destGroup = new THREE.Group();
    globeGroup.add(destGroup);

    destinations.forEach((dest) => {
      const pos = latLngToVector3(dest.lat, dest.lng, GLOBE_RADIUS);
      const isSelected = dest.id === activeDestination.id;

      const markerGeo = new THREE.SphereGeometry(isSelected ? 0.055 : 0.035, 16, 16);
      const markerMat = new THREE.MeshBasicMaterial({
        color: isSelected ? 0xf97316 : 0x0284c7, // Sunset Coral if active, else Ocean Azure
      });
      const markerMesh = new THREE.Mesh(markerGeo, markerMat);
      markerMesh.position.copy(pos);
      destGroup.add(markerMesh);
    });

    // 7. Dynamic 3D Parabolic Flight Arc (Dhaka -> Active Destination)
    const destPos = latLngToVector3(activeDestination.lat, activeDestination.lng, GLOBE_RADIUS);
    const midPos = originPos
      .clone()
      .add(destPos)
      .multiplyScalar(0.5)
      .normalize()
      .multiplyScalar(GLOBE_RADIUS * 1.38);

    const flightCurve = new THREE.QuadraticBezierCurve3(originPos, midPos, destPos);
    flightCurveRef.current = flightCurve;

    const arcPoints = flightCurve.getPoints(50);
    const arcGeo = new THREE.BufferGeometry().setFromPoints(arcPoints);
    const arcMat = new THREE.LineBasicMaterial({
      color: 0xc8a951,
      linewidth: 2,
      transparent: true,
      opacity: 0.85,
    });
    const arcLine = new THREE.Line(arcGeo, arcMat);
    flightArcRef.current = arcLine;
    globeGroup.add(arcLine);

    // Animated Flight Beacon along Arc
    const beaconGeo = new THREE.SphereGeometry(0.045, 16, 16);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
    beaconMesh.position.copy(originPos);
    beaconMeshRef.current = beaconMesh;
    globeGroup.add(beaconMesh);

    // 8. Animation & Render Loop
    let t = 0;
    const animate = () => {
      t = (t + 0.012) % 1;
      setFlightProgress(t);

      // Smooth rotation interpolation
      const rot = rotationStateRef.current;
      rot.currentY += (rot.targetY - rot.currentY) * 0.05;
      rot.currentX += (rot.targetX - rot.currentX) * 0.05;

      if (globeGroupRef.current) {
        globeGroupRef.current.rotation.y = rot.currentY;
        globeGroupRef.current.rotation.x = rot.currentX;
      }

      // Update flight beacon along curve
      if (flightCurveRef.current && beaconMeshRef.current) {
        const beaconPos = flightCurveRef.current.getPoint(t);
        beaconMeshRef.current.position.copy(beaconPos);
      }

      // Pulse radar mesh
      if (radarMesh) {
        const scale = 1 + Math.sin(t * Math.PI * 4) * 0.35;
        radarMesh.scale.set(scale, scale, scale);
      }

      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // 9. Pointer / Drag Event Handlers for 3D Globe Rotation
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      isDraggingRef.current = true;
      const clientX = 'touches' in e ? e.touches[0]!.clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0]!.clientY : e.clientY;
      prevPointerRef.current = { x: clientX, y: clientY };
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDraggingRef.current) return;
      const clientX = 'touches' in e ? e.touches[0]!.clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0]!.clientY : e.clientY;
      const dx = clientX - prevPointerRef.current.x;
      const dy = clientY - prevPointerRef.current.y;

      rotationStateRef.current.targetY += dx * 0.006;
      rotationStateRef.current.targetX = THREE.MathUtils.clamp(
        rotationStateRef.current.targetX + dy * 0.006,
        -0.7,
        0.7,
      );

      prevPointerRef.current = { x: clientX, y: clientY };
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
    };

    const canvasEl = canvas;
    canvasEl.addEventListener('mousedown', handlePointerDown);
    canvasEl.addEventListener('touchstart', handlePointerDown, { passive: true });
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchend', handlePointerUp);

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      canvasEl.removeEventListener('mousedown', handlePointerDown);
      canvasEl.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchend', handlePointerUp);

      renderer.dispose();
      earthTexture.dispose();
      sphereGeo.dispose();
      sphereMat.dispose();
      haloGeo.dispose();
      haloMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      originGeo.dispose();
      originMat.dispose();
      radarGeo.dispose();
      radarMat.dispose();
      arcGeo.dispose();
      arcMat.dispose();
      beaconGeo.dispose();
      beaconMat.dispose();
    };
  }, [hasWebGL, isClient, originCity, activeDestination, destinations]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full rounded-2xl bg-gradient-to-b from-[#0D3B2E]/95 via-[#0A2F25] to-[#041A14] text-white p-4 md:p-8 shadow-2xl border border-[#C8A951]/30 overflow-hidden backdrop-blur-xl',
        className,
      )}
      data-testid="interactive-visa-globe"
    >
      {/* Background ambient lighting - Ocean Azure & Champagne Gold */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#0284C7]/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#C8A951]/20 blur-3xl pointer-events-none" />

      {/* Header & Search Toolbar */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-[#C8A951]">
              Live 3D Consular Radar • 60 FPS
            </span>
          </div>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-white mt-1">
            Interactive Global Visa Locator
          </h3>
          <p className="text-xs text-white/70 max-w-lg">
            Origin:{' '}
            <strong className="text-white">
              {originCity.name} ({originCity.code})
            </strong>
            . Drag to spin the photorealistic 3D Earth, locate embassy jurisdictions, and assess
            instant AI approval pathways.
          </p>
        </div>

        {enableInteractiveSearch && (
          <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Search country or visa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white/10 text-white placeholder-white/50 text-xs border border-white/15 focus:outline-hidden focus:border-[#C8A951] transition-all"
                aria-label="Search visa destination"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/60 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 text-xs">
              {['All', 'e-Visa', 'Work & PR'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-medium transition-all',
                    categoryFilter === cat
                      ? 'bg-[#C8A951] text-[#0D3B2E] font-semibold shadow-xs'
                      : 'text-white/70 hover:text-white',
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Interactive Stage: 3D Globe + Liquid Glass Intelligence Card */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Globe Viewport (Col 1-7) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center relative min-h-[340px] sm:min-h-[440px]">
          {hasWebGL && isClient ? (
            <div className="relative w-full max-w-[480px] aspect-square flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={500}
                height={500}
                className="w-full h-full aspect-square select-none cursor-grab active:cursor-grabbing rounded-full"
                aria-label="Interactive 3D Three.js WebGL visa globe canvas"
              />
              <div className="absolute bottom-1 right-2 text-[10px] text-white/40 font-mono pointer-events-none">
                WebGL 3D Earth • Drag to rotate
              </div>
            </div>
          ) : (
            /* 2D SVG Vector Orthographic Fallback for Reduced-Motion / Server SSR Environments */
            <div
              className="w-full max-w-[420px] aspect-square flex items-center justify-center relative"
              data-testid="globe-svg-fallback"
            >
              <svg
                viewBox="0 0 400 400"
                className="w-full h-full"
                aria-label="2D Orthographic Vector Visa Globe"
              >
                <defs>
                  <radialGradient id="svgGlobeGlow" cx="40%" cy="40%" r="60%">
                    <stop offset="0%" stopColor="#0284C7" />
                    <stop offset="60%" stopColor="#0D3B2E" />
                    <stop offset="100%" stopColor="#061D17" />
                  </radialGradient>
                  <linearGradient id="svgArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#C8A951" />
                    <stop offset="100%" stopColor="#F97316" />
                  </linearGradient>
                </defs>

                {/* Sphere */}
                <circle
                  cx="200"
                  cy="200"
                  r="160"
                  fill="url(#svgGlobeGlow)"
                  stroke="#C8A951"
                  strokeWidth="1.5"
                />

                {/* Meridians */}
                <ellipse
                  cx="200"
                  cy="200"
                  rx="160"
                  ry="80"
                  fill="none"
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth="1"
                />
                <ellipse
                  cx="200"
                  cy="200"
                  rx="80"
                  ry="160"
                  fill="none"
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth="1"
                />
                <line
                  x1="40"
                  y1="200"
                  x2="360"
                  y2="200"
                  stroke="rgba(200,169,81,0.3)"
                  strokeWidth="1.2"
                />

                {/* Origin Pin (DAC) */}
                <circle cx="230" cy="170" r="4" fill="#C8A951" />
                <circle
                  cx="230"
                  cy="170"
                  r="8"
                  fill="none"
                  stroke="#C8A951"
                  strokeWidth="1"
                  opacity="0.8"
                />
                <text
                  x="242"
                  y="166"
                  fill="#FFFFFF"
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {originCity.code} ({originCity.name})
                </text>

                {/* Destination Pin */}
                <circle cx="280" cy="220" r="5" fill="#F97316" />
                <circle
                  cx="280"
                  cy="220"
                  r="10"
                  fill="none"
                  stroke="#F97316"
                  strokeWidth="1.2"
                  opacity="0.8"
                />
                <text
                  x="295"
                  y="224"
                  fill="#C8A951"
                  fontSize="12"
                  fontWeight="bold"
                  fontFamily="Plus Jakarta Sans"
                >
                  {activeDestination.flag} {activeDestination.name}
                </text>

                {/* Flight Arc Path */}
                <path
                  d="M 230 170 Q 255 110 280 220"
                  fill="none"
                  stroke="url(#svgArcGrad)"
                  strokeWidth="2.5"
                  strokeDasharray="4 4"
                />

                {/* Traveling Pulse Beacon along SVG flight arc */}
                <circle
                  cx={230 + (280 - 230) * flightProgress}
                  cy={170 + (220 - 170) * flightProgress - Math.sin(flightProgress * Math.PI) * 45}
                  r="3.5"
                  fill="#FFFFFF"
                  stroke="#C8A951"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
          )}

          {/* Quick Country Pills Rail */}
          <div className="w-full flex items-center justify-center gap-1.5 flex-wrap mt-3">
            {filteredDestinations.slice(0, 7).map((dest) => (
              <button
                key={dest.id}
                type="button"
                onClick={() => handleSelect(dest)}
                className={cn(
                  'px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all border',
                  dest.id === activeDestination.id
                    ? 'bg-[#C8A951] text-[#0D3B2E] border-[#C8A951] font-semibold shadow-md scale-105'
                    : 'bg-white/10 text-white/80 border-white/15 hover:bg-white/20 hover:text-white',
                )}
                aria-pressed={dest.id === activeDestination.id}
              >
                <span>{dest.flag}</span>
                <span>{dest.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Liquid Glass Country Intelligence Card (Col 8-12) */}
        {showIntelligenceCard && (
          <div
            className="lg:col-span-5 bg-white/95 text-[#0F172A] rounded-2xl p-5 sm:p-6 shadow-2xl border border-[#C8A951]/40 backdrop-blur-xl transition-all"
            data-testid="country-intelligence-card"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-[#E2E8F0] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl" role="img" aria-label={activeDestination.name}>
                    {activeDestination.flag}
                  </span>
                  <div>
                    <h4 className="font-display text-xl font-bold text-[#0D3B2E]">
                      {activeDestination.name}
                    </h4>
                    <span className="text-xs text-[#64748B] font-medium">
                      {activeDestination.category}
                    </span>
                  </div>
                </div>
              </div>

              <span
                className={cn(
                  'px-2.5 py-1 rounded-md text-[11px] font-bold tracking-tight uppercase',
                  activeDestination.autonomyLevel.includes('Level 3')
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : activeDestination.autonomyLevel.includes('Level 2')
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-slate-100 text-slate-800 border border-slate-300',
                )}
              >
                {activeDestination.autonomyLevel}
              </span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 my-4">
              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                  Processing SLA
                </span>
                <p className="font-display text-lg font-bold text-[#0D3B2E] mt-0.5">
                  {activeDestination.processingTime}
                </p>
                <span className="text-[10px] text-emerald-600 font-medium">
                  ⚡ Priority Fast-Track
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                  Historical Approval
                </span>
                <p className="font-display text-lg font-bold text-[#15803D] mt-0.5">
                  {activeDestination.approvalRate}
                </p>
                <span className="text-[10px] text-[#64748B] font-medium">
                  AI Pre-Scored Dossier
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                  Government Fee
                </span>
                <p className="font-mono text-xs font-bold text-[#0F172A] mt-0.5">
                  {activeDestination.govFee}
                </p>
                <span className="text-[10px] text-[#64748B]">Official Consular Lodgment</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                  Transparent Service
                </span>
                <p className="font-mono text-xs font-bold text-[#0D3B2E] mt-0.5">
                  {activeDestination.serviceFee}
                </p>
                <span className="text-[10px] text-emerald-600 font-medium">
                  No Hidden Surcharges
                </span>
              </div>
            </div>

            {/* Route & Requirements */}
            <div className="space-y-2 text-xs text-[#334155] border-t border-[#E2E8F0] pt-3">
              <div className="flex items-start gap-2">
                <span className="text-[#C8A951] font-bold">✓</span>
                <div>
                  <strong className="text-[#0D3B2E]">Fastest Pathway: </strong>
                  <span>{activeDestination.fastestRoute}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#C8A951] font-bold">✓</span>
                <div>
                  <strong className="text-[#0D3B2E]">Key Eligibility: </strong>
                  <span>{activeDestination.requirementsSummary}</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-5">
              <a
                href={`/assess?country=${activeDestination.slug}`}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0D3B2E] hover:bg-[#092A21] text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all border border-[#C8A951]/40"
              >
                <span>Start AI Assessment for {activeDestination.name}</span>
                <span>→</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
