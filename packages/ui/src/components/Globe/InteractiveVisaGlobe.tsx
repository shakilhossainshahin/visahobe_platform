'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { cn } from '../../utils/cn.js';
import {
  type GlobeDestination,
  type InteractiveVisaGlobeProps,
  DEFAULT_ORIGIN_CITY,
  STANDARD_GLOBE_DESTINATIONS,
} from './types.js';

// Pre-computed land coordinate clusters for the tactical 3D dot-matrix globe
const LAND_COORDINATES: Array<[number, number]> = [
  // Europe & UK
  [51.5, -0.1],
  [48.8, 2.3],
  [52.5, 13.4],
  [41.9, 12.5],
  [40.4, -3.7],
  [59.3, 18.0],
  [55.7, 37.6],
  // Middle East & UAE
  [25.2, 55.3],
  [24.4, 54.3],
  [21.5, 39.2],
  [32.0, 34.8],
  [33.3, 44.3],
  [35.6, 51.4],
  // South & Southeast Asia (Dhaka, Singapore, Malaysia, Thailand, India)
  [23.8, 90.4],
  [22.3, 91.8],
  [28.6, 77.2],
  [19.0, 72.8],
  [13.0, 80.2],
  [1.3, 103.8],
  [3.1, 101.7],
  [13.7, 100.5],
  [10.8, 106.6],
  // East Asia
  [39.9, 116.4],
  [31.2, 121.5],
  [35.6, 139.6],
  [37.5, 126.9],
  [22.3, 114.1],
  // North America
  [40.7, -74.0],
  [34.0, -118.2],
  [41.8, -87.6],
  [29.7, -95.3],
  [37.7, -122.4],
  [45.5, -73.5],
  [49.2, -123.1],
  [43.6, -79.3],
  // Australia & Oceania
  [-33.8, 151.2],
  [-37.8, 144.9],
  [-31.9, 115.8],
  [-27.4, 153.0],
  [-41.2, 174.7],
  // Africa
  [30.0, 31.2],
  [-26.2, 28.0],
  [6.5, 3.3],
  [-1.2, 36.8],
  [33.5, -7.6],
  // South America
  [-23.5, -46.6],
  [-34.6, -58.3],
  [4.7, -74.0],
  [-12.0, -77.0],
  [-33.4, -70.6],
];

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

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const rotationRef = useRef<{
    yaw: number;
    pitch: number;
    targetYaw: number;
    targetPitch: number;
  }>({
    yaw: 0,
    pitch: 15,
    targetYaw: 0,
    targetPitch: 15,
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

  // Update target rotation when destination changes
  useEffect(() => {
    if (!activeDestination) return;
    // Bring destination to the front: yaw is negative longitude, pitch is slight tilt toward latitude
    const targetY = -activeDestination.lng;
    const targetP = Math.max(-25, Math.min(35, activeDestination.lat * 0.4));
    rotationRef.current.targetYaw = targetY;
    rotationRef.current.targetPitch = targetP;
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

  // 60fps 3D Canvas Rendering Engine
  useEffect(() => {
    if (!hasWebGL || !isClient) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localFlight = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.38;

      ctx.clearRect(0, 0, width, height);

      // Smooth rotation interpolation
      const rot = rotationRef.current;
      rot.yaw += (rot.targetYaw - rot.yaw) * 0.05;
      rot.pitch += (rot.targetPitch - rot.pitch) * 0.05;

      // Flight arc pulse progression
      localFlight = (localFlight + 0.015) % 1;
      setFlightProgress(localFlight);

      const to3D = (lat: number, lng: number, rOffset = 0) => {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lng + rot.yaw) * (Math.PI / 180);
        const pRad = rot.pitch * (Math.PI / 180);

        // Spherical coords
        const x = (radius + rOffset) * Math.sin(phi) * Math.cos(theta);
        let y = (radius + rOffset) * Math.cos(phi);
        let z = (radius + rOffset) * Math.sin(phi) * Math.sin(theta);

        // Pitch tilt around X axis
        const cosP = Math.cos(pRad);
        const sinP = Math.sin(pRad);
        const yRot = y * cosP - z * sinP;
        const zRot = y * sinP + z * cosP;
        y = yRot;
        z = zRot;

        return { x: cx + x, y: cy - y, z, visible: z > -radius * 0.2 };
      };

      // 1. Ambient Outer Halo (Liquid Glass Emerald + Gold glow)
      const haloGrad = ctx.createRadialGradient(cx, cy, radius * 0.85, cx, cy, radius * 1.25);
      haloGrad.addColorStop(0, 'rgba(13, 59, 46, 0.35)');
      haloGrad.addColorStop(0.5, 'rgba(20, 83, 66, 0.15)');
      haloGrad.addColorStop(1, 'rgba(13, 59, 46, 0)');
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.25, 0, Math.PI * 2);
      ctx.fill();

      // 2. Base Sphere (Deep Emerald dark globe)
      const sphereGrad = ctx.createRadialGradient(
        cx - radius * 0.3,
        cy - radius * 0.3,
        radius * 0.1,
        cx,
        cy,
        radius,
      );
      sphereGrad.addColorStop(0, '#124838');
      sphereGrad.addColorStop(0.65, '#0D3B2E');
      sphereGrad.addColorStop(1, '#061D17');
      ctx.fillStyle = sphereGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Hairline sphere border (Champagne gold accent)
      ctx.strokeStyle = 'rgba(200, 169, 81, 0.4)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // 3. Meridian Grids (Latitude and Longitude Rings)
      ctx.lineWidth = 0.7;
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.strokeStyle = lat === 0 ? 'rgba(200, 169, 81, 0.25)' : 'rgba(255, 255, 255, 0.08)';
        ctx.beginPath();
        let started = false;
        for (let lng = 0; lng <= 360; lng += 10) {
          const pt = to3D(lat, lng);
          if (pt.visible) {
            if (!started) {
              ctx.moveTo(pt.x, pt.y);
              started = true;
            } else {
              ctx.lineTo(pt.x, pt.y);
            }
          } else {
            started = false;
          }
        }
        ctx.stroke();
      }

      // 4. Tactical Landmass Coordinates (Glowing Matrix Dots)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      for (const [lat, lng] of LAND_COORDINATES) {
        const pt = to3D(lat, lng);
        if (pt.visible) {
          const alpha = Math.max(0.1, Math.min(1, (pt.z + radius * 0.2) / radius));
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.65})`;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 5. Origin Marker: Dhaka (DAC)
      const originPt = to3D(originCity.lat, originCity.lng);
      if (originPt.visible) {
        // Glowing gold pulsing radar ring
        ctx.strokeStyle = 'rgba(200, 169, 81, 0.85)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(
          originPt.x,
          originPt.y,
          4 + Math.sin(localFlight * Math.PI * 4) * 2,
          0,
          Math.PI * 2,
        );
        ctx.stroke();

        ctx.fillStyle = '#C8A951';
        ctx.beginPath();
        ctx.arc(originPt.x, originPt.y, 3, 0, Math.PI * 2);
        ctx.fill();

        // Label DAC
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '600 10px JetBrains Mono, monospace';
        ctx.fillText(`DAC (${originCity.name})`, originPt.x + 8, originPt.y - 4);
      }

      // 6. Destination Marker
      const destPt = to3D(activeDestination.lat, activeDestination.lng);
      if (destPt.visible) {
        // Pulsing emerald target beacon
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(destPt.x, destPt.y, 6 + Math.cos(localFlight * Math.PI * 4) * 2.5, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#10B981';
        ctx.beginPath();
        ctx.arc(destPt.x, destPt.y, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Destination Callout
        ctx.fillStyle = '#C8A951';
        ctx.font = '700 11px Plus Jakarta Sans, sans-serif';
        ctx.fillText(
          `${activeDestination.flag} ${activeDestination.name}`,
          destPt.x + 10,
          destPt.y + 4,
        );
      }

      // 7. Dynamic Parabolic Flight Arc (DAC -> Destination)
      if (originPt.visible || destPt.visible) {
        const steps = 30;
        ctx.beginPath();
        let flightStarted = false;

        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          // Interpolate lat / lng along great arc
          const curLat = originCity.lat + (activeDestination.lat - originCity.lat) * t;
          const curLng = originCity.lng + (activeDestination.lng - originCity.lng) * t;
          // Arch upward in middle of flight
          const arcElevation = Math.sin(t * Math.PI) * (radius * 0.28);
          const pt = to3D(curLat, curLng, arcElevation);

          if (pt.visible) {
            if (!flightStarted) {
              ctx.moveTo(pt.x, pt.y);
              flightStarted = true;
            } else {
              ctx.lineTo(pt.x, pt.y);
            }
          }
        }

        ctx.strokeStyle = 'rgba(200, 169, 81, 0.7)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Animated traveling beacon along flight arc
        const t = localFlight;
        const curLat = originCity.lat + (activeDestination.lat - originCity.lat) * t;
        const curLng = originCity.lng + (activeDestination.lng - originCity.lng) * t;
        const arcElevation = Math.sin(t * Math.PI) * (radius * 0.28);
        const beaconPt = to3D(curLat, curLng, arcElevation);

        if (beaconPt.visible) {
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(beaconPt.x, beaconPt.y, 3.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = 'rgba(200, 169, 81, 0.9)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(beaconPt.x, beaconPt.y, 6, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [hasWebGL, isClient, originCity, activeDestination]);

  return (
    <div
      className={cn(
        'relative w-full rounded-2xl bg-gradient-to-b from-[#0D3B2E]/90 to-[#08241D] text-white p-4 md:p-8 shadow-2xl border border-[#C8A951]/25 overflow-hidden backdrop-blur-xl',
        className,
      )}
      data-testid="interactive-visa-globe"
    >
      {/* Background ambient lighting */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#145342]/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#C8A951]/15 blur-3xl pointer-events-none" />

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
            . Select any country to locate embassy jurisdiction, real-time approval rates, and AI
            autonomy levels.
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
        <div className="lg:col-span-7 flex flex-col items-center justify-center relative min-h-[340px] sm:min-h-[420px]">
          {hasWebGL && isClient ? (
            <canvas
              ref={canvasRef}
              width={600}
              height={600}
              className="w-full max-w-[480px] aspect-square select-none cursor-grab active:cursor-grabbing"
              aria-label="Interactive 3D visa globe canvas"
            />
          ) : (
            /* 2D SVG Vector Orthographic Fallback for Reduced-Motion / Non-WebGL Environments */
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
                    <stop offset="0%" stopColor="#145342" />
                    <stop offset="60%" stopColor="#0D3B2E" />
                    <stop offset="100%" stopColor="#061D17" />
                  </radialGradient>
                  <linearGradient id="svgArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#C8A951" />
                    <stop offset="100%" stopColor="#10B981" />
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
                <circle cx="280" cy="220" r="5" fill="#10B981" />
                <circle
                  cx="280"
                  cy="220"
                  r="10"
                  fill="none"
                  stroke="#10B981"
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
          <div className="w-full flex items-center justify-center gap-1.5 flex-wrap mt-2">
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
