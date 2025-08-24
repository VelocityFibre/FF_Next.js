
import { DropCard } from './DropCard';
import type { Drop } from '../types/drops.types';

interface DropsGridProps {
  drops: Drop[];
}

export function DropsGrid({ drops }: DropsGridProps) {
  const handleDropClick = (drop: Drop) => {
    console.log('Drop selected:', drop);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {drops.map(drop => (
        <DropCard 
          key={drop.id} 
          drop={drop} 
          onDropClick={handleDropClick}
        />
      ))}
    </div>
  );
}