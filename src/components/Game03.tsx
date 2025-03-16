import React, { useState, useEffect } from 'react';

const EnhancedMemoryGame = () => {
  const [gameState, setGameState] = useState('menu'); // menu, matching, success
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameLevel, setGameLevel] = useState('easy'); // easy, medium, hard
  const [theme, setTheme] = useState('fruits'); // fruits, animals, faces
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [score, setScore] = useState(0);
  const [hintTimeout, setHintTimeout] = useState(null);
  const [showAllCards, setShowAllCards] = useState(false);
  const [initialPeek, setInitialPeek] = useState(false);

  // テーマに応じたシンボルを取得
  const getThemeSymbols = () => {
    switch(theme) {
      case 'fruits':
        return ['🍎', '🍊', '🍇', '🍉', '🍌', '🍒', '🍓', '🍍'];
      case 'animals':
        return ['🐶', '🐱', '🐭', '🐰', '🦊', '🐻', '🐼', '🐨'];
      case 'faces':
        return ['😀', '😂', '🥰', '😎', '🤔', '😴', '🥳', '😋'];
      default:
        return ['🍎', '🍊', '🍇', '🍉', '🍌', '🍒', '🍓', '🍍'];
    }
  };

  // カードの設定を取得
  const getGameConfig = () => {
    const allSymbols = getThemeSymbols();
    
    switch(gameLevel) {
      case 'easy':
        return {
          pairs: 4,
          symbols: allSymbols.slice(0, 4),
          initialPeekTime: 3, // 秒
          hintAllowed: 2
        };
      case 'medium':
        return {
          pairs: 6,
          symbols: allSymbols.slice(0, 6),
          initialPeekTime: 2,
          hintAllowed: 1
        };
      case 'hard':
        return {
          pairs: 8,
          symbols: allSymbols,
          initialPeekTime: 1,
          hintAllowed: 1
        };
      default:
        return {
          pairs: 4,
          symbols: allSymbols.slice(0, 4),
          initialPeekTime: 3,
          hintAllowed: 2
        };
    }
  };

  // ゲームを初期化
  const initializeGame = () => {
    const config = getGameConfig();
    const symbols = config.symbols;
    
    // ペアのカードを作成
    let cardPairs = [];
    symbols.forEach(symbol => {
      cardPairs.push({ id: Math.random(), symbol, matched: false });
      cardPairs.push({ id: Math.random(), symbol, matched: false });
    });
    
    // カードをシャッフル
    for (let i = cardPairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cardPairs[i], cardPairs[j]] = [cardPairs[j], cardPairs[i]];
    }
    
    setCards(cardPairs);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setTimer(0);
    setStreak(0);
    setHintsUsed(0);
    setScore(0);
    setGameState('matching');
    setIsRunning(true);
    
    // 最初のピーク（カードを一瞬見せる）
    setShowAllCards(true);
    setInitialPeek(true);
    setTimeout(() => {
      setShowAllCards(false);
      setInitialPeek(false);
    }, config.initialPeekTime * 1000);
  };

  // カードをめくる処理
  const handleCardClick = (cardId) => {
    // すでにめくられているか、マッチしたカードはクリックできない
    if (flipped.includes(cardId) || matched.includes(cardId) || flipped.length >= 2 || showAllCards) {
      return;
    }
    
    // カードをめくる
    const newFlipped = [...flipped, cardId];
    setFlipped(newFlipped);
    
    // カードをめくった効果音（仮想的な表現）
    playSound('flip');
    
    // 2枚めくったらマッチングを確認
    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      
      const firstCardId = newFlipped[0];
      const secondCardId = newFlipped[1];
      
      const firstCard = cards.find(card => card.id === firstCardId);
      const secondCard = cards.find(card => card.id === secondCardId);
      
      // シンボルが一致したらマッチング成功
      if (firstCard.symbol === secondCard.symbol) {
        const newMatched = [...matched, firstCardId, secondCardId];
        setMatched(newMatched);
        setFlipped([]);
        
        // ストリーク（連続成功）を更新
        const newStreak = streak + 1;
        setStreak(newStreak);
        if (newStreak > bestStreak) {
          setBestStreak(newStreak);
        }
        
        // スコア計算：マッチ＋ストリークボーナス＋スピードボーナス
        const streakBonus = newStreak * 5;
        const timeBonus = Math.max(0, 10 - Math.floor(timer / 10));
        const matchPoints = 20;
        setScore(score + matchPoints + streakBonus + timeBonus);
        
        // マッチ成功効果音
        playSound('match');
        
        // すべてのカードがマッチしたらゲーム終了
        if (newMatched.length === cards.length) {
          setIsRunning(false);
          playSound('complete');
          setTimeout(() => {
            setGameState('success');
          }, 1000);
        }
      } else {
        // マッチしなかったらストリークリセット
        setStreak(0);
        
        // マッチ失敗効果音
        playSound('nomatch');
        
        // 一定時間後にカードを裏返す
        setTimeout(() => {
          setFlipped([]);
        }, 1000);
      }
    }
  };

  // ヒント機能
  const showHintFunc = () => {
    const config = getGameConfig();
    if (hintsUsed >= config.hintAllowed) return;
    
    setHintsUsed(hintsUsed + 1);
    setScore(Math.max(0, score - 30)); // ヒント使用でスコア減少
    setShowHint(true);
    setShowAllCards(true);
    
    // ヒント効果音
    playSound('hint');
    
    // 一定時間後にヒントを非表示にする
    const timeout = setTimeout(() => {
      setShowHint(false);
      setShowAllCards(false);
    }, 1500);
    setHintTimeout(timeout);
  };

  // 効果音を再生する関数（実際にはReactの環境で音を鳴らす仕組みが必要）
  const playSound = (type) => {
    // 実際のアプリケーションでは音声再生のコードをここに
    console.log(`Playing sound: ${type}`);
  };

  // タイマー機能
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
    } else if (!isRunning) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // ヒントタイムアウトのクリーンアップ
  useEffect(() => {
    return () => {
      if (hintTimeout) {
        clearTimeout(hintTimeout);
      }
    };
  }, [hintTimeout]);

  // 時間を分:秒の形式に変換する関数
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // グリッドのサイズを計算
  const getGridSize = () => {
    const config = getGameConfig();
    const totalCards = config.pairs * 2;
    
    if (totalCards <= 8) return { cols: 4, rows: 2 };
    if (totalCards <= 12) return { cols: 4, rows: 3 };
    return { cols: 4, rows: 4 };
  };

  const gridSize = getGridSize();

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-100 to-purple-100 min-h-screen">
      <div className="w-full max-w-xl flex justify-between items-center mb-4">
        <h1 className="text-5xl font-bold text-blue-800 text-center">
          {theme === 'fruits' ? '🍎' : theme === 'animals' ? '🐶' : '😀'} 
          神経衰弱ゲーム
        </h1>
        <button
          className="px-4 py-2 bg-gray-700 text-white text-xl rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-md"
          onClick={() => window.location.href = '/'}
        >
          🏠 ホーム
        </button>
      </div>
      
      {gameState === 'menu' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-lg max-w-lg w-full">
          <h2 className="text-4xl font-semibold mb-6 text-center">ゲーム設定</h2>
          
          <div className="mb-6">
            <h3 className="text-2xl font-semibold mb-3 text-blue-700">テーマを選ぶ</h3>
            <div className="flex flex-wrap gap-3 mb-4">
              <button
                className={`px-4 py-3 text-2xl rounded-xl font-bold transition-colors ${theme === 'fruits' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700'}`}
                onClick={() => setTheme('fruits')}
              >
                フルーツ 🍎
              </button>
              <button
                className={`px-4 py-3 text-2xl rounded-xl font-bold transition-colors ${theme === 'animals' ? 'bg-yellow-500 text-white' : 'bg-yellow-100 text-yellow-700'}`}
                onClick={() => setTheme('animals')}
              >
                どうぶつ 🐶
              </button>
              <button
                className={`px-4 py-3 text-2xl rounded-xl font-bold transition-colors ${theme === 'faces' ? 'bg-pink-500 text-white' : 'bg-pink-100 text-pink-700'}`}
                onClick={() => setTheme('faces')}
              >
                かお 😀
              </button>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-2xl font-semibold mb-3 text-blue-700">難易度を選ぶ</h3>
            <div className="flex flex-col gap-3">
              <button
                className={`px-5 py-4 text-2xl rounded-xl font-bold transition-colors ${gameLevel === 'easy' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-700'}`}
                onClick={() => setGameLevel('easy')}
              >
                かんたん (4ペア) 👵
              </button>
              <button
                className={`px-5 py-4 text-2xl rounded-xl font-bold transition-colors ${gameLevel === 'medium' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-700'}`}
                onClick={() => setGameLevel('medium')}
              >
                ふつう (6ペア) 🧓
              </button>
              <button
                className={`px-5 py-4 text-2xl rounded-xl font-bold transition-colors ${gameLevel === 'hard' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-700'}`}
                onClick={() => setGameLevel('hard')}
              >
                むずかしい (8ペア) 🏆
              </button>
            </div>
          </div>
          
          <button
            className="w-full px-6 py-5 bg-purple-600 text-white text-3xl rounded-xl font-bold hover:bg-purple-700 transition-colors mb-6 shadow-lg"
            onClick={initializeGame}
          >
            ゲームスタート！
          </button>
          
          <div className="bg-blue-50 p-5 rounded-xl border-2 border-blue-200">
            <h3 className="text-2xl font-semibold mb-3 text-blue-800">遊び方</h3>
            <ul className="text-xl space-y-2">
              <li>- 同じ絵柄のカードを見つけましょう</li>
              <li>- 最初に全部のカードが見えます</li>
              <li>- ヒントボタンで一時的に全部見えます</li>
              <li>- 連続で当てるとボーナス点数！</li>
            </ul>
          </div>
        </div>
      )}
      
      {gameState === 'matching' && (
        <div className="flex flex-col items-center">
          <div className="w-full max-w-xl bg-white rounded-xl p-3 mb-4 flex justify-between items-center">
            <div className="text-2xl font-semibold">
              めくり: <span className="text-blue-600">{moves}</span>
            </div>
            <div className="text-2xl font-semibold">
              時間: <span className="text-blue-600">{formatTime(timer)}</span>
            </div>
            <div className="text-2xl font-semibold">
              得点: <span className="text-purple-600">{score}</span>
            </div>
          </div>
          
          <div className="mb-2 w-full max-w-xl flex justify-between items-center">
            <div className="text-xl font-medium bg-yellow-100 px-3 py-1 rounded-lg">
              連続: <span className="text-yellow-600 font-bold">{streak}</span>
            </div>
            
            <button
              className={`px-4 py-2 text-white text-xl rounded-lg font-bold ${
                hintsUsed >= getGameConfig().hintAllowed ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600'
              }`}
              onClick={showHintFunc}
              disabled={hintsUsed >= getGameConfig().hintAllowed}
            >
              ヒント ({getGameConfig().hintAllowed - hintsUsed}/{getGameConfig().hintAllowed})
            </button>
          </div>
          
          {initialPeek && (
            <div className="w-full max-w-xl bg-blue-100 rounded-lg p-3 mb-3 text-center text-blue-800 text-xl">
              カードを覚えてください！
            </div>
          )}
          
          <div 
            className="grid gap-3 mb-6 bg-white p-4 rounded-xl shadow-lg max-w-xl w-full"
            style={{ 
              gridTemplateColumns: `repeat(${gridSize.cols}, 1fr)`,
              gridTemplateRows: `repeat(${gridSize.rows}, 1fr)`
            }}
          >
            {cards.map(card => (
              <button
                key={card.id}
                className={`
                  flex items-center justify-center
                  aspect-square
                  rounded-xl
                  text-5xl
                  focus:outline-none
                  transition-all duration-300
                  ${(flipped.includes(card.id) || matched.includes(card.id) || showAllCards) 
                    ? 'bg-white shadow-md transform hover:scale-105' 
                    : 'bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'}
                  ${matched.includes(card.id) ? 'bg-green-100 border-2 border-green-300' : ''}
                  ${showHint && !matched.includes(card.id) ? 'bg-yellow-50 border-2 border-yellow-300' : ''}
                `}
                onClick={() => handleCardClick(card.id)}
              >
                {(flipped.includes(card.id) || matched.includes(card.id) || showAllCards) ? (
                  <span className="animate__animated animate__flipInY">{card.symbol}</span>
                ) : '?'}
              </button>
            ))}
          </div>
          
          <div className="flex gap-4">
            <button
              className="px-6 py-3 bg-blue-600 text-white text-xl rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md"
              onClick={initializeGame}
            >
              やり直し
            </button>
            
            <button
              className="px-6 py-3 bg-gray-600 text-white text-xl rounded-xl font-bold hover:bg-gray-700 transition-colors shadow-md"
              onClick={() => {
                setIsRunning(false);
                setGameState('menu');
              }}
            >
              設定に戻る
            </button>
            
            <button
              className="px-6 py-3 bg-gray-700 text-white text-xl rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-md"
              onClick={() => window.location.href = '/'}
            >
              ホームへ
            </button>
          </div>
        </div>
      )}
      
      {gameState === 'success' && (
        <div className="flex flex-col items-center">
          <div className="bg-gradient-to-r from-green-100 to-blue-100 p-8 rounded-2xl shadow-lg text-center mb-8 max-w-lg">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-4xl font-bold mb-4 text-purple-800">大成功！</h2>
            <p className="text-2xl mb-6">すべてのカードをめくりました！</p>
            
            <div className="bg-white rounded-xl p-4 mb-4">
              <table className="w-full text-xl">
                <tbody>
                  <tr>
                    <td className="py-2 text-left">めくった回数:</td>
                    <td className="py-2 text-right font-bold">{moves}回</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-left">かかった時間:</td>
                    <td className="py-2 text-right font-bold">{formatTime(timer)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-left">最高連続成功:</td>
                    <td className="py-2 text-right font-bold">{bestStreak}回</td>
                  </tr>
                  <tr className="border-t-2 border-purple-200">
                    <td className="py-2 text-left font-bold text-purple-800">総得点:</td>
                    <td className="py-2 text-right font-bold text-purple-800 text-3xl">{score}点</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="text-2xl mb-2 text-green-800 font-medium">
              今日も脳の体操ができました！
            </div>
          </div>
          
          <div className="flex gap-4 flex-wrap justify-center">
            <button
              className="px-8 py-4 bg-purple-600 text-white text-2xl rounded-xl font-bold hover:bg-purple-700 transition-colors shadow-lg"
              onClick={initializeGame}
            >
              もう一度遊ぶ
            </button>
            
            <button
              className="px-8 py-4 bg-blue-600 text-white text-2xl rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg"
              onClick={() => setGameState('menu')}
            >
              設定に戻る
            </button>
            
            <button
              className="px-8 py-4 bg-gray-700 text-white text-2xl rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg"
              onClick={() => window.location.href = '/'}
            >
              ホームへ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedMemoryGame;
