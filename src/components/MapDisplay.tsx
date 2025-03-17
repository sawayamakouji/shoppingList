import React from 'react';
import './MapDisplay.css';
import storeMap from '../images/store-map.jpg';
import { Item } from './ChatSimulation';

interface MapDisplayProps {
  items: Item[];
}

const MapDisplay: React.FC<MapDisplayProps> = ({ items }) => {
  // 各商品の位置（例として固定値、実際は画像に合わせて調整する）
  const markers = items.map(item => {
    let position = { x: 100, y: 100 };
    if (item.id === 1) {
      position = { x: 150, y: 200 };
    } else if (item.id === 2) {
      position = { x: 300, y: 350 };
    }
    return { ...item, ...position };
  });

  return (
    <div className="map-container">
      <img src={storeMap} alt="店内マップ" className="map-image" />
      {markers.map(marker => (
        <div
          key={marker.id}
          className="map-marker"
          style={{
            left: marker.x,
            top: marker.y,
            backgroundColor: marker.scanned ? 'green' : 'red'
          }}
        >
          {marker.name}
        </div>
      ))}
    </div>
  );
};

export default MapDisplay;
