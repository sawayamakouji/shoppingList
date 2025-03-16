import React from 'react';
import { Link } from 'react-router-dom';

// ここでは Game02.tsx, Game03.tsx, Game04.tsx に対応するルートパスを設定してる前提
const miniGames = [
  { id: 1, title: '脳トレパズル', path: '/Game02' },
  { id: 2, title: '記憶力ゲーム', path: '/Game03' },
  { id: 3, title: 'タイピングチャレンジ', path: '/Game04' },
];

const MiniGamesLinks = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      {/* タイトルに animate-pulse を追加して、ゆっくり光る動きを出す */}
      <h2 className="text-4xl font-bold text-gray-800 mb-8 animate-pulse">
        ミニゲームリンク集
      </h2>

      {/* ボタン一覧 */}
      <div className="w-full max-w-sm mx-auto flex flex-col space-y-4">
        {miniGames.map((game, index) => {
          // 色のパターンを複数用意して、数が増えたらループで使い回す
          const colors = [
            'bg-blue-500 hover:bg-blue-600',
            'bg-green-500 hover:bg-green-600',
            'bg-pink-500 hover:bg-pink-600',
            'bg-yellow-500 hover:bg-yellow-600',
            'bg-purple-500 hover:bg-purple-600',
          ];
          // ゲームの数に合わせて色を切り替える
          const colorClass = colors[index % colors.length];

          return (
            <Link
              key={game.id}
              to={game.path}
              className={`
                ${colorClass}
                text-white font-semibold py-3 px-6
                rounded-md text-center shadow-md
                transition-colors duration-200 text-xl
              `}
            >
              {game.title}
            </Link>
          );
        })}
      </div>

      {/* トップページに戻るボタン */}
      <div className="mt-8">
        <Link
          to="/TopPage" // TopPage.tsx のルートパスに合わせる
          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded shadow transition-colors text-xl"
        >
          トップページに戻る
        </Link>
      </div>
    </div>
  );
};

export default MiniGamesLinks;
