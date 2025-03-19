import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


import icon001 from '../images/001.jpg';
import icon002 from '../images/002.jpg';
import icon003 from '../images/003.jpg';
import icon004 from '../images/004.jpg';
import icon005 from '../images/005.jpg';
import icon006 from '../images/006.jpg';
import './Ticker.css'; // ティッカー用のCSS

function Ticker() {
  // (省略：既存のコード)
}

const TopPage = () => {

  const navigate = useNavigate();
  const [showMore, setShowMore] = useState(false); // 他のボタンを表示するかどうか

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      {/* タイトル */}
      <div className="mb-4 text-center">
        <h1 className="text-5xl md:text-7xm font-bold text-blue-700">
          ショッピングクエスト(仮)
        </h1>
        {/* ティッカーをタイトル下に表示 */}
        <Ticker />
      </div>

      {/* メイン機能ボタン */}
      <div className="w-full max-w-md space-y-4 mt-8"> {/* ボタンとタイトルの間にスペースを追加 */}

        <button
          onClick={() => navigate('/app')}
          className="w-full py-6 text-3xl md:text-4xl font-bold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
        >
          🧳準備する🎁
        </button>
        <button
          onClick={() => navigate('/chat')}
          className="w-full py-6 text-3xl md:text-4xl font-bold text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors"
        >
          🎈買物にいく🚲
        </button>

        {/* 追加ボタン（表示切り替え） */}
        {showMore && (
          <>
            {/* 区切り線 */}
            <hr className="my-4 border-t-2 border-gray-300" />
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/Rank')}
                className="py-4 text-2xl md:text-3xl font-bold text-white bg-gray-400 rounded-lg hover:bg-gray-500 transition-colors"
              >
                🏆ランキング📝
              </button>
              <button
                onClick={() => navigate('/King')}
                className="py-4 text-2xl md:text-3xl font-bold text-white bg-gray-400 rounded-lg hover:bg-gray-500 transition-colors"
              >
                👂問い合わせ📞
              </button>
              <button
                onClick={() => navigate('/Recommend')}
                className="py-4 text-2xl md:text-3xl font-bold text-white bg-gray-400 rounded-lg hover:bg-gray-500 transition-colors"
              >
                👉おすすめ
              </button>
              <button
                onClick={() => navigate('/QuestRewardsAnimated')}
                className="py-4 text-2xl md:text-3xl font-bold text-white bg-gray-400 rounded-lg hover:bg-gray-500 transition-colors"
              >
                💎ごほうび👑
              </button>
              <button
          onClick={() => navigate('/Game')}
          className="py-4 text-2xl md:text-3xl font-bold text-white bg-gray-400 rounded-lg hover:bg-gray-500 transition-colors"
        >
          🎮暇つぶし
        </button>
        <button
          onClick={() => navigate('/album')}
          className="py-4 text-2xl md:text-3xl font-bold text-white bg-gray-400 rounded-lg hover:bg-gray-500 transition-colors"
        >
          📷写真
        </button>
        <button
          onClick={() => navigate('/ShoppingAssistant')}
          className="py-4 text-2xl md:text-3xl font-bold text-white bg-gray-400 rounded-lg hover:bg-gray-500 transition-colors"
        >
          🤖AI（？）
        </button>
        <button
          onClick={() =>
            window.open(
              'https://suzuri.jp/7DbpRihzKefprwx',
              '_blank',
              'width=800,height=600,noopener,noreferrer'
            )
          }
          className="py-4 text-2xl md:text-3xl font-bold text-white bg-gray-400 rounded-lg hover:bg-gray-500 transition-colors"
        >
          スペシャルショップ
        </button>




            </div>
          </>
        )}

        {/* 他のボタン表示切り替 え */}
        <button
          onClick={() => setShowMore(!showMore)}
          className="w-full py-4 text-2xl md:text-3xl font-bold text-white bg-gray-500 rounded-lg hover:bg-gray-600 transition-colors"
        >
          {showMore ? '他のボタンを隠す' : '他のボタンを表示'}
        </button>
      </div>
        <div className='pt-20'>Presented by AE✌N_ph</div>
        <div class="pt-5">
    <a href="https://docs.google.com/forms/d/e/1FAIpQLScov0Gi0gMe3SjM1ldgcJrfIltZSjm2iVaYdc7FLDD-Hc56ig/viewform?usp=dialog">
        辛口フィードバックはこちらへ
    </a>
</div>
      {/* 6人の丸いアイコンリンク */}
      <div className="mt-12 flex justify-around w-full max-w-md">
        <div className="cursor-pointer" onClick={() => window.open('https://x.com/shuyin02')}>
          <img src={icon001} alt="アイコン" className="w-16 h-16 rounded-full object-cover" />
        </div>
        <div className="cursor-pointer" onClick={() => window.open('https://x.com/okinakamasayos1')}>
          <img src={icon002} alt="アイコン" className="w-16 h-16 rounded-full object-cover" />
        </div>
        <div className="cursor-pointer" onClick={() => window.open('https://x.com/aya451778')}>
          <img src={icon003} alt="アイコン" className="w-16 h-16 rounded-full object-cover" />
        </div>
        <div className="cursor-pointer" onClick={() => window.open('https://x.com/YUI447486742018')}>
          <img src={icon004} alt="アイコン" className="w-16 h-16 rounded-full object-cover" />
        </div>
        <div className="cursor-pointer" onClick={() => window.open('https://x.com/isocchi1123')}>
          <img src={icon005} alt="アイコン" className="w-16 h-16 rounded-full object-cover" />
        </div>
        <div className="cursor-pointer" onClick={() => window.open('https://x.com/7DbpRihzKefprwx')}>
          <img src={icon006} alt="アイコン" className="w-16 h-16 rounded-full object-cover" />
        </div>
      </div>
    </div>
  );
}

export default TopPage;
