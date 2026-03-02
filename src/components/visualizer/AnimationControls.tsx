import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';

interface AnimationControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onReplay: () => void;
  onStep: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  arraySize: number;
  onArraySizeChange: (size: number) => void;
  targetValue: number | null;
  onTargetValueChange: (value: number | null) => void;
  canStep: boolean;
}

export default function AnimationControls({
  isPlaying,
  onPlayPause,
  onReplay,
  onStep,
  speed,
  onSpeedChange,
  arraySize,
  onArraySizeChange,
  targetValue,
  onTargetValueChange,
  canStep,
}: AnimationControlsProps) {
  const handleRandomTarget = () => {
    const elements = Array.from({ length: arraySize }, () => 
      Math.floor(Math.random() * 99) + 1
    );
    const randomElement = elements[Math.floor(Math.random() * elements.length)];
    onTargetValueChange(randomElement);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button
          onClick={onPlayPause}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
        >
          {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
          {isPlaying ? 'Pausar' : 'Iniciar'}
        </button>
        
        <button
          onClick={onStep}
          disabled={!canStep}
          className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <SkipForward className="size-4" />
          Passo
        </button>
        
        <button
          onClick={onReplay}
          className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
        >
          <RotateCcw className="size-4" />
          Reiniciar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">
            Velocidade: {speed}ms
          </label>
          <input
            type="range"
            min="100"
            max="2000"
            step="100"
            value={speed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Rápido</span>
            <span>Lento</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">
            Elementos: {arraySize}
          </label>
          <input
            type="range"
            min="10"
            max="30"
            step="1"
            value={arraySize}
            onChange={(e) => onArraySizeChange(Number(e.target.value))}
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>10</span>
            <span>30</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">
          Valor a buscar
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            min="1"
            max="99"
            value={targetValue ?? ''}
            onChange={(e) => {
              const val = e.target.value ? Number(e.target.value) : null;
              if (val !== null && val < 1) {
                onTargetValueChange(1);
              } else if (val !== null && val > 99) {
                onTargetValueChange(99);
              } else {
                onTargetValueChange(val);
              }
            }}
            placeholder="Digite um valor"
            className="flex-1 px-3 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            onClick={handleRandomTarget}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
          >
            Aleatório
          </button>
        </div>
      </div>
    </div>
  );
}
