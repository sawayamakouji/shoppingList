// src/components/TopPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

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
          準備する
        </button>
        <button
          onClick={() => navigate('/shopping')}
          className="w-full py-4 text-2xl md:text-3xl font-bold text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors"
        >
          買物にいく
        </button>
        <button
          onClick={() => navigate('/contact')}
          className="w-full py-4 text-2xl md:text-3xl font-bold text-white bg-purple-500 rounded-lg hover:bg-purple-600 transition-colors"
        >
          問い合わせ
        </button>
        <button
          onClick={() => navigate('/ranking')}
          className="w-full py-4 text-2xl md:text-3xl font-bold text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors"
        >
          ランキング
        </button>
        <button
          onClick={() =>
            window.location.assign(
              'https://claude.site/artifacts/3e36b5c9-a8d6-4159-8fab-5cfaf675ffd1'
            )
          }
          className="w-full py-4 text-2xl md:text-3xl font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
        >
          おすすめ
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
          onClick={() => window.location.assign(
            'https://claude.site/artifacts/bdea9bca-7f5a-402f-aa24-9499269a5a6e'
          )
        }
          className="w-full py-4 text-2xl md:text-3xl font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
        >
          暇つぶし
        </button>
      </div>
    </div>
  );
}
