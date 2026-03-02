export type ElementState = 'default' | 'comparing' | 'found' | 'not-found';

export interface ArrayElement {
  value: number;
  state: ElementState;
}

export interface AnimationStep {
  index: number;
  state: ElementState;
  description: string;
}

export interface VisualizerConfig {
  arraySize: number;
  animationSpeed: number;
  targetValue: number | null;
}
