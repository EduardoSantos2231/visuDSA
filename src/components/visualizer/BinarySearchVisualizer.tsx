import { useState, useEffect, useCallback, useRef } from 'react';
import ArrayVisualizer from './ArrayVisualizer';
import AnimationControls from './AnimationControls';
import type { ArrayElement, AnimationStep } from './types';

function generateSortedArray(size: number): ArrayElement[] {
  const values = Array.from({ length: size }, () => Math.floor(Math.random() * 99) + 1);
  values.sort((a, b) => a - b);
  return values.map(value => ({
    value,
    state: 'default' as const,
  }));
}

function generateSteps(array: number[], target: number): AnimationStep[] {
  const steps: AnimationStep[] = [];
  let left = 0;
  let right = array.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    steps.push({
      index: mid,
      state: 'comparing',
      left,
      right,
      description: `Verificando elemento no índice ${mid} (valor: ${array[mid]})`,
    });

    if (array[mid] === target) {
      steps.push({
        index: mid,
        state: 'found',
        left,
        right,
        description: `Encontrado! O valor ${target} está no índice ${mid}`,
      });
      return steps;
    }

    if (array[mid] < target) {
      steps.push({
        index: mid,
        state: 'range',
        left,
        right,
        description: `${array[mid]} < ${target}. Descartando esquerda, buscando na direita`,
      });
      left = mid + 1;
    } else {
      steps.push({
        index: mid,
        state: 'range',
        left,
        right,
        description: `${array[mid]} > ${target}. Descartando direita, buscando na esquerda`,
      });
      right = mid - 1;
    }
  }

  steps.push({
    index: -1,
    state: 'not-found',
    left: 0,
    right: array.length - 1,
    description: `Não encontrado! O valor ${target} não existe no array`,
  });

  return steps;
}

export default function BinarySearchVisualizer() {
  const [arraySize, setArraySize] = useState(15);
  const [speed, setSpeed] = useState(500);
  const [targetValue, setTargetValue] = useState<number | null>(42);
  const [elements, setElements] = useState<ArrayElement[]>(() => generateSortedArray(15));
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
    const newArray = generateSortedArray(size);
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
    const sorted = generateSortedArray(arraySize);
    setElements(sorted);
  }, [arraySize]);

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
      const stepData = stepsRef.current[nextStep];
      setDescription(stepData?.description || '');

      const rangeLeft = stepData?.left ?? 0;
      const rangeRight = stepData?.right ?? elements.length - 1;

      setElements(prev => prev.map((el, idx) => {
        if (stepData?.state === 'found' && idx === stepData.index) {
          return { ...el, state: 'found' as const };
        }
        if (stepData?.state === 'not-found') {
          return { ...el, state: 'default' as const };
        }
        if (stepData?.state === 'comparing' && idx === stepData.index) {
          return { ...el, state: 'comparing' as const };
        }
        if (stepData?.state === 'range' || stepData?.state === 'comparing') {
          if (idx < rangeLeft || idx > rangeRight) {
            return { ...el, state: 'discarded' as const };
          }
          if (idx >= rangeLeft && idx <= rangeRight && idx !== stepData.index) {
            return { ...el, state: 'range' as const };
          }
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
          const stepData = stepsRef.current[nextStep];
          setDescription(stepData?.description || '');

          const rangeLeft = stepData?.left ?? 0;
          const rangeRight = stepData?.right ?? elements.length - 1;

          setElements(prev => prev.map((el, idx) => {
            if (stepData?.state === 'found' && idx === stepData.index) {
              return { ...el, state: 'found' as const };
            }
            if (stepData?.state === 'not-found') {
              return { ...el, state: 'default' as const };
            }
            if (stepData?.state === 'comparing' && idx === stepData.index) {
              return { ...el, state: 'comparing' as const };
            }
            if (stepData?.state === 'range' || stepData?.state === 'comparing') {
              if (idx < rangeLeft || idx > rangeRight) {
                return { ...el, state: 'discarded' as const };
              }
              if (idx >= rangeLeft && idx <= rangeRight && idx !== stepData.index) {
                return { ...el, state: 'range' as const };
              }
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
  }, [isPlaying, currentStep, speed, elements]);

  useEffect(() => {
    setSteps([]);
    setCurrentStep(-1);
    setDescription('Configure os parâmetros e clique em Iniciar');
  }, [targetValue]);

  useEffect(() => {
    const sorted = generateSortedArray(arraySize);
    setElements(sorted);
    setSteps([]);
    setCurrentStep(-1);
    setDescription('Configure os parâmetros e clique em Iniciar');
  }, [arraySize]);

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

      <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#3b82f6]"></div>
          <span>Intervalo de busca</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#f59e0b]"></div>
          <span>Comparando</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#22c55e]"></div>
          <span>Encontrado</span>
        </div>
      </div>
    </div>
  );
}
