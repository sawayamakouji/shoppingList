import React, { useMemo } from 'react';
import storeMap from '../images/store-map.png';
import { Item } from './ChatSimulation';

interface MapDisplayProps {
  items: Item[];
  positions?: Record<number, { left: number; top: number }>;
  currentItemId?: number;
}

const MapDisplay: React.FC<MapDisplayProps> = ({ items, positions, currentItemId }) => {
  const itemPositions = useMemo(() => {
    if (positions) return positions;
    const pos: Record<number, { left: number; top: number }> = {};
    items.forEach(item => {
      pos[item.id] = {
        left: Math.random() * 80 + 10,
        top: Math.random() * 80 + 10,
      };
    });
    return pos;
  }, [positions, items]);

  return (
    <div className="map-container" style={{ position: 'relative' }}>
      <style>
        {`
          @keyframes glow {
            0% { box-shadow: 0 0 5px yellow; }
            50% { box-shadow: 0 0 20px yellow; }
            100% { box-shadow: 0 0 5px yellow; }
          }
        `}
      </style>
      <img
        src={storeMap}
        alt="店内マップ"
        className="map-image"
        style={{ width: '100%', height: 'auto' }}
      />
      {items.map((item) => {
        const isCurrent = currentItemId === item.id;
        return (
          <div
            key={item.id}
            className="map-marker text-sm md:text-base"  // ここでレスポンシブなフォントサイズを設定
            style={{
              position: 'absolute',
              left: `${itemPositions[item.id].left}%`,
              top: `${itemPositions[item.id].top}%`,
              backgroundColor: item.scanned ? '#D3D3D3' : 'red',
              padding: '4px 8px',
              borderRadius: '4px',
              color: '#fff',
              transform: 'translate(-50%, -50%)',
              border: isCurrent ? '3px solid yellow' : 'none',
              animation: isCurrent ? 'glow 1s infinite' : 'none',
            }}
          >
            {item.name}
          </div>
        );
      })}
    </div>
  );
};

export default MapDisplay;
