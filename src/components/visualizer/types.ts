export type ElementState = 'default' | 'range' | 'discarded' | 'comparing' | 'found' | 'not-found';

export interface ArrayElement {
  value: number;
  state: ElementState;
}

export interface AnimationStep {
  index: number;
  state: ElementState;
  description: string;
  left?: number;
  right?: number;
}

export interface VisualizerConfig {
  arraySize: number;
  animationSpeed: number;
  targetValue: number | null;
}
