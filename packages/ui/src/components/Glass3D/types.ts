import React from 'react';

export type GlassGlowColor = 'gold' | 'emerald' | 'amber' | 'neutral';

export interface Glass3DCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  glowColor?: GlassGlowColor;
  tiltIntensity?: number;
  specular?: boolean;
  spotlight?: boolean;
  interactive?: boolean;
  blur?: boolean;
  dataTestId?: string;
}

export interface AuroraParallaxBackdropProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  intensity?: 'subtle' | 'vibrant' | 'deep';
  showParticles?: boolean;
  dataTestId?: string;
}

export interface ParallaxStageProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  perspective?: number;
  depthSpeed?: number;
  dataTestId?: string;
}

export interface ParallaxLayerProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  speed?: number;
  zOffset?: number;
  dataTestId?: string;
}

export interface ScrollReveal3DProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  delayMs?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'zoom';
  dataTestId?: string;
}

export interface FloatingGlassDockItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  active?: boolean;
  badge?: string;
  onClick?: () => void;
}

export interface FloatingGlassDockProps extends React.HTMLAttributes<HTMLDivElement> {
  items: FloatingGlassDockItem[];
  className?: string;
  position?: 'bottom' | 'top' | 'floating';
  blur?: boolean;
  hideOnMobile?: boolean;
  dataTestId?: string;
}
