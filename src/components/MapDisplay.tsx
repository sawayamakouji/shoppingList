import React from 'react';
import './MapDisplay.css';
import storeMap from '../images/store-map.png';
import { Item } from './ChatSimulation';

interface MapDisplayProps {
  items: Item[];
}

const MapDisplay: React.FC<MapDisplayProps> = ({ items }) => {

  // 各商品の元画像での座標（例：元画像の幅800px, 高さ600pxの場合）
  // これらの値をパーセンテージに変換する（x％, y％）
  const markers = items.map(item => {
    let posPercent = { left: '0%', top: '0%' };
    // 例：各商品の元画像上のピクセル座標
    if (item.id === 1) {
      // 例えば、元画像幅800px, x=150px → (150/800*100) = 18.75%
      posPercent = { left: '88.75%', top: '33.33%' }; // 仮の値
    } else if (item.id === 2) {
      posPercent = { left: '47.5%', top: '75.33%' }; // 仮の値
    } else if (item.id === 3) {
      posPercent = { left: '89.25%', top: '65.67%' }; // 仮の値
    } else if (item.id === 4) {
      posPercent = { left: '65%', top: '56.67%' }; // 仮の値
    }
    return { ...item, ...posPercent };
  });

  return (
    <div className="map-container">
      <img src={storeMap} alt="店内マップ" className="map-image" />
      {markers.map(marker => (
        <div
          key={marker.id}
          className="map-marker"
          style={{
            left: marker.left,
            top: marker.top,
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