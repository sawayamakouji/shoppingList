import React, { useState } from 'react';

const Game02 = () => {
  // 麻雀牌の定義
  const suits = {
    m: '萬子',
    p: '筒子',
    s: '索子',
    z: '字牌'
  };

  const zPai = ['東', '南', '西', '北', '白', '發', '中'];

  // 牌の表示名とイメージを取得する関数
  const getTileName = (tile) => {
    const suit = tile.charAt(tile.length - 1);
    const number = tile.substring(0, tile.length - 1);
    
    if (suit === 'z') {
      return zPai[parseInt(number) - 1];
    } else {
      return `${number}${suits[suit]}`;
    }
  };
  
  // 牌のイメージと色を取得する関数
  const getTileImage = (tile) => {
    const suit = tile.charAt(tile.length - 1);
    const number = parseInt(tile.substring(0, tile.length - 1));
    
    if (suit === 'm') {
      // 萬子
      if (number === 1) return '🀇';
      if (number === 2) return '🀈';
      if (number === 3) return '🀉';
      if (number === 4) return '🀊';
      if (number === 5) return '🀋';
      if (number === 6) return '🀌';
      if (number === 7) return '🀍';
      if (number === 8) return '🀎';
      if (number === 9) return '🀏';
    } else if (suit === 'p') {
      // 筒子
      if (number === 1) return '🀙';
      if (number === 2) return '🀚';
      if (number === 3) return '🀛';
      if (number === 4) return '🀜';
      if (number === 5) return '🀝';
      if (number === 6) return '🀞';
      if (number === 7) return '🀟';
      if (number === 8) return '🀠';
      if (number === 9) return '🀡';
    } else if (suit === 's') {
      // 索子
      if (number === 1) return '🀐';
      if (number === 2) return '🀑';
      if (number === 3) return '🀒';
      if (number === 4) return '🀓';
      if (number === 5) return '🀔';
      if (number === 6) return '🀕';
      if (number === 7) return '🀖';
      if (number === 8) return '🀗';
      if (number === 9) return '🀘';
    } else if (suit === 'z') {
      // 字牌
      if (number === 1) return '🀀'; // 東
      if (number === 2) return '🀁'; // 南
      if (number === 3) return '🀂'; // 西
      if (number === 4) return '🀃'; // 北
      if (number === 5) return '🀆'; // 白
      if (number === 6) return '🀅'; // 發
      if (number === 7) return '🀄'; // 中
    }
    
    return '❓'; // 不明な牌
  };
  
  // 牌の種類によって色を取得する関数
  const getTileColor = (tile) => {
    const suit = tile.charAt(tile.length - 1);
    const number = parseInt(tile.substring(0, tile.length - 1));
    
    if (suit === 'm') {
      // 萬子 - 青色系
      return 'text-blue-700';
    } else if (suit === 'p') {
      // 筒子 - 緑色系
      return 'text-green-700';
    } else if (suit === 's') {
      // 索子 - 茶色系
      return 'text-yellow-800';
    } else if (suit === 'z') {
      // 字牌
      if (number >= 1 && number <= 4) {
        // 風牌 - 黒色
        return 'text-gray-800';
      } else {
        // 三元牌
        if (number === 5) return 'text-gray-600'; // 白
        if (number === 6) return 'text-green-800'; // 發
        if (number === 7) return 'text-red-700'; // 中
      }
    }
    
    return 'text-black'; // デフォルト
  };

  // クイズのデータ
  const quizData = [
    {
      id: 1,
      hand: ['1m', '1m', '2m', '3m', '2p', '3p', '4p', '6s', '7s', '8s', '5z', '5z', '5z'],
      options: ['1m', '2m', '3m', '2p', '3p', '4p', '6s', '7s', '8s'],
      correctAnswer: '2m',
      explanation: '1m, 2m, 3mの形は両面待ちになっていますが、既に1mが2枚あるため、2mを切って1m, 3mの嵌張待ちにするより、2mを残して1m, 2m, 3mの形を保った方が良いです。また、2p, 3p, 4pと6s, 7s, 8sは完成した面子なので切るべきではありません。'
    },
    {
      id: 2,
      hand: ['2m', '3m', '4m', '2p', '3p', '4p', '5p', '5p', '5s', '6s', '7s', '1z', '1z'],
      options: ['2m', '4m', '2p', '4p', '5p', '5s', '7s', '1z'],
      correctAnswer: '1z',
      explanation: '手牌には既に2つの完成した面子（2m, 3m, 4mと2p, 3p, 4p）と、雀頭候補（5p, 5p）があります。また、5s, 6s, 7sは良形の塔子です。1zは役に繋がりにくい孤立牌なので切るのが最適です。'
    },
    {
      id: 3,
      hand: ['1m', '2m', '3m', '4m', '5m', '6m', '2p', '3p', '7s', '8s', '9s', '9s', '9s'],
      options: ['1m', '6m', '2p', '3p', '7s'],
      correctAnswer: '2p',
      explanation: '1m〜6mは一気通貫の可能性を持つ良形です。7s, 8s, 9sと9s, 9s, 9sは完成した面子です。2p, 3pは孤立した塔子で、しかも2pと3pの間には他の牌との連携がないため、2pか3pを切るべきです。2pの方が壁になっている可能性が高いので2pを切ります。'
    },
    {
      id: 4,
      hand: ['1m', '1m', '1m', '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s', '6z', '7z'],
      options: ['2s', '9s', '6z', '7z'],
      correctAnswer: '7z',
      explanation: '手牌には既に一つの刻子（1m, 1m, 1m）と索子の2s〜9sまでがあり、一気通貫や清一色の可能性があります。6z（發）と7z（中）は役牌になる可能性がありますが、7z単独よりも6zの方が發と組み合わせて役牌になる可能性が高いため、7zを切ります。'
    },
    {
      id: 5,
      hand: ['2m', '3m', '4m', '3p', '4p', '5p', '5p', '5p', '6p', '7p', '8p', '6s', '7s'],
      options: ['2m', '4m', '3p', '5p', '8p', '6s', '7s'],
      correctAnswer: '6s',
      explanation: '筒子（p）で多くの良形が揃っています。3p, 4p, 5pと5p, 6p, 7pの面子、さらに5p, 5p, 5pの刻子があります。また、2m, 3m, 4mも完成面子です。6s, 7sは孤立した塔子なので、どちらかを切るべきです。筒子の手を活かすなら、索子は切った方が良いでしょう。'
    },
    {
      id: 6,
      hand: ['1m', '2m', '3m', '1p', '2p', '3p', '1s', '2s', '3s', '4z', '4z', '5z', '5z'],
      options: ['3m', '3p', '3s', '4z', '5z'],
      correctAnswer: '4z',
      explanation: '三色同順の形（1m, 2m, 3m、1p, 2p, 3p、1s, 2s, 3s）が完成しています。残りは4z, 4z（北）と5z, 5z（白）で、どちらかを雀頭にすることになります。北は役にならないことが多いですが、白は役牌になるため、白を残して北を切るのが良いでしょう。'
    },
    {
      id: 7,
      hand: ['2m', '3m', '4m', '7m', '8m', '9m', '2p', '3p', '4p', '6s', '7s', '8s', '9s'],
      options: ['2m', '9m', '2p', '4p', '6s', '9s'],
      correctAnswer: '9s',
      explanation: '手牌には3つの完成面子（2m, 3m, 4m、7m, 8m, 9m、2p, 3p, 4p）があります。6s, 7s, 8s, 9sの中から1枚切る必要がありますが、6s, 7s, 8sは両面待ちの可能性がある良形なので、9sを切るのが最適です。'
    },
    {
      id: 8,
      hand: ['1m', '2m', '3m', '4m', '5m', '6m', '7m', '8m', '3p', '4p', '5p', '7z', '7z'],
      options: ['1m', '8m', '3p', '5p', '7z'],
      correctAnswer: '7z',
      explanation: '1m〜8mまでの良形があり、清一色や一気通貫の可能性があります。3p, 4p, 5pも完成した面子ですが、7z, 7z（中）は他の牌と組み合わせて役を作る可能性が低いです。清一色や一気通貫を目指すなら、字牌の7zを切るのが良いでしょう。ただし、既に雀頭として使える7z, 7zがあるため、もう一つの選択肢としては筒子の面子を切る選択肢もあります。'
    },
    {
      id: 9,
      hand: ['1m', '1m', '1m', '2m', '3m', '4m', '5m', '6m', '7m', '2s', '3s', '4s', '6z'],
      options: ['7m', '2s', '4s', '6z'],
      correctAnswer: '6z',
      explanation: '萬子で清一色に近い形になっています。1m, 1m, 1mの刻子と、2m〜7mの連続した塔子があります。2s, 3s, 4sは完成した面子ですが、6z（發）は孤立牌です。清一色を目指すなら索子の面子を切るべきですが、既に完成しているため、孤立している6zを切る方が良いでしょう。'
    },
    {
      id: 10,
      hand: ['2m', '3m', '4m', '4p', '5p', '6p', '4s', '5s', '6s', '1z', '1z', '7z', '7z'],
      options: ['2m', '4p', '6p', '4s', '6s', '1z', '7z'],
      correctAnswer: '1z',
      explanation: '三色同順（2m, 3m, 4m、4p, 5p, 6p、4s, 5s, 6s）が完成しており、1z, 1z（東）と7z, 7z（中）の2つの雀頭候補があります。中は三元牌で役牌になりますが、東は自風牌でない限り役にはなりません。そのため、東を切るのが最適です。'
    }
  ];

  // ステート管理
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  // 現在の問題
  const currentQuestion = quizData[currentQuestionIndex];

  // 選択肢をクリックしたときの処理
  const handleOptionClick = (option) => {
    if (isAnswered) return;
    
    setSelectedOption(option);
    setIsAnswered(true);
    
    if (option === currentQuestion.correctAnswer) {
      setScore(score + 1);
    }
  };

  // 次の問題へ進む
  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizData.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // 最終問題終了後は結果表示
      setShowResults(true);
    }
  };

  // 再挑戦ボタンの処理
  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setShowResults(false);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">麻雀の捨て牌クイズ</h1>
      
      {showResults ? (
        <div>
          <h2 className="text-xl mb-4">結果発表</h2>
          <p>
            {score} / {quizData.length} 問正解
          </p>
          <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={handleRestart}>
            再挑戦する
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold">問題 {currentQuestion.id}</h2>
            <p className="mt-2">以下の手牌の中から、最適な捨て牌を選んでください。</p>
          </div>
          
          <div className="mb-4">
            <div className="flex flex-wrap">
              {currentQuestion.hand.map((tile, index) => (
                <div key={index} className={`text-4xl mr-2 ${getTileColor(tile)}`}>
                  {getTileImage(tile)}
                </div>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <h3 className="text-lg font-semibold">選択肢</h3>
            <div className="flex flex-wrap">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  className={`m-2 px-4 py-2 border rounded ${
                    isAnswered
                      ? option === currentQuestion.correctAnswer
                        ? 'bg-green-300'
                        : option === selectedOption
                        ? 'bg-red-300'
                        : ''
                      : 'bg-white'
                  }`}
                  onClick={() => handleOptionClick(option)}
                  disabled={isAnswered}
                >
                  {getTileImage(option)} {getTileName(option)}
                </button>
              ))}
            </div>
          </div>
          
          {isAnswered && (
            <div className="mb-4">
              <p>
                {selectedOption === currentQuestion.correctAnswer ? '正解っす！' : '不正解っす！'}
              </p>
              <p className="mt-2">{currentQuestion.explanation}</p>
              <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={handleNextQuestion}>
                次の問題へ
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Game02;
