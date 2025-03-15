// src/components/MiniGameLinks.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Game: React.FC = () => {
  const navigate = useNavigate();

  // ミニゲームのリンク集（各リンクはダミーURLになってるから適宜変更してや）
  const miniGames = [
    { id: 1, title: '脳トレパズル', url: 'https://example.com/game1' },
    { id: 2, title: '記憶力ゲーム', url: 'https://example.com/game2' },
    { id: 3, title: 'タイピングチャレンジ', url: 'https://example.com/game3' },
    { id: 4, title: '計算トレーニング', url: 'https://example.com/game4' },
    { id: 5, title: '色合わせゲーム', url: 'https://example.com/game5' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-5xl font-bold mb-8 text-blue-700">ミニゲームリンク集</h1>
      <div className="w-full max-w-md space-y-4">
        {miniGames.map((game) => (
          <a
            key={game.id}
            href={game.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center py-4 text-2xl font-bold text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors"
          >
            {game.title}
          </a>
        ))}
      </div>
      <button
        onClick={() => navigate('/')}
        className="mt-12 px-6 py-4 text-2xl font-bold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
      >
        TOPページに戻る
      </button>
    </div>
  );
};

export default Game ;
