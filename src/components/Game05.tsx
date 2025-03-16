import React, { useState, useEffect } from 'react';

const Game05 = () => {
  const [gameState, setGameState] = useState('menu'); // menu, game, result
  const [difficulty, setDifficulty] = useState('easy');
  const [operationType, setOperationType] = useState('addition');
  const [currentQuestion, setCurrentQuestion] = useState({});
  const [userAnswer, setUserAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [feedback, setFeedback] = useState({ show: false, correct: false, message: '' });
  const [showPad, setShowPad] = useState(true);
  
  // 難易度設定
  const getDifficultyConfig = () => {
    switch (difficulty) {
      case 'easy':
        return {
          timeLimit: 60,
          numberRange: 10,
          decimalPlaces: 0,
          includeNegatives: false
        };
      case 'medium':
        return {
          timeLimit: 90,
          numberRange: 50,
          decimalPlaces: 0,
          includeNegatives: true
        };
      case 'hard':
        return {
          timeLimit: 120,
          numberRange: 100,
          decimalPlaces: 0,
          includeNegatives: true
        };
      default:
        return {
          timeLimit: 60,
          numberRange: 10,
          decimalPlaces: 0,
          includeNegatives: false
        };
    }
  };

  // 演算子記号
  const getOperationSymbol = () => {
    switch (operationType) {
      case 'addition': return '+';
      case 'subtraction': return '-';
      case 'multiplication': return '×';
      case 'division': return '÷';
      case 'mixed': return ['＋', '−', '×', '÷'][Math.floor(Math.random() * 4)];
      default: return '+';
    }
  };

  // ランダムな数値を生成
  const generateRandomNumber = (max, allowNegative = false, decimalPlaces = 0) => {
    let num = Math.floor(Math.random() * max) + 1;
    
    // 小数点以下の桁数を設定
    if (decimalPlaces > 0) {
      num = parseFloat((num / Math.pow(10, decimalPlaces)).toFixed(decimalPlaces));
    }
    
    // 負の数を許可する場合、50%の確率で負の数にする
    if (allowNegative && Math.random() > 0.5) {
      num = -num;
    }
    
    return num;
  };

  // 問題を生成
  const generateQuestion = () => {
    const config = getDifficultyConfig();
    const operationSymbol = getOperationSymbol();
    let num1, num2, correctAnswer;
    
    // 演算子に基づいて問題を生成
    if (operationSymbol === '+') {
      num1 = generateRandomNumber(config.numberRange, config.includeNegatives, config.decimalPlaces);
      num2 = generateRandomNumber(config.numberRange, config.includeNegatives, config.decimalPlaces);
      correctAnswer = num1 + num2;
    } else if (operationSymbol === '-') {
      num1 = generateRandomNumber(config.numberRange, config.includeNegatives, config.decimalPlaces);
      num2 = generateRandomNumber(config.numberRange, config.includeNegatives, config.decimalPlaces);
      correctAnswer = num1 - num2;
    } else if (operationSymbol === '×') {
      // 掛け算は小さめの数字にする
      const multiplicationRange = Math.min(config.numberRange, 12); // 九九を超えないように
      num1 = generateRandomNumber(multiplicationRange, config.includeNegatives, config.decimalPlaces);
      num2 = generateRandomNumber(multiplicationRange, config.includeNegatives, config.decimalPlaces);
      correctAnswer = num1 * num2;
    } else if (operationSymbol === '÷') {
      // 割り算は答えが整数になるようにする
      num2 = generateRandomNumber(10, false, 0); // 除数は1〜10の整数
      correctAnswer = generateRandomNumber(10, config.includeNegatives, 0); // 商も整数に
      num1 = num2 * correctAnswer; // 被除数を計算
    }
    
    return {
      num1: num1,
      num2: num2,
      operation: operationSymbol,
      correctAnswer: correctAnswer
    };
  };

  // ゲームの初期化
  const initializeGame = () => {
    const config = getDifficultyConfig();
    setTimeLeft(config.timeLimit);
    setScore(0);
    setAnsweredQuestions(0);
    setCorrectAnswers(0);
    setUserAnswer('');
    setCurrentQuestion(generateQuestion());
    setGameState('game');
    setFeedback({ show: false, correct: false, message: '' });
  };

  // 次の問題へ
  const nextQuestion = () => {
    setUserAnswer('');
    setCurrentQuestion(generateQuestion());
    setFeedback({ show: false, correct: false, message: '' });
  };

  // 回答を確認
  const checkAnswer = () => {
    // 答えが未入力の場合は何もしない
    if (userAnswer === '') return;
    
    const userNum = parseFloat(userAnswer);
    const isCorrect = userNum === currentQuestion.correctAnswer;
    
    setAnsweredQuestions(answeredQuestions + 1);
    
    if (isCorrect) {
      // 正解の場合
      setCorrectAnswers(correctAnswers + 1);
      
      // スコア計算：難易度に応じたボーナス
      let pointValue = 10;
      if (difficulty === 'medium') pointValue = 20;
      if (difficulty === 'hard') pointValue = 30;
      
      setScore(score + pointValue);
      setFeedback({ 
        show: true, 
        correct: true, 
        message: '正解！'
      });
    } else {
      // 不正解の場合
      setFeedback({ 
        show: true, 
        correct: false, 
        message: `不正解... 正解は${currentQuestion.correctAnswer}でした`
      });
    }
    
    // フィードバック表示後、少し待ってから次の問題へ
    setTimeout(() => {
      nextQuestion();
    }, 1500);
  };

  // 数字入力の処理
  const handleNumberInput = (value) => {
    // フィードバック表示中は入力を受け付けない
    if (feedback.show) return;
    
    if (value === 'back') {
      // バックスペース
      setUserAnswer(userAnswer.slice(0, -1));
    } else if (value === 'clear') {
      // クリア
      setUserAnswer('');
    } else if (value === 'minus') {
      // マイナス符号
      if (userAnswer.startsWith('-')) {
        setUserAnswer(userAnswer.substring(1));
      } else {
        setUserAnswer('-' + userAnswer);
      }
    } else if (value === 'submit') {
      // 回答を確認
      checkAnswer();
    } else {
      // 通常の数字入力
      // すでに入力されている場合、先頭の0は削除
      let newAnswer = userAnswer;
      if (newAnswer === '0' && value !== '.') {
        newAnswer = value;
      } else {
        newAnswer += value;
      }
      setUserAnswer(newAnswer);
    }
  };

  // タイマー
  useEffect(() => {
    let timer;
    if (gameState === 'game' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            setGameState('result');
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  // 数字入力パッドを表示
  const renderNumberPad = () => {
    return (
      <div className="mt-4 bg-gray-100 p-3 rounded-xl max-w-md mx-auto">
        <div className="mb-2 flex justify-between">
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm"
            onClick={() => setShowPad(!showPad)}
          >
            {showPad ? 'キーパッドを隠す' : 'キーパッドを表示'}
          </button>
        </div>
        
        {showPad && (
          <div className="grid grid-cols-3 gap-2 bg-white rounded-lg p-2">
            <button 
              className="bg-blue-100 hover:bg-blue-200 text-blue-800 py-3 px-4 rounded-lg text-2xl font-bold"
              onClick={() => handleNumberInput('7')}
            >
              7
            </button>
            <button 
              className="bg-blue-100 hover:bg-blue-200 text-blue-800 py-3 px-4 rounded-lg text-2xl font-bold"
              onClick={() => handleNumberInput('8')}
            >
              8
            </button>
            <button 
              className="bg-blue-100 hover:bg-blue-200 text-blue-800 py-3 px-4 rounded-lg text-2xl font-bold"
              onClick={() => handleNumberInput('9')}
            >
              9
            </button>
            <button 
              className="bg-blue-100 hover:bg-blue-200 text-blue-800 py-3 px-4 rounded-lg text-2xl font-bold"
              onClick={() => handleNumberInput('4')}
            >
              4
            </button>
            <button 
              className="bg-blue-100 hover:bg-blue-200 text-blue-800 py-3 px-4 rounded-lg text-2xl font-bold"
              onClick={() => handleNumberInput('5')}
            >
              5
            </button>
            <button 
              className="bg-blue-100 hover:bg-blue-200 text-blue-800 py-3 px-4 rounded-lg text-2xl font-bold"
              onClick={() => handleNumberInput('6')}
            >
              6
            </button>
            <button 
              className="bg-blue-100 hover:bg-blue-200 text-blue-800 py-3 px-4 rounded-lg text-2xl font-bold"
              onClick={() => handleNumberInput('1')}
            >
              1
            </button>
            <button 
              className="bg-blue-100 hover:bg-blue-200 text-blue-800 py-3 px-4 rounded-lg text-2xl font-bold"
              onClick={() => handleNumberInput('2')}
            >
              2
            </button>
            <button 
              className="bg-blue-100 hover:bg-blue-200 text-blue-800 py-3 px-4 rounded-lg text-2xl font-bold"
              onClick={() => handleNumberInput('3')}
            >
              3
            </button>
            <button 
              className="bg-blue-100 hover:bg-blue-200 text-blue-800 py-3 px-4 rounded-lg text-2xl font-bold"
              onClick={() => handleNumberInput('0')}
            >
              0
            </button>
            <button 
              className="bg-blue-100 hover:bg-blue-200 text-blue-800 py-3 px-4 rounded-lg text-2xl font-bold"
              onClick={() => handleNumberInput('.')}
            >
              .
            </button>
            <button 
              className="bg-blue-100 hover:bg-blue-200 text-blue-800 py-3 px-4 rounded-lg text-2xl font-bold"
              onClick={() => handleNumberInput('minus')}
            >
              +/-
            </button>
            <button 
              className="bg-red-100 hover:bg-red-200 text-red-800 py-3 px-4 rounded-lg text-xl font-bold"
              onClick={() => handleNumberInput('back')}
            >
              ←
            </button>
            <button 
              className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 py-3 px-4 rounded-lg text-xl font-bold"
              onClick={() => handleNumberInput('clear')}
            >
              クリア
            </button>
            <button 
              className="bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg text-xl font-bold"
              onClick={() => handleNumberInput('submit')}
            >
              答える
            </button>
          </div>
        )}
      </div>
    );
  };

  // 正解率の計算
  const calculateAccuracy = () => {
    if (answeredQuestions === 0) return 0;
    return Math.round((correctAnswers / answeredQuestions) * 100);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-green-50 min-h-screen">
      <div className="w-full max-w-xl mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mb-2">
          <h1 className="text-4xl font-bold text-blue-800">
            🔢 計算トレーニング
          </h1>
          <div className="flex gap-2">
            <button
              className="px-3 py-2 bg-blue-700 text-white text-lg rounded-xl font-bold hover:bg-blue-800 transition-colors shadow-md"
              onClick={() => {
                if (gameState === 'game') {
                  setGameState('menu');
                } else if (gameState === 'result') {
                  setGameState('menu');
                } else {
                  window.history.back();
                }
              }}
            >
              ← 戻る
            </button>
            <button
              className="px-3 py-2 bg-gray-700 text-white text-lg rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-md"
              onClick={() => window.location.href = '/'}
            >
              🏠 ホーム
            </button>
          </div>
        </div>
      </div>
      
      {gameState === 'menu' && (
        <div className="bg-white p-6 rounded-3xl shadow-lg max-w-lg w-full">
          <h2 className="text-3xl font-semibold mb-6 text-center">計算トレーニング</h2>
          
          <div className="mb-6">
            <h3 className="text-2xl font-semibold mb-3 text-blue-700">計算の種類</h3>
            <div className="flex flex-col gap-3">
              <button
                className={`px-5 py-4 text-2xl rounded-xl font-bold transition-colors ${operationType === 'addition' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700'}`}
                onClick={() => setOperationType('addition')}
              >
                足し算 (＋)
              </button>
              <button
                className={`px-5 py-4 text-2xl rounded-xl font-bold transition-colors ${operationType === 'subtraction' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-700'}`}
                onClick={() => setOperationType('subtraction')}
              >
                引き算 (−)
              </button>
              <button
                className={`px-5 py-4 text-2xl rounded-xl font-bold transition-colors ${operationType === 'multiplication' ? 'bg-purple-500 text-white' : 'bg-purple-100 text-purple-700'}`}
                onClick={() => setOperationType('multiplication')}
              >
                掛け算 (×)
              </button>
              <button
                className={`px-5 py-4 text-2xl rounded-xl font-bold transition-colors ${operationType === 'division' ? 'bg-yellow-500 text-white' : 'bg-yellow-100 text-yellow-700'}`}
                onClick={() => setOperationType('division')}
              >
                割り算 (÷)
              </button>
              <button
                className={`px-5 py-4 text-2xl rounded-xl font-bold transition-colors ${operationType === 'mixed' ? 'bg-red-500 text-white' : 'bg-red-100 text-red-700'}`}
                onClick={() => setOperationType('mixed')}
              >
                ミックス (いろいろ)
              </button>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-2xl font-semibold mb-3 text-blue-700">難易度を選ぶ</h3>
            <div className="flex flex-col gap-3">
              <button
                className={`px-5 py-4 text-2xl rounded-xl font-bold transition-colors ${difficulty === 'easy' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700'}`}
                onClick={() => setDifficulty('easy')}
              >
                かんたん (1〜10) 👵
              </button>
              <button
                className={`px-5 py-4 text-2xl rounded-xl font-bold transition-colors ${difficulty === 'medium' ? 'bg-yellow-500 text-white' : 'bg-yellow-100 text-yellow-700'}`}
                onClick={() => setDifficulty('medium')}
              >
                ふつう (1〜50) 🧓
              </button>
              <button
                className={`px-5 py-4 text-2xl rounded-xl font-bold transition-colors ${difficulty === 'hard' ? 'bg-red-500 text-white' : 'bg-red-100 text-red-700'}`}
                onClick={() => setDifficulty('hard')}
              >
                むずかしい (1〜100) 🏆
              </button>
            </div>
          </div>
          
          <button
            className="w-full px-6 py-5 bg-blue-600 text-white text-3xl rounded-xl font-bold hover:bg-blue-700 transition-colors mb-6 shadow-lg"
            onClick={initializeGame}
          >
            スタート！
          </button>
          
          <div className="bg-blue-50 p-5 rounded-xl border-2 border-blue-200">
            <h3 className="text-2xl font-semibold mb-3 text-blue-800">遊び方</h3>
            <ul className="text-xl space-y-2">
              <li>- 表示された計算問題を解きましょう</li>
              <li>- 答えをタッチパッドで入力します</li>
              <li>- 「答える」ボタンで回答を確定</li>
              <li>- 制限時間内に多くの問題を解こう！</li>
              <li>- 難しいレベルほど高得点！</li>
            </ul>
          </div>
        </div>
      )}
      
      {gameState === 'game' && (
        <div className="flex flex-col items-center w-full max-w-xl">
          <div className="w-full bg-white rounded-xl p-4 mb-4 flex justify-between items-center">
            <div className="text-2xl font-semibold">
              残り時間: <span className="text-red-600">{timeLeft}秒</span>
            </div>
            <div className="text-2xl font-semibold">
              得点: <span className="text-purple-600">{score}</span>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg w-full mb-4">
            <div className="text-4xl font-bold text-center mb-8">
              {currentQuestion.num1} {currentQuestion.operation} {currentQuestion.num2} = ?
            </div>
            
            <div className="relative">
              <input
                type="text"
                className="w-full py-4 px-3 text-3xl text-center border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none bg-blue-50"
                value={userAnswer}
                readOnly
                placeholder="ここに答えが表示されます"
              />
              
              {feedback.show && (
                <div className={`mt-4 p-3 rounded-lg text-center text-2xl font-bold ${feedback.correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {feedback.message}
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-lg w-full mb-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-800">正解率</div>
                <div className="text-2xl font-bold text-blue-600">{calculateAccuracy()}%</div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded-lg">
                <div className="text-sm text-green-800">解いた問題数</div>
                <div className="text-2xl font-bold text-green-600">{answeredQuestions}問</div>
              </div>
            </div>
          </div>
          
          {renderNumberPad()}
        </div>
      )}
      
      {gameState === 'result' && (
        <div className="flex flex-col items-center">
          <div className="bg-gradient-to-r from-blue-100 to-green-100 p-8 rounded-2xl shadow-lg text-center mb-8 max-w-lg w-full">
            <div className="text-6xl mb-4">🎯✨</div>
            <h2 className="text-4xl font-bold mb-4 text-blue-800">トレーニング終了！</h2>
            
            <div className="bg-white rounded-xl p-4 mb-4">
              <table className="w-full text-xl">
                <tbody>
                  <tr>
                    <td className="py-2 text-left">解いた問題数:</td>
                    <td className="py-2 text-right font-bold">{answeredQuestions}問</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-left">正解数:</td>
                    <td className="py-2 text-right font-bold">{correctAnswers}問</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-left">正解率:</td>
                    <td className="py-2 text-right font-bold">{calculateAccuracy()}%</td>
                  </tr>
                  <tr className="border-t-2 border-blue-200">
                    <td className="py-2 text-left font-bold text-blue-800">総得点:</td>
                    <td className="py-2 text-right font-bold text-blue-800 text-3xl">{score}点</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="text-2xl text-green-800 font-medium">
              今日も脳のトレーニングお疲れ様でした！
            </div>
          </div>
          
          <div className="flex gap-4 flex-wrap justify-center">
            <button
              className="px-6 py-4 bg-blue-600 text-white text-2xl rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg"
              onClick={initializeGame}
            >
              もう一度挑戦
            </button>
            
            <button
              className="px-6 py-4 bg-purple-600 text-white text-2xl rounded-xl font-bold hover:bg-purple-700 transition-colors shadow-lg"
              onClick={() => setGameState('menu')}
            >
              設定に戻る
            </button>
            
            <button
              className="px-6 py-4 bg-gray-700 text-white text-2xl rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg"
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

export default Game05;
