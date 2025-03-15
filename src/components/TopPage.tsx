// src/components/TopPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import icon001 from '../images/001.jpg';
import icon002 from '../images/002.jpg';
import icon003 from '../images/003.jpg';
import icon004 from '../images/004.jpg';
import icon005 from '../images/005.jpg';
import icon006 from '../images/006.jpg';

export function TopPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      {/* タイトル */}
      <div className="mb-12 text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-blue-700">
          ショッピンぐクエスト
        </h1>
      </div>
      {/* 選択項目 */}
      <div className="w-full max-w-md space-y-4">
        <button
          onClick={() => navigate('/app')}
          className="w-full py-4 text-2xl md:text-3xl font-bold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
        >
          🧳準備する🎁
        </button>
        <button
          onClick={() => navigate('/shopping')}
          className="w-full py-4 text-2xl md:text-3xl font-bold text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors"
        >
          🎈買物にいく🚲
        </button>
        <button
          onClick={() => navigate('/Rank')}
          className="w-full py-4 text-2xl md:text-3xl font-bold text-white bg-purple-500 rounded-lg hover:bg-purple-600 transition-colors"
        >
          🏆ランキング📝
        </button>
        <button
          onClick={() => navigate('/King')}
          className="w-full py-4 text-2xl md:text-3xl font-bold text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors"
        >
          👂問い合わせ📞
        </button>
        <button
          onClick={() => navigate('/Recommend')}
          className="w-full py-4 text-2xl md:text-3xl font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
        >
          👉おすすめ
        </button>
        <button
          onClick={() => navigate('/QuestRewardsAnimated')}
          className="w-full py-4 text-2xl md:text-3xl font-bold text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors"
        >
          💎ごほうび👑
        </button>
        <button
          onClick={() => navigate('/album')}
          className="w-full py-4 text-2xl md:text-3xl font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
        >
          📷 写真
        </button>
        <button
          onClick={() => navigate('/Game')}
          className="w-full py-4 text-2xl md:text-3xl font-bold text-white bg-purple-500 rounded-lg hover:bg-purple-600 transition-colors"
        >
          🎮暇つぶし
        </button>
        <button
          onClick={() => window.location.href = 'https://suzuri.jp/7DbpRihzKefprwx'}
          className="w-full py-4 text-2xl md:text-3xl font-bold text-white bg-green-500 rounded-lg hover:bg-red-600 transition-colors"
        >
          スペシャルショップ
        </button>
      </div>

      {/* 6人の丸いアイコンリンク */}
      <div className="mt-12 flex justify-around w-full max-w-md">
      <div className="cursor-pointer" onClick={() => window.open('https://x.com/shuyin02')}>
        <img src={icon001} alt="アイコン" className="w-16 h-16 rounded-full object-cover" />
        </div>
        <div className="cursor-pointer" onClick={() => window.open( 'https://x.com/okinakamasayos1')}>
        <img src={icon002} alt="アイコン" className="w-16 h-16 rounded-full object-cover" />
        </div>
        <div className="cursor-pointer" onClick={() => window.open( 'https://x.com/aya451778')}>
        <img src={icon003} alt="アイコン" className="w-16 h-16 rounded-full object-cover" />
        </div>
        <div className="cursor-pointer" onClick={() => window.open('https://x.com/YUI447486742018')}>
        <img src={icon004} alt="アイコン" className="w-16 h-16 rounded-full object-cover" />
        </div>
        <div className="cursor-pointer" onClick={() => window.open('https://x.com/isocchi1123')}>
        <img src={icon005} alt="アイコン" className="w-16 h-16 rounded-full object-cover" />
        </div>
        <div className="cursor-pointer" onClick={() => window.open( 'https://x.com/7DbpRihzKefprwx')}>
        <img src={icon006} alt="アイコン" className="w-16 h-16 rounded-full object-cover" />
        </div>
      </div>
    </div>
  );
}
