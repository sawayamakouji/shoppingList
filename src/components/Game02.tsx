import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom"; // 追加


const Game02 = () => {
  const navigate = useNavigate(); // 追加
  // ゲームの状態
  const [deck, setDeck] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [computerHand, setComputerHand] = useState([]);
  const [fieldCards, setFieldCards] = useState([]);
  const [playerCaptures, setPlayerCaptures] = useState([]);
  const [computerCaptures, setComputerCaptures] = useState([]);
  const [turn, setTurn] = useState('player'); // 'player' または 'computer'
  const [gamePhase, setGamePhase] = useState('deal'); // 'deal', 'play', 'match', 'end'
  const [selectedCard, setSelectedCard] = useState(null);
  const [matchedCards, setMatchedCards] = useState([]);
  const [message, setMessage] = useState('ゲームを開始します');
  const [playerScore, setPlayerScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [koikoiOption, setKoikoiOption] = useState(false);

  // 花札の定義
  const createDeck = () => {
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    const types = ['光', 'タン', 'タン', 'カス', 'カス', 'カス', 'カス'];
    
    const flowerNames = {
      '1月': '松', '2月': '梅', '3月': '桜', '4月': '藤', '5月': '菖蒲', '6月': '牡丹',
      '7月': '萩', '8月': '芒', '9月': '菊', '10月': '紅葉', '11月': '雨', '12月': '桐'
    };
    
    // 各月の花の色
    const flowerColors = {
      '1月': '#2E8B57', '2月': '#FF69B4', '3月': '#FFB7C5', '4月': '#9370DB', 
      '5月': '#4B0082', '6月': '#FF1493', '7月': '#FF7F50', '8月': '#32CD32',
      '9月': '#FFD700', '10月': '#FF4500', '11月': '#1E90FF', '12月': '#DDA0DD'
    };
    
    // 各カードタイプのバックグラウンド色
    const typeColors = {
      '光': '#FFFACD',
      'タン': '#F0FFF0',
      'カス': '#F5F5F5'
    };

    let newDeck = [];
    let id = 0;

    months.forEach(month => {
      for (let i = 0; i < 4; i++) {
        let type = i < types.length ? types[i] : 'カス';
        let points = 0;
        
        if (type === '光') points = 20;
        else if (type === 'タン') points = 5;
        else if (type === 'カス') points = 1;
        
        newDeck.push({
          id: id++,
          month: month,
          flower: flowerNames[month],
          type: type,
          points: points,
          bgColor: typeColors[type],
          flowerColor: flowerColors[month],
          image: `${month}_${i+1}`
        });
      }
    });
    
    return shuffleDeck(newDeck);
  };

  // 山札をシャッフル
  const shuffleDeck = (deck) => {
    let shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // ゲームの初期化
  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    const newDeck = createDeck();
    
    // 初期手札を配る
    const playerCards = newDeck.slice(0, 8);
    const fieldCards = newDeck.slice(8, 16);
    const computerCards = newDeck.slice(16, 24);
    const remainingDeck = newDeck.slice(24);
    
    setDeck(remainingDeck);
    setPlayerHand(playerCards);
    setComputerHand(computerCards);
    setFieldCards(fieldCards);
    setPlayerCaptures([]);
    setComputerCaptures([]);
    setTurn('player');
    setGamePhase('play');
    setSelectedCard(null);
    setMatchedCards([]);
    setMessage('あなたの番です。手札からカードを選んでください');
    setPlayerScore(0);
    setComputerScore(0);
    setGameOver(false);
    setKoikoiOption(false);
  };

  // プレイヤーがカードを選択
  const handlePlayerCardSelect = (card) => {
    if (turn !== 'player' || gamePhase !== 'play' || gameOver) return;
    
    setSelectedCard(card);
    
    // 場に同じ月のカードがあるか確認
    const matches = fieldCards.filter(fieldCard => fieldCard.month === card.month);
    
    if (matches.length > 0) {
      setMatchedCards(matches);
      setMessage('合わせるカードを選んでください');
      setGamePhase('match');
    } else {
      // マッチするカードがない場合は、選んだカードを場に置く
      const newPlayerHand = playerHand.filter(c => c.id !== card.id);
      setPlayerHand(newPlayerHand);
      setFieldCards([...fieldCards, card]);
      setMessage('コンピュータの番です');
      setSelectedCard(null);
      setTurn('computer');
      
      // コンピュータの手番を少し遅らせる
      setTimeout(() => {
        computerTurn();
      }, 1000);
    }
  };

  // マッチングしたフィールドカードを選択
  const handleFieldCardSelect = (card) => {
    if (gamePhase !== 'match' || !matchedCards.includes(card)) return;
    
    // 選択したカードと手札のカードを取得
    const newPlayerHand = playerHand.filter(c => c.id !== selectedCard.id);
    const newFieldCards = fieldCards.filter(c => c.id !== card.id);
    
    // 取得したカードをプレイヤーの獲得札に加える
    setPlayerCaptures([...playerCaptures, selectedCard, card]);
    setPlayerHand(newPlayerHand);
    setFieldCards(newFieldCards);
    
    // 役の確認と得点計算
    const newCaptures = [...playerCaptures, selectedCard, card];
    const points = calculateYaku(newCaptures);
    setPlayerScore(playerScore + points);
    
    // こいこいか勝負かの選択肢
    if (points > 0 && newPlayerHand.length > 0) {
      setKoikoiOption(true);
      setMessage('役が成立しました！こいこいしますか？');
    } else {
      setTurn('computer');
      setMessage('コンピュータの番です');
      setTimeout(() => {
        computerTurn();
      }, 1000);
    }
    
    setSelectedCard(null);
    setMatchedCards([]);
    setGamePhase('play');
  };

  // こいこいか勝負か選択
  const handleKoikoiChoice = (choice) => {
    setKoikoiOption(false);
    
    if (choice === 'koikoi') {
      setMessage('こいこい！コンピュータの番です');
      setTurn('computer');
      setTimeout(() => {
        computerTurn();
      }, 1000);
    } else {
      // 勝負を選んだ場合、得点を確定して終了
      setMessage(`勝負！あなたの得点: ${playerScore}`);
      setGameOver(true);
    }
  };

  // コンピュータの手番
  const computerTurn = () => {
    if (gameOver) return;
    
    // 簡易的なAI: 同じ月のカードがあれば取る、なければランダムに出す
    let played = false;
    
    // マッチするカードを探す
    for (let i = 0; i < computerHand.length; i++) {
      const card = computerHand[i];
      const matches = fieldCards.filter(fieldCard => fieldCard.month === card.month);
      
      if (matches.length > 0) {
        // マッチするカードがあれば取る
        const matchCard = matches[0];
        const newComputerHand = computerHand.filter(c => c.id !== card.id);
        const newFieldCards = fieldCards.filter(c => c.id !== matchCard.id);
        
        setComputerHand(newComputerHand);
        setFieldCards(newFieldCards);
        setComputerCaptures([...computerCaptures, card, matchCard]);
        
        // 役の確認と得点計算
        const newCaptures = [...computerCaptures, card, matchCard];
        const points = calculateYaku(newCaptures);
        setComputerScore(computerScore + points);
        
        setMessage(`コンピュータが ${card.month}${card.flower} で ${matchCard.month}${matchCard.flower} を取りました`);
        
        // こいこいするかどうかの判断（簡易的なロジック）
        if (points > 0 && newComputerHand.length > 0) {
          // スコアが低いか手札が多い場合はこいこい
          if (points < 7 || newComputerHand.length > 2) {
            setMessage('コンピュータが「こいこい」と言いました');
            setTimeout(() => {
              setTurn('player');
              setMessage('あなたの番です。手札からカードを選んでください');
            }, 1500);
          } else {
            setMessage(`コンピュータが「勝負」と言いました！コンピュータの得点: ${computerScore + points}`);
            setGameOver(true);
          }
        } else {
          setTurn('player');
          setTimeout(() => {
            setMessage('あなたの番です。手札からカードを選んでください');
          }, 1000);
        }
        
        played = true;
        break;
      }
    }
    
    // マッチするカードがなければランダムにカードを出す
    if (!played && computerHand.length > 0) {
      const randomIndex = Math.floor(Math.random() * computerHand.length);
      const card = computerHand[randomIndex];
      const newComputerHand = computerHand.filter(c => c.id !== card.id);
      
      setComputerHand(newComputerHand);
      setFieldCards([...fieldCards, card]);
      setMessage(`コンピュータが ${card.month}${card.flower} を場に出しました`);
      
      setTurn('player');
      setTimeout(() => {
        setMessage('あなたの番です。手札からカードを選んでください');
      }, 1000);
    }
    
    // 手札がなくなったらゲーム終了
    if (computerHand.length === 0 || playerHand.length === 0) {
      endGame();
    }
  };

  // 役の計算（簡易版）
  const calculateYaku = (captures) => {
    let points = 0;
    let lightCount = captures.filter(c => c.type === '光').length;
    let tanCount = captures.filter(c => c.type === 'タン').length;
    
    // 光札の役
    if (lightCount >= 3) points += 5;
    
    // タン札の役
    if (tanCount >= 5) points += 1;
    
    return points;
  };

  // ゲーム終了
  const endGame = () => {
    let resultMessage = '';
    
    if (playerScore > computerScore) {
      resultMessage = `ゲーム終了！あなたの勝ちです！ (${playerScore} vs ${computerScore})`;
    } else if (computerScore > playerScore) {
      resultMessage = `ゲーム終了！コンピュータの勝ちです。 (${playerScore} vs ${computerScore})`;
    } else {
      resultMessage = `ゲーム終了！引き分けです。 (${playerScore} vs ${computerScore})`;
    }
    
    setMessage(resultMessage);
    setGameOver(true);
  };

  // カードの簡易的な表示（SVGで絵札を表現）
  const renderCard = (card, onClick = null) => {
    const isSelectable = onClick !== null;
    const isSelected = selectedCard && card.id === selectedCard.id;
    const isMatched = matchedCards.includes(card);
    
    // カードのデザイン要素を取得
    const renderCardDesign = () => {
      switch(card.flower) {
        case '松':
          return (
            <svg viewBox="0 0 60 50" className="w-full h-12">
              <path d="M30,5 C25,10 15,10 10,15 C15,20 15,25 10,35 C20,30 30,35 30,45 C30,35 40,30 50,35 C45,25 45,20 50,15 C45,10 35,10 30,5" fill={card.flowerColor} />
              <circle cx="30" cy="25" r="5" fill="#FFD700" style={{opacity: card.type === '光' ? 1 : 0}} />
            </svg>
          );
        case '梅':
          return (
            <svg viewBox="0 0 60 50" className="w-full h-12">
              <circle cx="30" cy="15" r="8" fill={card.flowerColor} />
              <circle cx="20" cy="25" r="8" fill={card.flowerColor} />
              <circle cx="40" cy="25" r="8" fill={card.flowerColor} />
              <circle cx="25" cy="35" r="8" fill={card.flowerColor} />
              <circle cx="35" cy="35" r="8" fill={card.flowerColor} />
              <path d="M30,15 L30,40" stroke="#8B4513" strokeWidth="2" />
              <circle cx="45" cy="10" r="5" fill="#FFD700" style={{opacity: card.type === '光' ? 1 : 0}} />
            </svg>
          );
        case '桜':
          return (
            <svg viewBox="0 0 60 50" className="w-full h-12">
              <circle cx="30" cy="25" r="10" fill="#FFFFFF" stroke={card.flowerColor} strokeWidth="2" />
              <circle cx="30" cy="25" r="5" fill="#FFCC00" />
              <path d="M30,10 L30,40" stroke="#8B4513" strokeWidth="1" />
              <path d="M15,20 L45,30" stroke="#8B4513" strokeWidth="1" />
              <path d="M15,30 L45,20" stroke="#8B4513" strokeWidth="1" />
              <circle cx="15" cy="15" r="7" fill={card.flowerColor} />
              <circle cx="45" cy="15" r="7" fill={card.flowerColor} />
              <circle cx="15" cy="35" r="7" fill={card.flowerColor} />
              <circle cx="45" cy="35" r="7" fill={card.flowerColor} />
            </svg>
          );
        case '藤':
          return (
            <svg viewBox="0 0 60 50" className="w-full h-12">
              <path d="M10,5 C40,5 40,10 10,10 C40,10 40,15 10,15 C40,15 40,20 10,20 C40,20 40,25 10,25 C40,25 40,30 10,30" stroke={card.flowerColor} strokeWidth="3" fill="none" />
              <path d="M10,5 L30,45" stroke="#8B4513" strokeWidth="2" />
            </svg>
          );
        case '菖蒲':
          return (
            <svg viewBox="0 0 60 50" className="w-full h-12">
              <path d="M20,5 L30,40" stroke="#8B4513" strokeWidth="2" />
              <path d="M40,5 L30,40" stroke="#8B4513" strokeWidth="2" />
              <path d="M15,15 C25,10 35,10 45,15" stroke={card.flowerColor} strokeWidth="2" fill="none" />
              <path d="M15,25 C25,20 35,20 45,25" stroke={card.flowerColor} strokeWidth="2" fill="none" />
              <path d="M15,35 C25,30 35,30 45,35" stroke={card.flowerColor} strokeWidth="2" fill="none" />
            </svg>
          );
        case '牡丹':
          return (
            <svg viewBox="0 0 60 50" className="w-full h-12">
              <circle cx="30" cy="20" r="15" fill={card.flowerColor} />
              <circle cx="30" cy="20" r="8" fill="#FFCC00" />
              <path d="M30,35 L30,45" stroke="#8B4513" strokeWidth="2" />
              <path d="M25,40 L35,40" stroke="#8B4513" strokeWidth="1" />
            </svg>
          );
        case '萩':
          return (
            <svg viewBox="0 0 60 50" className="w-full h-12">
              <path d="M30,5 L30,45" stroke="#8B4513" strokeWidth="2" />
              <path d="M20,15 L40,15" stroke="#8B4513" strokeWidth="1" />
              <path d="M20,25 L40,25" stroke="#8B4513" strokeWidth="1" />
              <path d="M20,35 L40,35" stroke="#8B4513" strokeWidth="1" />
              <circle cx="15" cy="15" r="5" fill={card.flowerColor} />
              <circle cx="25" cy="15" r="5" fill={card.flowerColor} />
              <circle cx="35" cy="25" r="5" fill={card.flowerColor} />
              <circle cx="45" cy="25" r="5" fill={card.flowerColor} />
              <circle cx="15" cy="35" r="5" fill={card.flowerColor} />
              <circle cx="25" cy="35" r="5" fill={card.flowerColor} />
            </svg>
          );
        case '芒':
          return (
            <svg viewBox="0 0 60 50" className="w-full h-12">
              <path d="M10,45 L50,45" stroke="#8B4513" strokeWidth="2" />
              <path d="M15,5 L15,45" stroke={card.flowerColor} strokeWidth="2" />
              <path d="M30,5 L30,45" stroke={card.flowerColor} strokeWidth="2" />
              <path d="M45,5 L45,45" stroke={card.flowerColor} strokeWidth="2" />
              <circle cx="15" cy="15" r="5" fill="#FFD700" style={{opacity: card.type === '光' ? 1 : 0}} />
            </svg>
          );
        case '菊':
          return (
            <svg viewBox="0 0 60 50" className="w-full h-12">
              <circle cx="30" cy="25" r="15" fill={card.flowerColor} />
              <circle cx="30" cy="25" r="10" fill="#FFFFFF" />
              <circle cx="30" cy="25" r="5" fill="#FF0000" />
              <path d="M10,25 L20,25" stroke={card.flowerColor} strokeWidth="1" />
              <path d="M40,25 L50,25" stroke={card.flowerColor} strokeWidth="1" />
              <path d="M30,5 L30,15" stroke={card.flowerColor} strokeWidth="1" />
              <path d="M30,35 L30,45" stroke={card.flowerColor} strokeWidth="1" />
              <path d="M15,10 L25,20" stroke={card.flowerColor} strokeWidth="1" />
              <path d="M35,30 L45,40" stroke={card.flowerColor} strokeWidth="1" />
              <path d="M15,40 L25,30" stroke={card.flowerColor} strokeWidth="1" />
              <path d="M35,20 L45,10" stroke={card.flowerColor} strokeWidth="1" />
            </svg>
          );
        case '紅葉':
          return (
            <svg viewBox="0 0 60 50" className="w-full h-12">
              <path d="M20,5 L15,20 L30,15 L45,20 L40,5 Z" fill={card.flowerColor} />
              <path d="M15,20 L5,35 L30,25 L55,35 L45,20 Z" fill={card.flowerColor} />
              <path d="M30,15 L30,45" stroke="#8B4513" strokeWidth="1" />
              <circle cx="45" cy="35" r="5" fill="#FFD700" style={{opacity: card.type === '光' ? 1 : 0}} />
            </svg>
          );
        case '雨':
          return (
            <svg viewBox="0 0 60 50" className="w-full h-12">
              <rect x="10" y="5" width="40" height="30" fill="#8B4513" />
              <path d="M15,40 L15,50" stroke={card.flowerColor} strokeWidth="3" />
              <path d="M25,35 L25,50" stroke={card.flowerColor} strokeWidth="3" />
              <path d="M35,35 L35,50" stroke={card.flowerColor} strokeWidth="3" />
              <path d="M45,40 L45,50" stroke={card.flowerColor} strokeWidth="3" />
              <path d="M20,15 L40,15" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="20" cy="10" r="2" fill="#FFFFFF" />
              <circle cx="40" cy="10" r="2" fill="#FFFFFF" />
            </svg>
          );
        case '桐':
          return (
            <svg viewBox="0 0 60 50" className="w-full h-12">
              <path d="M30,5 L30,45" stroke="#8B4513" strokeWidth="2" />
              <path d="M20,15 L40,15" stroke="#8B4513" strokeWidth="1" />
              <path d="M15,25 L45,25" stroke="#8B4513" strokeWidth="1" />
              <path d="M10,35 L50,35" stroke="#8B4513" strokeWidth="1" />
              <path d="M15,10 L25,20" fill={card.flowerColor} />
              <path d="M45,10 L35,20" fill={card.flowerColor} />
              <path d="M10,20 L20,30" fill={card.flowerColor} />
              <path d="M50,20 L40,30" fill={card.flowerColor} />
              <path d="M5,30 L15,40" fill={card.flowerColor} />
              <path d="M55,30 L45,40" fill={card.flowerColor} />
              <circle cx="30" cy="20" r="5" fill="#FFD700" style={{opacity: card.type === '光' ? 1 : 0}} />
            </svg>
          );
        default:
          return <div className="w-full h-12 bg-gray-200"></div>;
      }
    };
    
    return (
      <div 
        key={card.id} 
        className={`w-16 h-24 m-1 p-1 border-2 rounded cursor-pointer flex flex-col items-center justify-center text-center
          ${isSelectable ? 'cursor-pointer hover:bg-blue-100' : ''}
          ${isSelected ? 'border-red-500 bg-red-100' : 'border-gray-300'}
          ${isMatched ? 'border-blue-500 bg-blue-100' : ''}
        `}
        style={{backgroundColor: card.bgColor}}
        onClick={() => onClick && onClick(card)}
      >
        <div className="text-xs font-bold">{card.month}</div>
        <div className="text-xs">{card.flower}</div>
        {renderCardDesign()}
        <div className="text-xs mt-1">{card.type}</div>
      </div>
    );
  };

  return (



    
    <div className="w-full max-w-4xl mx-auto p-4 bg-green-50 rounded-lg shadow-lg">

<div className="flex justify-end">
<button
          className="px-3 py-2 bg-gray-700 text-white text-lg rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-md"
          onClick={() => navigate("/game")} // ← Game.tsx に遷移
        >
          🎮 戻る
        </button>
</div>

      <h1 className="text-2xl font-bold text-center mb-4">花札 こいこい</h1>
      
      {/* メッセージ表示 */}
      <div className="text-center p-2 mb-4 bg-white rounded shadow">
        <p className="text-lg">{message}</p>
        {playerScore > 0 && <p className="text-sm">あなたの得点: {playerScore}</p>}
        {computerScore > 0 && <p className="text-sm">コンピュータの得点: {computerScore}</p>}
      </div>
      
      {/* こいこい選択 */}
      {koikoiOption && (
        <div className="flex justify-center gap-4 mb-4">
          <button 
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={() => handleKoikoiChoice('koikoi')}
          >
            こいこい
          </button>
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => handleKoikoiChoice('shobu')}
          >
            勝負
          </button>
        </div>
      )}
      
      {/* コンピュータの手札（伏せて表示） */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold">コンピュータの手札 ({computerHand.length}枚)</h2>
        <div className="flex flex-wrap justify-center">
          {computerHand.map(card => (
            <div key={card.id} className="w-16 h-24 m-1 bg-red-800 border-2 border-gray-300 rounded relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 50 80" className="w-12 h-20">
                  <path d="M10,10 L40,10 L40,70 L10,70 Z" fill="#aa0000" stroke="#880000" strokeWidth="2" />
                  <path d="M15,15 L35,15 L35,65 L15,65 Z" fill="#cc0000" stroke="#880000" strokeWidth="1" />
                  <circle cx="25" cy="25" r="5" fill="#ffffff" />
                  <circle cx="25" cy="55" r="5" fill="#ffffff" />
                  <path d="M20,40 L30,40" stroke="#ffffff" strokeWidth="2" />
                  <path d="M25,35 L25,45" stroke="#ffffff" strokeWidth="2" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* 場札 */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold">場札 ({fieldCards.length}枚)</h2>
        <div className="flex flex-wrap justify-center">
          {fieldCards.map(card => renderCard(card, gamePhase === 'match' && matchedCards.includes(card) ? handleFieldCardSelect : null))}
        </div>
      </div>
      
      {/* プレイヤーの手札 */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold">あなたの手札 ({playerHand.length}枚)</h2>
        <div className="flex flex-wrap justify-center">
          {playerHand.map(card => renderCard(card, turn === 'player' && gamePhase === 'play' ? handlePlayerCardSelect : null))}
        </div>
      </div>
      
      {/* 取得札の表示 */}
      <div className="flex justify-between mb-4">
        <div className="w-1/2 p-2">
          <h2 className="text-lg font-semibold">あなたの取得札 ({playerCaptures.length}枚)</h2>
          <div className="flex flex-wrap">
            {playerCaptures.map(card => (
              <div key={card.id} className="w-10 h-14 m-1 p-0 border border-gray-300 rounded text-xs overflow-hidden"
                   style={{backgroundColor: card.bgColor}}>
                <div className="text-center text-xs">{card.month}</div>
                <svg viewBox="0 0 60 50" className="w-full h-6">
                  {card.type === '光' && <circle cx="30" cy="25" r="10" fill="#FFD700" />}
                  {card.type === 'タン' && <rect x="15" y="15" width="30" height="20" fill={card.flowerColor} />}
                  {card.type === 'カス' && (
                    <g>
                      <circle cx="20" cy="20" r="5" fill={card.flowerColor} />
                      <circle cx="40" cy="20" r="5" fill={card.flowerColor} />
                      <circle cx="30" cy="35" r="5" fill={card.flowerColor} />
                    </g>
                  )}
                </svg>
                <div className="text-center text-xs">{card.type}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="w-1/2 p-2">
          <h2 className="text-lg font-semibold">コンピュータの取得札 ({computerCaptures.length}枚)</h2>
          <div className="flex flex-wrap">
            {computerCaptures.map(card => (
              <div key={card.id} className="w-10 h-14 m-1 p-0 border border-gray-300 rounded text-xs overflow-hidden"
                   style={{backgroundColor: card.bgColor}}>
                <div className="text-center text-xs">{card.month}</div>
                <svg viewBox="0 0 60 50" className="w-full h-6">
                  {card.type === '光' && <circle cx="30" cy="25" r="10" fill="#FFD700" />}
                  {card.type === 'タン' && <rect x="15" y="15" width="30" height="20" fill={card.flowerColor} />}
                  {card.type === 'カス' && (
                    <g>
                      <circle cx="20" cy="20" r="5" fill={card.flowerColor} />
                      <circle cx="40" cy="20" r="5" fill={card.flowerColor} />
                      <circle cx="30" cy="35" r="5" fill={card.flowerColor} />
                    </g>
                  )}
                </svg>
                <div className="text-center text-xs">{card.type}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* ゲーム終了時の再開ボタン */}
      {gameOver && (
        <div className="text-center mt-4">
          <button 
            className="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
            onClick={startNewGame}
          >
            新しいゲームを開始
          </button>
        </div>
      )}
    </div>
  );
};



export default Game02;
