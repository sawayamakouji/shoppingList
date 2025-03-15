import React, { useState, useEffect } from 'react';
import { Trophy, Star, Gift, Calendar, CheckCircle, Clock, Heart, Sparkles, Award, Users } from 'lucide-react';

const QuestRewardsAnimated = () => {
  const [showCelebration, setShowCelebration] = useState(true);
  const [isConfettiActive, setIsConfettiActive] = useState(true);
  const [achievements, setAchievements] = useState([
    { id: 1, name: '初めてのおつかい', description: '最初の買い物を達成', completed: true, dateCompleted: '2025-03-10', points: 100 },
    { id: 2, name: '週間ミッション', description: '週3回の買い物を達成', completed: true, dateCompleted: '2025-03-14', points: 150 },
    { id: 3, name: '特売マスター', description: '特売品を5つ購入', completed: false, progress: 3, total: 5, points: 200 },
    { id: 4, name: '献立お助け', description: '献立提案の材料をすべて購入', completed: true, dateCompleted: '2025-03-07', points: 250 },
    { id: 5, name: '節約の達人', description: '3000円以上お得に買い物', completed: false, progress: 2100, total: 3000, points: 300 }
  ]);
  
  const [rewards, setRewards] = useState([
    { id: 1, name: 'デジタルフォトフレーム', points: 500, redeemed: false, image: '/api/placeholder/100/100', description: '思い出の写真をスライドショーで表示' },
    { id: 2, name: 'お孫さんからのビデオメッセージ', points: 300, redeemed: false, image: '/api/placeholder/100/100', description: 'がんばったご褒美に特別なメッセージ' },
    { id: 3, name: '家族での食事会クーポン', points: 1000, redeemed: false, image: '/api/placeholder/100/100', description: '家族全員でのお食事会に使えます' },
    { id: 4, name: 'お好きなお茶セット', points: 400, redeemed: true, image: '/api/placeholder/100/100', description: '厳選されたお茶の詰め合わせ' },
    { id: 5, name: '金の入れ歯（特別限定版）', points: 2000, redeemed: false, image: '/api/placeholder/100/100', description: '噛む力が2倍！冗談ですが、リアルな金色の入れ歯型キャンディー' }
  ]);
  
  const [totalPoints, setTotalPoints] = useState(750);
  const [displayedPoints, setDisplayedPoints] = useState(650);
  const [level, setLevel] = useState(3);
  const [questStreak, setQuestStreak] = useState(5); // 連続達成日数
  const [selectedTab, setSelectedTab] = useState('rewards');
  const [activeReward, setActiveReward] = useState(null);
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);
  const [expandedAchievement, setExpandedAchievement] = useState(null);
  
  // 音声読み上げ機能
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      // 既存の音声を停止
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.8; 
      utterance.pitch = 1;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
    }
  };
  
  // 音声停止機能
  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };
  
  // ポイントカウントアップアニメーション
  useEffect(() => {
    if (showCelebration && displayedPoints < totalPoints) {
      const timer = setTimeout(() => {
        setDisplayedPoints(prev => Math.min(prev + 5, totalPoints));
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [displayedPoints, totalPoints, showCelebration]);
  
  // ウェルカムメッセージ
  useEffect(() => {
    if (showCelebration) {
      setTimeout(() => {
        speakText('おめでとうございます！おつかいクエストを達成しました。ポイントが増えましたよ。');
      }, 1000);
      
      // 紙吹雪アニメーションの自動終了
      const confettiTimer = setTimeout(() => {
        setIsConfettiActive(false);
      }, 6000);
      
      return () => clearTimeout(confettiTimer);
    }
  }, [showCelebration]);
  
  // 実績の詳細表示を切り替え
  const toggleAchievementDetails = (id) => {
    if (expandedAchievement === id) {
      setExpandedAchievement(null);
    } else {
      setExpandedAchievement(id);
      
      // 該当する実績情報を音声で読み上げ
      const achievement = achievements.find(a => a.id === id);
      if (achievement) {
        const status = achievement.completed ? 
          `達成済みです。${achievement.points}ポイント獲得しました。` : 
          `現在の進捗は${achievement.progress}/${achievement.total}です。`;
        
        speakText(`${achievement.name}。${achievement.description}。${status}`);
      }
    }
  };
  
  // 報酬を獲得
  const redeemReward = (rewardId) => {
    const reward = rewards.find(r => r.id === rewardId);
    
    if (reward && !reward.redeemed && totalPoints >= reward.points) {
      setActiveReward(reward);
      setShowRewardAnimation(true);
      
      // 音声フィードバック
      speakText(`${reward.name}を獲得しました！おめでとうございます。`);
      
      // アニメーション完了後に報酬を更新
      setTimeout(() => {
        // ポイントを減らし、報酬を獲得済みにする
        setTotalPoints(totalPoints - reward.points);
        
        const updatedRewards = rewards.map(r => 
          r.id === rewardId ? { ...r, redeemed: true } : r
        );
        
        setRewards(updatedRewards);
        setShowRewardAnimation(false);
      }, 3000);
    } else if (reward && reward.redeemed) {
      speakText('この報酬はすでに獲得済みです。');
    } else {
      speakText('ポイントが足りません。もう少し買い物クエストを達成しましょう。');
    }
  };
  
  // パーセンテージ計算
  const calculateProgress = (current, total) => {
    return Math.min(Math.round((current / total) * 100), 100);
  };
  
  // 紙吹雪アニメーション用のドット生成
  const renderConfetti = () => {
    if (!isConfettiActive) return null;
    
    const confettiElements = [];
    const colors = ['#FFC107', '#E91E63', '#2196F3', '#4CAF50', '#9C27B0'];
    
    for (let i = 0; i < 50; i++) {
      const left = Math.random() * 100;
      const animationDuration = 3 + Math.random() * 3;
      const size = 5 + Math.random() * 10;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      confettiElements.push(
        <div
          key={i}
          className="absolute animate-confetti"
          style={{
            left: `${left}%`,
            top: '-10px',
            width: `${size}px`,
            height: `${size}px`,
            backgroundColor: color,
            borderRadius: '50%',
            animation: `confetti ${animationDuration}s ease-out forwards`,
          }}
        />
      );
    }
    
    return confettiElements;
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-yellow-50 rounded-lg shadow text-lg relative overflow-hidden">
      {/* 紙吹雪アニメーション */}
      {renderConfetti()}
      
      {/* アニメーション用のスタイル */}
      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes shine {
          0% {
            background-position: -100px;
          }
          100% {
            background-position: 200px;
          }
        }
        
        .animate-pulse-custom {
          animation: pulse 2s infinite;
        }
        
        .animate-bounce-custom {
          animation: bounce 1s infinite;
        }
        
        .animate-confetti {
          position: absolute;
        }
        
        .shimmer {
          background: linear-gradient(to right, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%);
          background-size: 200px 100%;
          animation: shine 2s infinite;
        }
      `}</style>
      
      {/* 音声停止ボタン */}
      <div className="fixed top-4 right-4 z-50">
        <button 
          className="bg-red-600 text-white p-4 rounded-full shadow-lg border-2 border-red-700"
          onClick={stopSpeaking}
          aria-label="音声を停止する"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
        </button>
      </div>
      
      {/* お祝い画面（初期表示時のみ） */}
      {showCelebration && (
        <div className="fixed inset-0 flex items-center justify-center z-40 bg-black bg-opacity-70">
          <div className="bg-white p-8 rounded-lg text-center max-w-sm relative animate-pulse-custom">
            <button 
              className="absolute top-2 right-2 text-gray-500"
              onClick={() => setShowCelebration(false)}
            >
              ✕
            </button>
            
            <div className="mb-4">
              <Trophy size={80} className="mx-auto text-yellow-500 animate-bounce-custom" />
            </div>
            
            <h2 className="text-3xl font-bold mb-3 text-blue-700">
              おめでとうございます！
            </h2>
            
            <p className="text-xl mb-4">
              今日のおつかいクエストを達成しました！
            </p>
            
            <div className="mb-4 p-3 bg-yellow-100 rounded-lg border-2 border-yellow-400 relative overflow-hidden">
              <div className="absolute inset-0 shimmer"></div>
              <Star size={24} className="inline-block mr-2 text-yellow-500" />
              <span className="text-2xl font-bold">+{displayedPoints - 650}ポイント獲得！</span>
            </div>
            
            <button
              className="w-full bg-blue-600 text-white text-xl p-4 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
              onClick={() => setShowCelebration(false)}
            >
              報酬を確認する
            </button>
          </div>
        </div>
      )}
      
      {/* 報酬獲得アニメーション */}
      {showRewardAnimation && activeReward && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80">
          <div className="p-8 rounded-lg text-center max-w-sm">
            <div className="mb-6">
              <img 
                src={activeReward.image} 
                alt={activeReward.name} 
                className="w-32 h-32 mx-auto rounded-lg object-cover border-4 border-yellow-400 animate-bounce-custom"
              />
            </div>
            
            <h2 className="text-3xl font-bold mb-3 text-white">
              {activeReward.name}を獲得！
            </h2>
            
            <div className="mb-6">
              <Sparkles size={100} className="mx-auto text-yellow-400" />
            </div>
            
            <p className="text-xl mb-6 text-white">
              {activeReward.description}
            </p>
            
            <div className="text-white text-2xl animate-pulse-custom">
              <span>ポイントを使用: -{activeReward.points}P</span>
            </div>
          </div>
        </div>
      )}
    
      {/* ページヘッダー */}
      <div className="mb-6 text-center bg-blue-600 text-white p-4 rounded-lg shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-500 opacity-50 shining-bg"></div>
        <h1 className="text-3xl font-bold mb-2 relative z-10">おつかいクエスト</h1>
        <p className="text-xl relative z-10">ご褒美と達成記録</p>
      </div>
      
      {/* プレイヤー情報 */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-lg border-2 border-blue-400 transform transition-all hover:scale-105 duration-300">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold">おじいちゃんレベル {level}</h2>
          <div className="flex items-center">
            <Star size={24} className="text-yellow-500 mr-1 animate-pulse-custom" />
            <span className="text-2xl font-bold">{totalPoints} ポイント</span>
          </div>
        </div>
        
        <div className="h-4 bg-gray-200 rounded-full mb-2 overflow-hidden">
          <div 
            className="h-4 bg-blue-500 rounded-full relative"
            style={{ width: `${(level % 1) * 100}%` }}
          >
            <div className="absolute inset-0 shimmer"></div>
          </div>
        </div>
        
        <div className="flex justify-between text-sm text-gray-600">
          <span>レベル {level}</span>
          <span>レベル {level+1}</span>
        </div>
        
        <div className="mt-3 flex items-center">
          <Clock size={20} className="text-red-500 mr-2" />
          <span className="text-lg">{questStreak}日連続クエスト達成中！</span>
        </div>
      </div>
      
      {/* タブナビゲーション */}
      <div className="mb-6 grid grid-cols-3 gap-2">
        <button
          className={`p-3 text-lg font-bold rounded-t-lg transition-colors ${
            selectedTab === 'rewards' ? 'bg-green-600 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setSelectedTab('rewards')}
        >
          ご褒美
        </button>
        <button
          className={`p-3 text-lg font-bold rounded-t-lg transition-colors ${
            selectedTab === 'achievements' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setSelectedTab('achievements')}
        >
          実績
        </button>
        <button
          className={`p-3 text-lg font-bold rounded-t-lg transition-colors ${
            selectedTab === 'ranking' ? 'bg-purple-600 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setSelectedTab('ranking')}
        >
          ランキング
        </button>
      </div>
      
      {/* コンテンツエリア */}
      <div className="mb-6">
        {/* 獲得可能な報酬 */}
        {selectedTab === 'rewards' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Gift className="mr-2 text-green-600" size={28} />
              獲得できるご褒美
            </h2>
            
            <div className="space-y-4">
              {rewards.map((reward) => (
                <div 
                  key={reward.id} 
                  className={`bg-white p-4 rounded-lg shadow border-2 transform transition-all duration-300 hover:shadow-lg ${
                    reward.redeemed ? 'border-gray-300 opacity-75' : 'border-green-400 hover:scale-102'
                  }`}
                >
                  <div className="flex">
                    <div className="flex-shrink-0 mr-3">
                      <img src={reward.image} alt={reward.name} className="w-16 h-16 rounded-lg object-cover" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-xl font-bold">{reward.name}</h3>
                      <p className="text-gray-600">{reward.description}</p>
                      <div className="flex items-center mt-1">
                        <Star size={18} className="text-yellow-500 mr-1" />
                        <span className="font-bold">{reward.points} ポイント</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    {reward.redeemed ? (
                      <button
                        className="w-full bg-gray-400 text-white text-lg p-2 rounded-lg"
                        disabled
                      >
                        獲得済み
                      </button>
                    ) : (
                      <button
                        className={`w-full text-lg p-2 rounded-lg transition-all ${
                          totalPoints >= reward.points 
                            ? 'bg-green-600 text-white hover:bg-green-700 transform hover:scale-105' 
                            : 'bg-gray-200 text-gray-600'
                        }`}
                        onClick={() => redeemReward(reward.id)}
                        disabled={totalPoints < reward.points}
                      >
                        {totalPoints >= reward.points ? '獲得する' : 'ポイント不足'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 実績リスト */}
        {selectedTab === 'achievements' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Award className="mr-2 text-blue-600" size={28} />
              達成した実績
            </h2>
            
            <div className="space-y-4">
              {achievements.map((achievement) => (
                <div 
                  key={achievement.id} 
                  className={`bg-white p-4 rounded-lg shadow-md border-l-4 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    achievement.completed ? 'border-green-500' : 'border-yellow-500'
                  } ${expandedAchievement === achievement.id ? 'ring-2 ring-blue-400' : ''}`}
                  onClick={() => toggleAchievementDetails(achievement.id)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">{achievement.name}</h3>
                    <div className="flex items-center">
                      <Star size={18} className={`text-yellow-500 mr-1 ${achievement.completed ? 'animate-spin-slow' : ''}`} />
                      <span>{achievement.points}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600">{achievement.description}</p>
                  
                  {/* 展開/折りたたみアニメーション対応 */}
                  <div className={`overflow-hidden transition-all duration-300 ${
                    expandedAchievement === achievement.id ? 'max-h-48 mt-3' : 'max-h-0'
                  }`}>
                    {achievement.completed ? (
                      <div className="flex items-center text-green-600 bg-green-50 p-3 rounded-lg">
                        <CheckCircle size={18} className="mr-1" />
                        <span>{achievement.dateCompleted ? `達成日: ${new Date(achievement.dateCompleted).toLocaleDateString('ja-JP')}` : '達成済み'}</span>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <div className="flex justify-between mb-1 text-sm">
                          <span>進捗: {achievement.progress}/{achievement.total}</span>
                          <span>{calculateProgress(achievement.progress, achievement.total)}%</span>
                        </div>
                        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-4 bg-yellow-500 rounded-full relative"
                            style={{ 
                              width: `${calculateProgress(achievement.progress, achievement.total)}%`,
                              transition: 'width 1s ease-in-out'
                            }}
                          >
                            <div className="absolute inset-0 shimmer"></div>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          残り {achievement.total - achievement.progress} で達成！
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {achievement.completed ? (
                    <div className="mt-2 flex items-center text-green-600">
                      <CheckCircle size={18} className="mr-1" />
                      <span>達成済み</span>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <div className="flex justify-between mb-1 text-sm">
                        <span>進捗: {achievement.progress}/{achievement.total}</span>
                        <span>{calculateProgress(achievement.progress, achievement.total)}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-2 bg-yellow-500 rounded-full"
                          style={{ width: `${calculateProgress(achievement.progress, achievement.total)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* ランキング */}
        {selectedTab === 'ranking' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Users className="mr-2 text-purple-600" size={28} />
              ご近所ランキング
            </h2>
            
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-4 bg-blue-100 border-b border-blue-200 transition-all duration-300 hover:bg-blue-200">
                <div className="flex items-center">
                  <div className="w-8 text-center font-bold">3</div>
                  <div className="ml-3 flex-grow">
                    <div className="font-bold">鈴木さん</div>
                    <div className="text-sm text-gray-600">レベル 4 - 950ポイント</div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-yellow-100 border-b border-yellow-200 relative transform transition-all duration-500 hover:scale-105">
                <div className="absolute left-0 top-0 h-full w-1 bg-purple-500 animate-pulse-custom"></div>
                <div className="flex items-center">
                  <div className="w-8 text-center font-bold text-xl">2</div>
                  <div className="ml-3 flex-grow">
                    <div className="font-bold">あなた</div>
                    <div className="text-sm text-gray-600">レベル 3 - {totalPoints}ポイント</div>
                  </div>
                  <div>
                    <Heart className="text-red-500 animate-pulse-custom" size={24} />
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-blue-100 relative transition-all duration-300 hover:bg-blue-200">
                <div className="flex items-center">
                  <div className="w-8 text-center font-bold">1</div>
                  <div className="ml-3 flex-grow">
                    <div className="font-bold">田中さん</div>
                    <div className="text-sm text-gray-600">レベル 5 - 1200ポイント</div>
                  </div>
                  <div className="relative">
                    <Trophy className="text-yellow-500" size={24} />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full animate-ping"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* ランキング変動アニメーション説明 */}
            <div className="mt-4 p-3 bg-purple-100 rounded-lg border border-purple-300 text-sm">
              <p>あと250ポイントで1位になれます！</p>
              <p className="mt-1">次回のおつかいで順位が上がるかも？</p>
            </div>
          </div>
        )}
      </div>
      
      {/* ナビゲーションボタン */}
      <div className="mt-8 grid grid-cols-2 gap-4">
        <button
          className="bg-green-600 text-white text-xl p-4 rounded-lg shadow-lg transform transition-all duration-300 hover:bg-green-700 hover:scale-105 active:scale-95"
          onClick={() => {
            speakText('買い物リストに戻ります');
            // 実際のアプリでは画面遷移処理を実装
          }}
        >
          買い物リストへ
        </button>
        
        <button
          className="bg-blue-600 text-white text-xl p-4 rounded-lg shadow-lg transform transition-all duration-300 hover:bg-blue-700 hover:scale-105 active:scale-95"
          onClick={() => {
            speakText('次のクエストを探しに行きましょう');
            // 実際のアプリでは画面遷移処理を実装
          }}
        >
          次のクエスト
        </button>
      </div>
      
      <div className="h-24"></div> {/* 下部ナビゲーション用の余白 */}
    </div>
  );
};

export default QuestRewardsAnimated;