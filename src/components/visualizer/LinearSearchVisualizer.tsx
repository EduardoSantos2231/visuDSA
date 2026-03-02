import { useState, useEffect, useCallback, useRef } from 'react';
import ArrayVisualizer from './ArrayVisualizer';
import AnimationControls from './AnimationControls';
import type { ArrayElement, AnimationStep } from './types';

function generateArray(size: number): ArrayElement[] {
  return Array.from({ length: size }, () => ({
    value: Math.floor(Math.random() * 99) + 1,
    state: 'default' as const,
  }));
}

function generateSteps(array: number[], target: number): AnimationStep[] {
  const steps: AnimationStep[] = [];
  
  for (let i = 0; i < array.length; i++) {
    if (array[i] === target) {
      steps.push({
        index: i,
        state: 'found',
        description: `Encontrado! O valor ${target} está no índice ${i}`,
      });
      break;
    }
    
    steps.push({
      index: i,
      state: 'comparing',
      description: `Comparando ${array[i]} com ${target}`,
    });
  }
  
  if (!array.includes(target)) {
    steps.push({
      index: -1,
      state: 'not-found',
      description: `Não encontrado! O valor ${target} não existe no array`,
    });
  }
  
  return steps;
}

export default function LinearSearchVisualizer() {
  const [arraySize, setArraySize] = useState(15);
  const [speed, setSpeed] = useState(500);
  const [targetValue, setTargetValue] = useState<number | null>(42);
  const [elements, setElements] = useState<ArrayElement[]>(() => generateArray(15));
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [steps, setSteps] = useState<AnimationStep[]>([]);
  const [description, setDescription] = useState('Configure os parâmetros e clique em Iniciar');
  const intervalRef = useRef<number | null>(null);
  const stepsRef = useRef<AnimationStep[]>([]);

  useEffect(() => {
    stepsRef.current = steps;
  }, [steps]);

  const generateNewArray = useCallback((size: number) => {
    const newArray = generateArray(size);
    setElements(newArray);
    setCurrentStep(-1);
    setSteps([]);
    setIsPlaying(false);
    setDescription('Configure os parâmetros e clique em Iniciar');
  }, []);

  const handleArraySizeChange = useCallback((newSize: number) => {
    setArraySize(newSize);
    generateNewArray(newSize);
  }, [generateNewArray]);

  const handleReplay = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(-1);
    setSteps([]);
    setDescription('Configure os parâmetros e clique em Iniciar');
    setElements(prev => prev.map(e => ({ ...e, state: 'default' })));
  }, []);

  const handleStep = useCallback(() => {
    if (targetValue === null) {
      setDescription('Defina um valor para buscar');
      return;
    }

    if (stepsRef.current.length === 0) {
      const arrayValues = elements.map(e => e.value);
      const newSteps = generateSteps(arrayValues, targetValue);
      setSteps(newSteps);
    }

    if (currentStep < stepsRef.current.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setDescription(stepsRef.current[nextStep]?.description || '');

      setElements(prev => prev.map((el, idx) => {
        if (idx < nextStep) {
          return { ...el, state: 'default' as const };
        }
        if (idx === nextStep) {
          return { ...el, state: stepsRef.current[nextStep]?.state || 'comparing' };
        }
        return el;
      }));
    }
  }, [targetValue, currentStep, elements]);

  const handlePlayPause = useCallback(() => {
    if (targetValue === null) {
      setDescription('Defina um valor para buscar');
      return;
    }

    if (stepsRef.current.length === 0) {
      const arrayValues = elements.map(e => e.value);
      const newSteps = generateSteps(arrayValues, targetValue);
      setSteps(newSteps);
    }

    setIsPlaying(prev => !prev);
  }, [targetValue, elements]);

  useEffect(() => {
    if (isPlaying && currentStep < stepsRef.current.length - 1) {
      intervalRef.current = window.setTimeout(() => {
        setCurrentStep(prev => {
          const nextStep = prev + 1;
          setDescription(stepsRef.current[nextStep]?.description || '');
          
          setElements(elements => elements.map((el, idx) => {
            if (idx < nextStep) {
              return { ...el, state: 'default' as const };
            }
            if (idx === nextStep) {
              return { ...el, state: stepsRef.current[nextStep]?.state || 'comparing' };
            }
            return el;
          }));
          
          return nextStep;
        });
      }, speed);
    } else if (isPlaying && currentStep >= stepsRef.current.length - 1) {
      setIsPlaying(false);
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [isPlaying, currentStep, speed]);

  useEffect(() => {
    setSteps([]);
    setCurrentStep(-1);
    setDescription('Configure os parâmetros e clique em Iniciar');
    setElements(prev => prev.map(e => ({ ...e, state: 'default' })));
  }, [targetValue]);

  useEffect(() => {
    if (!isPlaying && targetValue !== null && steps.length === 0) {
      const arrayValues = elements.map(e => e.value);
      const newSteps = generateSteps(arrayValues, targetValue);
      setSteps(newSteps);
    }
  }, [targetValue, elements, isPlaying, steps.length]);

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-6">
      <ArrayVisualizer 
        elements={elements} 
        currentIndex={currentStep}
        targetValue={targetValue}
      />
      
      <AnimationControls
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onReplay={handleReplay}
        onStep={handleStep}
        speed={speed}
        onSpeedChange={setSpeed}
        arraySize={arraySize}
        onArraySizeChange={handleArraySizeChange}
        targetValue={targetValue}
        onTargetValueChange={setTargetValue}
        canStep={targetValue !== null}
      />

      <div className="p-4 bg-secondary/50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}
