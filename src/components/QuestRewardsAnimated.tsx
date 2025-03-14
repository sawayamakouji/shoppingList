import React, { useState, useEffect } from 'react';
import { Trophy, Star, Sparkles } from 'lucide-react';

const QuestRewardsAnimated = () => {
  const [showCelebration, setShowCelebration] = useState(true);
  const [isConfettiActive, setIsConfettiActive] = useState(true);
  const [totalPoints, setTotalPoints] = useState(750);
  const [displayedPoints, setDisplayedPoints] = useState(650);
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);
  const [activeReward, setActiveReward] = useState(null);
  
  useEffect(() => {
    if (showCelebration && displayedPoints < totalPoints) {
      const timer = setTimeout(() => {
        setDisplayedPoints(prev => Math.min(prev + 5, totalPoints));
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [displayedPoints, totalPoints, showCelebration]);

  useEffect(() => {
    if (showCelebration) {
      setTimeout(() => {
        setIsConfettiActive(false);
      }, 6000);
    }
  }, [showCelebration]);

  const redeemReward = (reward) => {
    if (totalPoints >= reward.points) {
      setActiveReward(reward);
      setShowRewardAnimation(true);
      setTimeout(() => {
        setTotalPoints(totalPoints - reward.points);
        setShowRewardAnimation(false);
      }, 3000);
    }
  };

  const rewards = [
    { id: 1, name: 'デジタルフォトフレーム', points: 500 },
    { id: 2, name: 'お孫さんからのビデオメッセージ', points: 300 },
    { id: 3, name: '家族での食事会クーポン', points: 1000 }
  ];

  return (
    <div className="max-w-md mx-auto p-6 bg-yellow-50 rounded-lg shadow text-lg relative overflow-hidden">
      {showCelebration && (
        <div className="fixed inset-0 flex items-center justify-center z-40 bg-black bg-opacity-70">
          <div className="bg-white p-8 rounded-lg text-center max-w-sm">
            <Trophy size={80} className="mx-auto text-yellow-500" />
            <h2 className="text-3xl font-bold mb-3 text-blue-700">おめでとうございます！</h2>
            <p className="text-xl mb-4">今日のおつかいクエストを達成しました！</p>
            <div className="mb-4 p-3 bg-yellow-100 rounded-lg border-2 border-yellow-400">
              <Star size={24} className="inline-block mr-2 text-yellow-500" />
              <span className="text-2xl font-bold">+100ポイント獲得！</span>
            </div>
            <button
              className="w-full bg-blue-600 text-white text-xl p-4 rounded-lg shadow-lg hover:bg-blue-700"
              onClick={() => setShowCelebration(false)}
            >
              報酬を確認する
            </button>
          </div>
        </div>
      )}
      {showRewardAnimation && activeReward && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80">
          <div className="p-8 rounded-lg text-center max-w-sm bg-white shadow-lg">
            <Sparkles size={100} className="mx-auto text-yellow-400" />
            <h2 className="text-3xl font-bold mb-3">{activeReward.name}を獲得！</h2>
            <p className="text-xl mb-6">ポイントを使用: -{activeReward.points}P</p>
          </div>
        </div>
      )}
      <div className="mb-6 text-center bg-blue-600 text-white p-4 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-2">おつかいクエスト</h1>
      </div>
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">報酬一覧</h2>
        {rewards.map(reward => (
          <button
            key={reward.id}
            className="w-full py-4 text-xl font-bold text-white bg-green-500 rounded-lg hover:bg-green-600 mb-2"
            onClick={() => redeemReward(reward)}
          >
            {reward.name} - {reward.points}P
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuestRewardsAnimated;
