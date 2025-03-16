import React, { useState, useEffect, useRef } from 'react';

const TouchTypingGame = () => {
  const [gameState, setGameState] = useState('menu'); // menu, game, result
  const [difficulty, setDifficulty] = useState('easy');
  const [category, setCategory] = useState('kotowaza');
  const [currentText, setCurrentText] = useState('');
  const [inputText, setInputText] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [correctChars, setCorrectChars] = useState(0);
  const [totalChars, setTotalChars] = useState(0);
  const [completedTexts, setCompletedTexts] = useState(0);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [currentChar, setCurrentChar] = useState('');
  const inputRef = useRef(null);
  
  // 難易度設定
  const getDifficultyConfig = () => {
    switch (difficulty) {
      case 'easy':
        return {
          timeLimit: 60,
          textLength: 'short',
          hintLevel: 'high'
        };
      case 'medium':
        return {
          timeLimit: 90,
          textLength: 'medium',
          hintLevel: 'medium'
        };
      case 'hard':
        return {
          timeLimit: 120,
          textLength: 'long',
          hintLevel: 'low'
        };
      default:
        return {
          timeLimit: 60,
          textLength: 'short',
          hintLevel: 'high'
        };
    }
  };

  // カテゴリに基づいてテキストを取得
  const getTextsForCategory = () => {
    switch (category) {
      case 'kotowaza':
        return {
          short: [
            '石の上にも三年',
            '急がば回れ',
            '塵も積もれば山となる',
            '見ぬが花',
            '時は金なり',
            '犬も歩けば棒に当たる',
            '猿も木から落ちる',
            '論より証拠',
            '弘法も筆の誤り',
            '朱に交われば赤くなる'
          ],
          medium: [
            '石橋を叩いて渡る',
            '出る杭は打たれる',
            '早起きは三文の徳',
            '芸は身を助ける',
            '果報は寝て待て',
            '二兎を追う者は一兎をも得ず',
            '三つ子の魂百まで',
            '類は友を呼ぶ',
            '馬の耳に念仏',
            '捕らぬ狸の皮算用'
          ],
          long: [
            '悪銭身につかず',
            '去る者は日々に疎し',
            '切れ物には刃物の錆',
            '火のない所に煙は立たぬ',
            '情けは人のためならず',
            '短気は損気',
            '備えあれば憂いなし',
            '花より団子',
            '身から出た錆',
            '好きこそものの上手なれ'
          ]
        };
      case 'season':
        return {
          short: [
            '春の桜',
            '夏の花火',
            '秋の紅葉',
            '冬の雪景色',
            '春の小川',
            '夏の海',
            '秋の満月',
            '冬の温泉',
            '春の風',
            '夏の夕立'
          ],
          medium: [
            '春は桜が満開です',
            '夏は海水浴に行きます',
            '秋は紅葉狩りを楽しみます',
            '冬はこたつで温まります',
            '春の新緑は美しいです',
            '夏祭りの屋台が楽しみです',
            '秋の夜長に読書をします',
            '冬の雪景色は静かです',
            '春の訪れを感じる梅の花',
            '夏バテには気をつけましょう'
          ],
          long: [
            '春になると桜が咲いて心が弾みます',
            '夏の暑い日には冷たいスイカが美味しいです',
            '秋の夕暮れはどこか寂しい気持ちになります',
            '冬の朝は窓に霜が降りていることがあります',
            '春の雨は静かに大地を潤してくれます',
            '夏の夜空には綺麗な星が輝いています',
            '秋になると虫の声が聞こえてきます',
            '冬の雪の朝は世界が白く輝いています',
            '春の風は心を明るくしてくれます',
            '夏の海岸で波の音を聞くのは心地よいです'
          ]
        };
      case 'health':
        return {
          short: [
            '深呼吸',
            '水分補給',
            '適度な運動',
            '腹八分目',
            '早寝早起き',
            '姿勢を正す',
            '栄養バランス',
            '休息を取る',
            '笑顔が健康',
            '歩くことが大切'
          ],
          medium: [
            '毎日深呼吸をしましょう',
            '水をたくさん飲むことが大切です',
            '適度な運動を心がけましょう',
            '腹八分目で健康になります',
            '早寝早起きは健康の基本です',
            '正しい姿勢を保ちましょう',
            '栄養バランスを考えて食べましょう',
            '十分な休息を取ることが大切です',
            '笑顔は健康の源です',
            '一日三十分歩きましょう'
          ],
          long: [
            '毎日深呼吸をして心身をリフレッシュしましょう',
            '水分をこまめに取ることで体調を整えましょう',
            '適度な運動は健康な体を維持するのに役立ちます',
            '食事は腹八分目にして消化器官に負担をかけないようにしましょう',
            '早寝早起きを心がけてリズムのある生活を送りましょう',
            '姿勢を正すことで腰や肩の痛みを防ぐことができます',
            '栄養バランスの良い食事で健康な体を作りましょう',
            '適切な休息を取ることで疲れを溜めないようにしましょう',
            '笑顔でいることで免疫力が上がるとも言われています',
            '毎日歩くことで足腰を強くし健康を維持しましょう'
          ]
        };
      default:
        return {
          short: ['こんにちは', 'ありがとう', 'さようなら'],
          medium: ['今日はいい天気ですね', 'おいしい料理ですね', 'また会いましょう'],
          long: ['日本の四季は本当に美しいですね', '健康で過ごすことが一番大切です', '毎日少しずつ成長していきたいですね']
        };
    }
  };

  // ランダムなテキストを取得
  const getRandomText = () => {
    const config = getDifficultyConfig();
    const texts = getTextsForCategory();
    const textArray = texts[config.textLength];
    return textArray[Math.floor(Math.random() * textArray.length)];
  };

  // ゲームの初期化
  const initializeGame = () => {
    const config = getDifficultyConfig();
    setTimeLeft(config.timeLimit);
    setScore(0);
    setCorrectChars(0);
    setTotalChars(0);
    setCompletedTexts(0);
    setInputText('');
    setCurrentText(getRandomText());
    setGameState('game');
  };

  // 次のテキストに進む
  const nextText = () => {
    setInputText('');
    setCurrentText(getRandomText());
    setCompletedTexts(completedTexts + 1);
  };

  // テキスト入力処理
  const handleTextChange = (e) => {
    const newText = e.target.value;
    setInputText(newText);

    // 次の文字をハイライト表示するために設定
    if (newText.length < currentText.length) {
      setCurrentChar(currentText[newText.length]);
    } else {
      setCurrentChar('');
    }
    
    // 入力が完了したか確認
    if (newText === currentText) {
      // 正解としてカウント
      setCorrectChars(correctChars + newText.length);
      setTotalChars(totalChars + newText.length);
      
      // スコア計算：タイプした文字数 × 10点
      setScore(score + newText.length * 10);
      
      // 次のテキストへ
      setTimeout(nextText, 500);
    } else if (newText.length > 0) {
      // 入力中の正誤判定
      let correct = 0;
      for (let i = 0; i < newText.length; i++) {
        if (i < currentText.length && newText[i] === currentText[i]) {
          correct++;
        }
      }
      
      // 総タイプ文字数を更新
      setTotalChars(totalChars + 1);
      
      // 正確なタイプ文字数を更新
      if (newText.length <= currentText.length && newText[newText.length - 1] === currentText[newText.length - 1]) {
        setCorrectChars(correctChars + 1);
      }
    }
  };

  // 仮想キーボードの入力処理
  const handleVirtualKeyPress = (char) => {
    // 特殊キーの処理
    if (char === '←') {
      // バックスペース
      setInputText(inputText.slice(0, -1));
    } else if (char === '空白') {
      // スペース
      const newText = inputText + ' ';
      setInputText(newText);
      
      // 次の文字をハイライト表示するために設定
      if (newText.length < currentText.length) {
        setCurrentChar(currentText[newText.length]);
      } else {
        setCurrentChar('');
      }
      
      // 入力が完了したか確認
      if (newText === currentText) {
        setCorrectChars(correctChars + newText.length);
        setTotalChars(totalChars + newText.length);
        setScore(score + newText.length * 10);
        setTimeout(nextText, 500);
      }
    } else {
      // 通常の文字
      const newText = inputText + char;
      setInputText(newText);
      
      // 次の文字をハイライト表示するために設定
      if (newText.length < currentText.length) {
        setCurrentChar(currentText[newText.length]);
      } else {
        setCurrentChar('');
      }
      
      // 入力が完了したか確認
      if (newText === currentText) {
        setCorrectChars(correctChars + newText.length);
        setTotalChars(totalChars + newText.length);
        setScore(score + newText.length * 10);
        setTimeout(nextText, 500);
      } else {
        // 総タイプ文字数を更新
        setTotalChars(totalChars + 1);
        
        // 正確なタイプ文字数を更新
        if (newText.length <= currentText.length && newText[newText.length - 1] === currentText[newText.length - 1]) {
          setCorrectChars(correctChars + 1);
        }
      }
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

  // 現在のテキストが変わったときにフォーカスを設定
  useEffect(() => {
    if (gameState === 'game' && inputRef.current) {
      inputRef.current.focus();
      
      // 次の文字をハイライト表示するために設定
      if (inputText.length < currentText.length) {
        setCurrentChar(currentText[inputText.length]);
      } else {
        setCurrentChar('');
      }
    }
  }, [currentText, gameState]);

  // 正確率の計算
  const calculateAccuracy = () => {
    if (totalChars === 0) return 100;
    return Math.round((correctChars / totalChars) * 100);
  };

  // 文字を色分けして表示
  const renderColoredText = () => {
    return (
      <div className="text-3xl font-bold tracking-wider">
        {currentText.split('').map((char, index) => {
          let color = 'text-gray-800'; // デフォルト色
          
          if (index < inputText.length) {
            color = inputText[index] === char ? 'text-green-600' : 'text-red-600';
          } else if (index === inputText.length) {
            color = 'text-blue-600 bg-yellow-200 px-1 animate-pulse';
          }
          
          return (
            <span key={index} className={color}>
              {char}
            </span>
          );
        })}
      </div>
    );
  };

  // 仮想キーボードを表示
  const renderVirtualKeyboard = () => {
    // ひらがな
    const hiraganaRows = [
      ['あ', 'い', 'う', 'え', 'お'],
      ['か', 'き', 'く', 'け', 'こ'],
      ['さ', 'し', 'す', 'せ', 'そ'],
      ['た', 'ち', 'つ', 'て', 'と'],
      ['な', 'に', 'ぬ', 'ね', 'の'],
      ['は', 'ひ', 'ふ', 'へ', 'ほ'],
      ['ま', 'み', 'む', 'め', 'も'],
      ['や', 'ゆ', 'よ', 'わ', 'を', 'ん'],
      ['が', 'ぎ', 'ぐ', 'げ', 'ご'],
      ['ざ', 'じ', 'ず', 'ぜ', 'ぞ'],
      ['だ', 'ぢ', 'づ', 'で', 'ど'],
      ['ば', 'び', 'ぶ', 'べ', 'ぼ'],
      ['ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ'],
      ['ー', '、', '。', '！', '？']
    ];

    // 特殊キー
    const specialKeys = [
      { label: '空白', value: '空白', className: 'bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg border border-gray-400 text-lg font-bold w-20' },
      { label: '←', value: '←', className: 'bg-red-200 hover:bg-red-300 text-red-800 py-2 px-4 rounded-lg border border-red-400 text-lg font-bold w-20' }
    ];

    return (
      <div className="mt-4 bg-gray-100 p-3 rounded-xl max-w-md mx-auto">
        <div className="mb-2 flex justify-between">
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm"
            onClick={() => setShowKeyboard(!showKeyboard)}
          >
            {showKeyboard ? 'キーボードを隠す' : 'キーボードを表示'}
          </button>
        </div>
        
        {showKeyboard && (
          <div className="bg-gray-50 p-2 rounded-lg">
            <div className="overflow-y-auto max-h-64">
              {hiraganaRows.map((row, index) => (
                <div key={index} className="flex flex-wrap justify-center gap-1 mb-1">
                  {row.map(char => (
                    <button
                      key={char}
                      className="bg-white hover:bg-blue-100 text-blue-800 font-bold py-2 px-3 rounded-lg border border-blue-300 text-xl transition-colors w-10 h-10 flex items-center justify-center"
                      onClick={() => handleVirtualKeyPress(char)}
                    >
                      {char}
                    </button>
                  ))}
                </div>
              ))}
            </div>
            
            <div className="flex justify-center gap-2 mt-2">
              {specialKeys.map(key => (
                <button
                  key={key.value}
                  className={key.className}
                  onClick={() => handleVirtualKeyPress(key.value)}
                >
                  {key.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-purple-50 min-h-screen">
      {/* ゲーム状態に応じた戻るボタンの処理 */}
      <div className="w-full max-w-xl mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mb-2">
          <h1 className="text-4xl font-bold text-blue-800">
            ⌨️ タイピングゲーム
          </h1>
          <div className="flex gap-2">
            <button
              className="px-3 py-2 bg-blue-700 text-white text-lg rounded-xl font-bold hover:bg-blue-800 transition-colors shadow-md"
              onClick={() => {
                if (gameState === 'game') {
                  // ゲーム中ならメニューに戻る
                  setGameState('menu');
                } else if (gameState === 'result') {
                  // 結果画面ならメニューに戻る
                  setGameState('menu');
                } else {
                  // それ以外の場合はブラウザの戻るを実行
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
          <h2 className="text-3xl font-semibold mb-6 text-center">タイピングゲーム</h2>
          
          <div className="mb-6">
            <h3 className="text-2xl font-semibold mb-3 text-blue-700">カテゴリを選ぶ</h3>
            <div className="flex flex-col gap-3">
              <button
                className={`px-5 py-4 text-2xl rounded-xl font-bold transition-colors ${category === 'kotowaza' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700'}`}
                onClick={() => setCategory('kotowaza')}
              >
                ことわざ 📜
              </button>
              <button
                className={`px-5 py-4 text-2xl rounded-xl font-bold transition-colors ${category === 'season' ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-700'}`}
                onClick={() => setCategory('season')}
              >
                四季・季節 🌸
              </button>
              <button
                className={`px-5 py-4 text-2xl rounded-xl font-bold transition-colors ${category === 'health' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-700'}`}
                onClick={() => setCategory('health')}
              >
                健康 ❤️
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
                かんたん (短い文) 👵
              </button>
              <button
                className={`px-5 py-4 text-2xl rounded-xl font-bold transition-colors ${difficulty === 'medium' ? 'bg-yellow-500 text-white' : 'bg-yellow-100 text-yellow-700'}`}
                onClick={() => setDifficulty('medium')}
              >
                ふつう (中くらいの文) 🧓
              </button>
              <button
                className={`px-5 py-4 text-2xl rounded-xl font-bold transition-colors ${difficulty === 'hard' ? 'bg-red-500 text-white' : 'bg-red-100 text-red-700'}`}
                onClick={() => setDifficulty('hard')}
              >
                むずかしい (長い文) 🏆
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
              <li>- 表示された文章を打ち込みましょう</li>
              <li>- 青く表示された文字を入力します</li>
              <li>- 正しい文字は緑、間違いは赤で表示</li>
              <li>- 制限時間内に多くの文章を打とう！</li>
              <li>- 画面下のキーボードも使えます</li>
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
            <div className="mb-8">
              {renderColoredText()}
            </div>
            
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                className="w-full py-4 px-3 text-2xl border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                value={inputText}
                onChange={handleTextChange}
                placeholder="ここにタイプしてください"
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck="false"
              />
              
              {currentChar && (
                <div className="absolute left-0 right-0 -bottom-10 text-center">
                  <span className="text-2xl text-blue-600 bg-yellow-100 px-2 py-1 rounded">
                    次は「{currentChar}」を入力
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-lg w-full mb-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-800">正確率</div>
                <div className="text-2xl font-bold text-blue-600">{calculateAccuracy()}%</div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded-lg">
                <div className="text-sm text-green-800">完了した文</div>
                <div className="text-2xl font-bold text-green-600">{completedTexts}</div>
              </div>
            </div>
          </div>
          
          {renderVirtualKeyboard()}
        </div>
      )}
      
      {gameState === 'result' && (
        <div className="flex flex-col items-center">
          <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-8 rounded-2xl shadow-lg text-center mb-8 max-w-lg w-full">
            <div className="text-6xl mb-4">⌨️✨</div>
            <h2 className="text-4xl font-bold mb-4 text-purple-800">タイピング完了！</h2>
            
            <div className="bg-white rounded-xl p-4 mb-4">
              <table className="w-full text-xl">
                <tbody>
                  <tr>
                    <td className="py-2 text-left">打った文字数:</td>
                    <td className="py-2 text-right font-bold">{totalChars}文字</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-left">正確に打った文字:</td>
                    <td className="py-2 text-right font-bold">{correctChars}文字</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-left">正確率:</td>
                    <td className="py-2 text-right font-bold">{calculateAccuracy()}%</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-left">完了した文:</td>
                    <td className="py-2 text-right font-bold">{completedTexts}個</td>
                  </tr>
                  <tr className="border-t-2 border-purple-200">
                    <td className="py-2 text-left font-bold text-purple-800">総得点:</td>
                    <td className="py-2 text-right font-bold text-purple-800 text-3xl">{score}点</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="text-2xl text-green-800 font-medium">
              今日も指のトレーニングお疲れ様でした！
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

export default TouchTypingGame;
