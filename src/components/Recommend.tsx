import React, { useState, useEffect } from 'react';
import { Clock, ShoppingBag, Check, Plus, Volume2, Calendar, TrendingUp } from 'lucide-react';

const Recommend = () => {
  // 購入履歴データ（実際のアプリではデータベースから取得）
  const [purchaseHistory, setPurchaseHistory] = useState([
    { 
      id: 1, 
      name: '洗剤', 
      lastPurchased: '2025-03-01', 
      frequency: 14, // 平均購入間隔（日）
      image: '/api/placeholder/80/80',
      category: '日用品',
      urgency: 'high' // high, medium, low
    },
    { 
      id: 2, 
      name: 'トイレットペーパー', 
      lastPurchased: '2025-03-05', 
      frequency: 21,
      image: '/api/placeholder/80/80',
      category: '日用品',
      urgency: 'medium'
    },
    { 
      id: 3, 
      name: '牛乳', 
      lastPurchased: '2025-03-10', 
      frequency: 5,
      image: '/api/placeholder/80/80',
      category: '食品',
      urgency: 'high'
    },
    { 
      id: 4, 
      name: 'シャンプー', 
      lastPurchased: '2025-02-20', 
      frequency: 30,
      image: '/api/placeholder/80/80',
      category: '日用品',
      urgency: 'high'
    },
    { 
      id: 5, 
      name: 'お米', 
      lastPurchased: '2025-03-01', 
      frequency: 30,
      image: '/api/placeholder/80/80',
      category: '食品',
      urgency: 'medium'
    }
  ]);
  
  const [shoppingList, setShoppingList] = useState([]);
  const [suggestedItems, setSuggestedItems] = useState([]);
  const [filter, setFilter] = useState('all'); // all, urgent, food, daily
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // 現在日付
  const today = new Date();
  
  // 音声読み上げ機能
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      // 既存の音声を停止
      window.speechSynthesis.cancel();
      
      setIsSpeaking(true);
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.8; // よりゆっくり
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      window.speechSynthesis.speak(utterance);
    }
  };
  
  // 音声停止機能
  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };
  
  // 日付間の日数計算
  const daysBetween = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
  };
  
  // 日付をフォーマット
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };
  
  // 提案商品をリストに追加
  const addToShoppingList = (item) => {
    if (!shoppingList.some(i => i.id === item.id)) {
      setShoppingList([...shoppingList, item]);
      
      // 音声フィードバック
      speakText(`${item.name}を買い物リストに追加しました`);
      
      // 提案リストから削除（または非表示）
      setSuggestedItems(suggestedItems.filter(i => i.id !== item.id));
    }
  };
  
  // 購入履歴から提案商品を計算
  useEffect(() => {
    const calculateSuggestions = () => {
      const suggestions = purchaseHistory
        .map(item => {
          const daysSinceLastPurchase = daysBetween(item.lastPurchased, today.toISOString().split('T')[0]);
          const daysUntilEmpty = item.frequency - daysSinceLastPurchase;
          
          return {
            ...item,
            daysSinceLastPurchase,
            daysUntilEmpty
          };
        })
        .filter(item => {
          // フィルター適用
          if (filter === 'urgent') return item.urgency === 'high';
          if (filter === 'food') return item.category === '食品' || item.category === '調味料';
          if (filter === 'daily') return item.category === '日用品';
          return true;
        })
        .sort((a, b) => a.daysUntilEmpty - b.daysUntilEmpty);
      
      setSuggestedItems(suggestions);
    };
    
    calculateSuggestions();
  }, [purchaseHistory, filter]);
  
  // ウェルカムメッセージ
  useEffect(() => {
    const timer = setTimeout(() => {
      if (suggestedItems.length > 0) {
        speakText(`こんにちは、そろそろ買い替え時の商品があります。${suggestedItems.length}個の商品を提案しています。`);
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [suggestedItems]);

  return (
    <div className="max-w-md mx-auto p-6 bg-yellow-50 rounded-lg shadow text-2xl">
      {/* ヘッダー - 機能的でシンプルなデザイン */}
      <div className="mb-8 text-center bg-white border-4 border-red-600 p-4 rounded-lg shadow-lg">
        <h1 className="text-5xl font-bold mb-3 text-red-700">そろそろ買い替え時</h1>
        <p className="text-3xl">お買い忘れにご注意！</p>
      </div>
      
      {/* 音声停止ボタン - 常に画面上部に固定表示 */}
      <div className={`fixed top-4 right-4 z-50 transition-opacity duration-300 ${isSpeaking ? 'opacity-100' : 'opacity-50'}`}>
        <button 
          className="bg-red-600 text-white p-4 rounded-full shadow-lg border-2 border-red-700 flex items-center"
          onClick={stopSpeaking}
          aria-label="音声を停止する"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          {isSpeaking && (
            <span className="ml-2 text-xl font-bold">停止</span>
          )}
        </button>
      </div>
      
      {/* ヘルプボタン */}
      <div className="mb-6 text-center">
        <button 
          className="bg-blue-600 text-white text-2xl p-5 rounded-full w-full shadow-lg border-2 border-blue-700"
          onClick={() => {
            setIsHelpVisible(!isHelpVisible);
            if (!isHelpVisible) {
              speakText('このページでは、そろそろ切れそうな商品を表示しています。赤いものから先に買い物をしましょう。');
            }
          }}
        >
          使い方を見る / 聞く
        </button>
        
        {isHelpVisible && (
          <div className="mt-4 p-6 bg-white border-4 border-blue-500 rounded-lg text-left">
            <h3 className="text-3xl font-bold mb-4">このページの使い方</h3>
            <ul className="space-y-4">
              <li className="text-xl flex items-center">
                <span className="inline-block w-4 h-4 bg-red-600 mr-3 rounded-full"></span>
                赤い枠の商品は、すぐに買い替えが必要です
              </li>
              <li className="text-xl flex items-center">
                <span className="inline-block w-4 h-4 bg-yellow-500 mr-3 rounded-full"></span>
                黄色い枠の商品は、そろそろ買い替え時期です
              </li>
              <li className="text-xl flex items-center">
                <span className="inline-block w-4 h-4 bg-blue-500 mr-3 rounded-full"></span>
                青い枠の商品は、まだ大丈夫です
              </li>
              <li className="text-xl flex items-center">
                <Plus size={20} className="mr-3 text-green-600" />
                「追加」ボタンを押すと、買い物リストに入ります
              </li>
              <li className="text-xl flex items-center">
                <Volume2 size={20} className="mr-3 text-blue-600" />
                「詳細」ボタンを押すと、詳しい情報を聞けます
              </li>
            </ul>
          </div>
        )}
      </div>
      
      {/* シンプルなフィルター - 大きなボタンでワンライン表示 */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-4">商品を絞り込む：</h2>
        <div className="grid grid-cols-2 gap-6">
          <button 
            className={`text-center p-6 rounded-lg text-2xl font-bold shadow-lg border-4 ${filter === 'all' ? 'bg-blue-600 text-white border-blue-700' : 'bg-gray-200 border-gray-300'}`}
            onClick={() => setFilter('all')}
          >
            全て
          </button>
          <button 
            className={`text-center p-6 rounded-lg text-2xl font-bold shadow-lg border-4 ${filter === 'urgent' ? 'bg-red-600 text-white border-red-700' : 'bg-gray-200 border-gray-300'}`}
            onClick={() => setFilter('urgent')}
          >
            急ぎ
          </button>
          <button 
            className={`text-center p-6 rounded-lg text-2xl font-bold shadow-lg border-4 ${filter === 'food' ? 'bg-green-600 text-white border-green-700' : 'bg-gray-200 border-gray-300'}`}
            onClick={() => setFilter('food')}
          >
            食料品
          </button>
          <button 
            className={`text-center p-6 rounded-lg text-2xl font-bold shadow-lg border-4 ${filter === 'daily' ? 'bg-purple-600 text-white border-purple-700' : 'bg-gray-200 border-gray-300'}`}
            onClick={() => setFilter('daily')}
          >
            日用品
          </button>
        </div>
      </div>
      
      {/* 提案リスト - 明瞭なヘッダー */}
      <div className="mb-8">
        <h2 className="text-4xl font-bold mb-6 flex items-center bg-white p-4 border-l-8 border-blue-600 rounded-r-lg">
          <Clock className="mr-4" size={40} />
          買い替えましょう
        </h2>
        
        {suggestedItems.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-lg shadow border-2 border-gray-300">
            <p className="text-2xl">現在の提案はありません</p>
          </div>
        ) : (
          <div className="space-y-6">
            {suggestedItems.map((item) => {
              // 緊急度に応じたスタイル
              let cardStyle = {};
              let borderColor = '';
              let bgColor = '';
              let statusText = '';
              
              if (item.urgency === 'high') {
                borderColor = 'border-red-600';
                bgColor = 'bg-red-50';
                statusText = 'もうすぐ切れます！';
              } else if (item.urgency === 'medium') {
                borderColor = 'border-yellow-500';
                bgColor = 'bg-yellow-50';
                statusText = 'そろそろ買い替え時';
              } else {
                borderColor = 'border-blue-500';
                bgColor = 'bg-blue-50';
                statusText = 'まだ大丈夫です';
              }
              
              return (
                <div 
                  key={item.id} 
                  className={`p-6 rounded-lg shadow-lg border-4 ${borderColor} ${bgColor}`}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 mr-4">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-24 h-24 rounded-lg border-2 border-gray-300 object-cover"
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-4xl font-bold mb-3">{item.name}</h3>
                      
                      {/* ステータスバッジ */}
                      <div className={`inline-block px-4 py-2 mb-3 rounded-full ${item.urgency === 'high' ? 'bg-red-600 text-white' : item.urgency === 'medium' ? 'bg-yellow-500 text-black' : 'bg-blue-500 text-white'}`}>
                        <span className="text-xl font-bold">{item.urgency === 'high' ? '急ぎ' : item.urgency === 'medium' ? 'そろそろ' : 'まだ大丈夫'}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-700 text-2xl">
                        <Calendar size={28} className="mr-3" />
                        <span>前回: {formatDate(item.lastPurchased)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* 買い替えボタン - 昭和レトロ風 */}
                    <div className="mt-6 grid grid-cols-2 gap-6">
                    <button 
                      className="bg-green-600 text-white text-2xl p-5 rounded-lg shadow-lg border-4 border-green-700 flex items-center justify-center"
                      onClick={() => addToShoppingList(item)}
                    >
                      <Plus size={30} className="mr-2" />
                      追加
                    </button>
                    
                    <button 
                      className="bg-blue-500 text-white text-2xl p-5 rounded-lg shadow-lg border-4 border-blue-600 flex items-center justify-center"
                      onClick={() => {
                        const message = item.daysUntilEmpty <= 0
                          ? `${item.name}はそろそろ切れている可能性があります。買い物リストに追加しますか？`
                          : `${item.name}はあと約${item.daysUntilEmpty}日で切れる可能性があります。前回は${formatDate(item.lastPurchased)}に購入しました。`;
                        speakText(message);
                      }}
                    >
                      <Volume2 size={30} className="mr-2" />
                      詳細
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* 買い物リストに追加された商品 - シンプルに */}
      {shoppingList.length > 0 && (
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-6 flex items-center bg-white p-4 border-l-8 border-green-600 rounded-r-lg">
            <ShoppingBag className="mr-4" size={40} />
            買い物リスト
          </h2>
          
          <div className="bg-white p-6 rounded-lg shadow-lg border-4 border-green-500">
            {shoppingList.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center p-4 border-b-2 border-gray-200"
              >
                <Check size={36} className="text-green-600 mr-4" />
                <span className="text-3xl">{item.name}</span>
              </div>
            ))}
            
            <button
              className="mt-6 w-full bg-green-600 text-white p-4 rounded-lg text-2xl font-bold shadow-lg border-2 border-green-700"
              onClick={() => {
                speakText('買い物リストに移動します');
                // 実際のアプリでは画面遷移処理を実装
                alert('買い物リスト画面へ移動します');
              }}
            >
              買い物リストで確認する
            </button>
          </div>
        </div>
      )}
      
      {/* 昭和風フッター */}
      <div className="text-center mt-8 p-4 bg-white border-t-4 border-red-600 rounded-lg">
        <p className="text-xl">おつかいクエスト</p>
        <p className="text-lg text-gray-600">いつもの買い物をもっと楽しく</p>
      </div>
      
      <div className="h-24"></div> {/* 下部ナビゲーション用の余白 */}
    </div>
  );
};

export default Recommend ;
