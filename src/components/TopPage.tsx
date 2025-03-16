import React, { useEffect, useRef } from 'react'; // useEffectとuseRefをインポート
import { useNavigate } from 'react-router-dom';
import icon001 from '../images/001.jpg';
import icon002 from '../images/002.jpg';
import icon003 from '../images/003.jpg';
import icon004 from '../images/004.jpg';
import icon005 from '../images/005.jpg';
import icon006 from '../images/006.jpg';
import './Ticker.css'; // ティッカー用のCSS

function Ticker() {
  const messages = [
    "ようこそ！本日の笑いとお得情報をお届けします！",
    "速報：今夜はハンバーグにしませんか？牛豚あいびきミンチセール中",
    "限定情報：新商品 果汁たっぷりグミ ゴーヤ味！",
    "ニュース：○○高校甲子園進出決定！",
    "健康速報：早寝早起き！",
    "イベント案内：地域のお祭りで試食会開催！",
    "注目：4月のアルミニウム先物市場 8%アップ！",
    "本日の運勢：7月生まれさん 運勢アップ！",
    "ニュース：稲多町の山本武三さん フルマラソン2時間切り！",
    "速報：店の周り雨降っています！",
    "読んだ？読んでる？暇なの？ねえ、暇なの？？"
  ];
  const text = messages.join(" ★✌★ ");
  const tickerRef = useRef<HTMLDivElement>(null); // useRefに型を指定

  useEffect(() => {
    if (tickerRef.current) {
      const containerWidth = tickerRef.current.parentElement.offsetWidth; // コンテナの幅（200pxまたは180px）
      const textWidth = tickerRef.current.scrollWidth; // テキストの実際の幅
      const translateDistance = textWidth + containerWidth; // テキスト全体が隠れるまでの距離

      // 移動距離をCSSカスタムプロパティとして設定
      tickerRef.current.style.setProperty('--translate-distance', `-${translateDistance}px`);
      console.log('Container Width:', containerWidth);
      console.log('Text Width:', textWidth);
      console.log('Translate Distance:', translateDistance);
    }
  }, []);

  return (
    <div className="ticker-container">
      <div
        className="ticker-text"
        ref={tickerRef}
        style={{ animation: `scroll 60s linear infinite` }} // アニメーション時間を60秒に延長
      >
        {text}
      </div>
    </div>
  );
}

export function TopPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      {/* タイトル */}
      <div className="mb-4 text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-blue-700">
          ショッピンぐクエスト
        </h1>
        {/* ティッカーをタイトル下に表示 */}
        <Ticker />
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