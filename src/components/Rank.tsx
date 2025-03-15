import React, { useState, useEffect } from 'react';

const Rank = () => {
  // ランキングデータ （週間、月間、全期間）
  const rankingData = {
    weekly: [
      { rank: 1, name: "田中さん", points: 95, achievement: "8回達成", streak: 7 },
      { rank: 2, name: "佐藤さん", points: 87, achievement: "7回達成", streak: 5 },
      { rank: 3, name: "鈴木さん", points: 82, achievement: "6回達成", streak: 4 },
      { rank: 4, name: "渡辺さん", points: 76, achievement: "5回達成", streak: 3 },
      { rank: 5, name: "あなた", points: 70, achievement: "4回達成", streak: 2 },
      { rank: 6, name: "山田さん", points: 65, achievement: "3回達成", streak: 1 },
      { rank: 7, name: "加藤さん", points: 62, achievement: "3回達成", streak: 0 },
    ],
    monthly: [
      { rank: 1, name: "佐藤さん", points: 210, achievement: "18回達成", streak: 12 },
      { rank: 2, name: "田中さん", points: 195, achievement: "16回達成", streak: 7 },
      { rank: 3, name: "あなた", points: 185, achievement: "15回達成", streak: 6 },
      { rank: 4, name: "鈴木さん", points: 172, achievement: "14回達成", streak: 4 },
      { rank: 5, name: "渡辺さん", points: 156, achievement: "12回達成", streak: 3 },
      { rank: 6, name: "山田さん", points: 145, achievement: "11回達成", streak: 2 },
      { rank: 7, name: "加藤さん", points: 132, achievement: "10回達成", streak: 0 },
    ],
    allTime: [
      { rank: 1, name: "佐藤さん", points: 530, achievement: "42回達成", streak: 12 },
      { rank: 2, name: "あなた", points: 485, achievement: "38回達成", streak: 6 },
      { rank: 3, name: "田中さん", points: 462, achievement: "36回達成", streak: 7 },
      { rank: 4, name: "鈴木さん", points: 421, achievement: "33回達成", streak: 4 },
      { rank: 5, name: "渡辺さん", points: 395, achievement: "31回達成", streak: 3 },
      { rank: 6, name: "山田さん", points: 378, achievement: "29回達成", streak: 2 },
      { rank: 7, name: "加藤さん", points: 341, achievement: "26回達成", streak: 0 },
    ]
  };
  
  // 状態管理
  const [currentPeriod, setCurrentPeriod] = useState('weekly');
  const [showDetail, setShowDetail] = useState(null);
  const [animatePoints, setAnimatePoints] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // タブのラベル
  const periodLabels = {
    weekly: '今週',
    monthly: '今月',
    allTime: '全期間'
  };
  
  // 表示するデータ
  const displayData = rankingData[currentPeriod];
  
  // メダル表示用の関数
  const getRankDisplay = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `${rank}`;
  };
  
  // ロード効果（1秒後に表示）
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);
  
  // 期間変更時にアニメーション
  useEffect(() => {
    setAnimatePoints(true);
    const timer = setTimeout(() => {
      setAnimatePoints(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [currentPeriod]);
  
  // 詳細表示切り替え
  const toggleDetail = (index) => {
    if (showDetail === index) {
      setShowDetail(null);
    } else {
      setShowDetail(index);
      
      // ユーザー自身の場合、おめでとうポップアップを表示
      if (displayData[index].name === "あなた") {
        setShowCongrats(true);
        setTimeout(() => {
          setShowCongrats(false);
        }, 2500);
      }
    }
  };
  
  // 期間切り替え
  const changePeriod = (period) => {
    setIsLoading(true);
    setShowDetail(null);
    setTimeout(() => {
      setCurrentPeriod(period);
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="bg-gray-100 min-h-screen pb-20">
      {/* ヘッダー */}
      <div className="bg-blue-600 p-6 text-white text-center rounded-b-3xl shadow-lg mb-4">
        <h1 className="text-4xl font-bold mb-1">お買い物ランキング</h1>
        <div className="flex justify-center space-x-6 mt-4">
          {Object.keys(periodLabels).map(period => (
            <button
              key={period}
              className={`px-6 py-3 rounded-full text-xl font-bold transition-all duration-300 
                ${currentPeriod === period 
                  ? 'bg-white text-blue-600 transform scale-110 border-2 border-white' 
                  : 'bg-blue-500 text-white'}`}
              onClick={() => changePeriod(period)}
            >
              {periodLabels[period]}
            </button>
          ))}
        </div>
      </div>
      
      {/* メインコンテンツ */}
      <div className="max-w-lg mx-auto px-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          </div>
        ) : (
          /* ランキングリスト */
          <div className="space-y-3 mb-6">
            {displayData.map((person, index) => (
              <div key={index}>
                <div 
                  className={`bg-white rounded-xl shadow-lg overflow-hidden
                    ${person.name === "あなた" ? 'border-4 border-yellow-400' : 'border border-gray-200'}
                    transform transition-all duration-300 
                    ${showDetail === index ? 'scale-105' : 'hover:scale-102'}`}
                  onClick={() => toggleDetail(index)}
                >
                  {/* 基本情報行 */}
                  <div className="flex items-center p-4">
                    {/* 順位 */}
                    <div className={`w-16 h-16 flex items-center justify-center rounded-full mr-4
                      ${person.rank <= 3 
                        ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-400' 
                        : 'bg-gray-100 text-gray-700 border border-gray-300'}`}
                    >
                      <span className="text-3xl font-bold">{getRankDisplay(person.rank)}</span>
                    </div>
                    
                    {/* 名前と達成回数 */}
                    <div className="flex-1">
                      <div className={`font-bold text-2xl ${person.name === "あなた" ? 'text-blue-600' : 'text-gray-800'}`}>
                        {person.name}
                      </div>
                      <div className="text-gray-600 text-lg">
                        {person.achievement}
                      </div>
                    </div>
                    
                    {/* 点数 - アニメーション効果付き */}
                    <div className="text-right">
                      <div 
                        className={`text-3xl font-bold text-blue-600 
                          ${animatePoints ? 'animate-bounce' : ''}`}
                      >
                        {person.points}
                        <span className="text-sm ml-1">点</span>
                      </div>
                      
                      {/* 展開インジケーター */}
                      <div className="text-blue-600 text-lg font-bold mt-1">
                        {showDetail === index ? '閉じる ▲' : '詳しく ▼'}
                      </div>
                    </div>
                  </div>
                  
                  {/* 詳細情報（クリックで表示） */}
                  {showDetail === index && (
                    <div className="bg-blue-50 p-5 border-t-2 border-blue-200 animate-fadeIn">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-bold mb-1 text-lg">連続達成:</p>
                          <p className="text-2xl">{person.streak}日間</p>
                        </div>
                        <div>
                          <p className="font-bold mb-1 text-lg">順位の変動:</p>
                          <p className="text-2xl text-green-600">↑ 2ランクアップ</p>
                        </div>
                        <div>
                          <p className="font-bold mb-1 text-lg">次の目標:</p>
                          <p className="text-2xl">{person.points + 10}点</p>
                        </div>
                      </div>
                      
                      {/* 応援メッセージ */}
                      <div className="mt-3 text-center">
                        <p className="text-blue-600 font-bold text-xl">
                          {person.name === "あなた" 
                            ? "がんばっています！あと少しで上位に！" 
                            : `${person.name}も頑張っています！`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* おめでとうポップアップ */}
        {showCongrats && (
          <div className="fixed inset-0 flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl p-8 shadow-2xl border-6 border-yellow-400 max-w-sm mx-4 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-3xl font-bold text-blue-600 mb-3">
                おめでとうございます！
              </h3>
              <p className="text-2xl mb-6">
                先週より2ランクアップしました！
              </p>
              <button 
                className="bg-blue-500 text-white py-3 px-8 rounded-full text-2xl font-bold"
                onClick={() => setShowCongrats(false)}
              >
                とじる
              </button>
            </div>
          </div>
        )}
        
        {/* 説明パネル */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow transform transition-all duration-300 hover:shadow-lg">
          <h3 className="text-2xl font-bold mb-3 text-gray-800">点数のもらいかた</h3>
          <ul className="space-y-2">
            <li className="flex items-start mb-3">
              <span className="text-green-500 mr-3 text-2xl">•</span>
              <span className="text-xl">買い物リスト完了: <strong>10点</strong></span>
            </li>
            <li className="flex items-start mb-3">
              <span className="text-green-500 mr-3 text-2xl">•</span>
              <span className="text-xl">予定時間内に完了: <strong>5点</strong></span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-3 text-2xl">•</span>
              <span className="text-xl">連続達成ボーナス: <strong>2点×日数</strong></span>
            </li>
          </ul>
        </div>
      </div>
      
      {/* 下部ボタン */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-300">
        <div className="max-w-lg mx-auto grid grid-cols-2 gap-4">
          <button 
            className="bg-gray-200 rounded-full py-4 text-2xl font-bold text-gray-800 transform transition-all duration-300 hover:bg-gray-300 active:scale-95 shadow-md"
          >
            もどる
          </button>
          <button 
            className="bg-green-500 rounded-full py-4 text-2xl font-bold text-white transform transition-all duration-300 hover:bg-green-600 active:scale-95 shadow-md"
          >
            友達を誘う
          </button>
        </div>
      </div>
    </div>
  );
};

export default Rank;