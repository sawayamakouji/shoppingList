import React, { useState, useRef, useEffect } from 'react';

interface Message {
  speaker: '孫' | 'おじいちゃん';
  text: string;
}

interface Item {
  id: number;
  name: string;
  location: string;
  scanned: boolean;
}

const initialItems: Item[] = [
  { id: 1, name: "ワンカップの誘惑", location: "酒売り場", scanned: false },
  { id: 2, name: "ついつい買っちまうな", location: "雑誌売り場", scanned: false },
];

type ConversationStep =
  | 'arrival'
  | 'inquiry'
  | 'findItem'
  | 'checkout'
  | 'done';

// 各メッセージをタイピングアニメーションで表示するコンポーネント（1行分）
const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
  const [displayedText, setDisplayedText] = useState("");
  
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      // インデックスが文字列の長さ未満の場合のみ文字を追加
      if (index < message.text.length) {
        setDisplayedText((prev) => prev + message.text[index]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 50); // 1文字50ms
    return () => clearInterval(interval);
  }, [message.text]);
  
  return (
    <div 
      style={{ 
        margin: '10px 0', 
        padding: '12px', 
        borderRadius: '10px', 
        backgroundColor: message.speaker === '孫' ? '#d0f0fd' : '#f0f0f0',
        fontSize: '22px'
      }}
    >
      <strong>{message.speaker}:</strong> {displayedText}
    </div>
  );
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
// 見た目のタイピング時間は文字数×50ms＋余裕の時間（ここでは500ms）とする
const computeDelay = (msg: Message) => msg.text.length * 50 + 500;

const ChatSimulation: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { speaker: '孫', text: 'おじいちゃん、店に着いた？' }
  ]);
  const [step, setStep] = useState<ConversationStep>('arrival');
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [items, setItems] = useState<Item[]>(initialItems);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // 新しいメッセージが追加されるたびに自動スクロール
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // メッセージを配列で順番に追加する関数
  const addSequentialMessages = async (msgs: Message[]) => {
    for (const msg of msgs) {
      setMessages(prev => [...prev, msg]);
      await delay(computeDelay(msg));
    }
  };

  // 「着いたよ」ボタンの処理（シーケンシャルに複数のセリフを追加）
  const handleArrival = async () => {
    // まずおじいちゃんの返事
    setMessages(prev => [...prev, { speaker: 'おじいちゃん', text: '着いたよ' }]);
    await delay(1000);
    // 孫のセリフを1行ずつ追加
    const msgs: Message[] = [
      { speaker: '孫', text: 'ほな、買物リストを表示するわ！' },
      { speaker: '孫', text: '【買物リスト】' },
      { speaker: '孫', text: '[1] ワンカップの誘惑 － 酒売り場' },
      { speaker: '孫', text: '[2] ついつい買っちまうな － 雑誌売り場' },
      { speaker: '孫', text: '【店内マップ】' },
      { speaker: '孫', text: '┌────────────┐' },
      { speaker: '孫', text: '│ [①] 酒売り場 │' },
      { speaker: '孫', text: '├────────────┤' },
      { speaker: '孫', text: '│ [②] 雑誌売り場 │' },
      { speaker: '孫', text: '└────────────┘' },
      { speaker: '孫', text: '店員さんに「お買い得情報」問い合わせする？' }
    ];
    await addSequentialMessages(msgs);
    setStep('inquiry');
  };

  // 問い合わせ回答用ボタンの処理
  const handleInquiryAnswer = async (answer: boolean) => {
    const msg1 = { speaker: 'おじいちゃん', text: answer ? '問い合わせするで' : '問い合わせせんわ' };
    setMessages(prev => [...prev, msg1]);
    await delay(computeDelay(msg1));
    if (answer) {
      await addSequentialMessages([
        { speaker: '孫', text: 'ええ情報あるで！' },
        { speaker: '孫', text: '酒売り場はセール中やし、雑誌売り場も今なら特典付きやで！' }
      ]);
    } else {
      await addSequentialMessages([{ speaker: '孫', text: '了解や、先に進もうや！' }]);
    }
    setStep('findItem');
    setMessages(prev => [...prev, { speaker: '孫', text: `「${items[currentItemIndex].name}」見つけた？` }]);
  };

  // 商品ピックアップ回答用ボタンの処理
  const handleFindItemAnswer = async (answer: boolean) => {
    if (answer) {
      const msg = { speaker: '孫', text: `グッジョブ！「${items[currentItemIndex].name}」をピックアップしたで！` };
      setMessages(prev => [...prev, msg]);
      await delay(computeDelay(msg));
      if (currentItemIndex + 1 < items.length) {
        const nextIndex = currentItemIndex + 1;
        setCurrentItemIndex(nextIndex);
        setMessages(prev => [...prev, { speaker: '孫', text: `「${items[nextIndex].name}」見つけた？` }]);
      } else {
        setStep('checkout');
        await addSequentialMessages([
          { speaker: '孫', text: '全部の商品ピックアップできたな！ほな、レジ行こか～' },
          { speaker: '孫', text: 'レジでボンタンとQRコードが表示されるから、スキャンしてもらってな！' },
          { speaker: '孫', text: 'おじいちゃん、レジでスキャンしたら「スキャン完了」ボタン押してな！' }
        ]);
      }
    } else {
      const msg = { speaker: '孫', text: 'まだか？もうちょい探してな、じいちゃん！' };
      setMessages(prev => [...prev, msg]);
      await delay(computeDelay(msg));
      setMessages(prev => [...prev, { speaker: '孫', text: `「${items[currentItemIndex].name}」見つけた？` }]);
    }
  };

  // レジ完了ボタンの処理
  const handleCheckout = async () => {
    await addSequentialMessages([
      { speaker: '孫', text: 'かいけい終了！リワードとポイントもゲットやで！' },
      { speaker: '孫', text: '無事におうちに帰るまでがクエストや。気ぃつけて帰ってな、じいちゃん！' }
    ]);
    setStep('done');
  };

  return (
    <div style={{ 
      padding: '30px', 
      fontFamily: '"Comic Sans MS", cursive, sans-serif', 
      maxWidth: '800px', 
      margin: '0 auto', 
      backgroundColor: '#FFF9E6', 
      borderRadius: '10px', 
      boxShadow: '0 0 10px rgba(0,0,0,0.1)' 
    }}>
      <h1 style={{ fontSize: '36px', textAlign: 'center', color: '#FF6347' }}>
        ショッピンクエスト - チャットシミュレーション
      </h1>
      <div
        ref={chatContainerRef}
        style={{
          border: '2px solid #ccc',
          padding: '20px',
          height: '500px',
          overflowY: 'scroll',
          backgroundColor: '#FFFDE7',
          borderRadius: '10px'
        }}
      >
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}
      </div>
      {step !== 'done' && (
        <>
          {step === 'arrival' && (
            <div style={{ marginTop: '30px', textAlign: 'center' }}>
              <button 
                onClick={handleArrival} 
                style={{ 
                  fontSize: '28px', 
                  padding: '20px 40px', 
                  borderRadius: '12px', 
                  backgroundColor: '#87CEFA', 
                  border: 'none', 
                  cursor: 'pointer' 
                }}
              >
                着いたよ
              </button>
            </div>
          )}
          {step === 'inquiry' && (
            <div style={{ marginTop: '30px', textAlign: 'center', display: 'flex', gap: '20px', justifyContent: 'center' }}>
              <button 
                onClick={() => handleInquiryAnswer(true)} 
                style={{ 
                  fontSize: '26px', 
                  padding: '20px 40px', 
                  borderRadius: '12px', 
                  backgroundColor: '#32CD32', 
                  border: 'none', 
                  cursor: 'pointer' 
                }}
              >
                問い合わせする
              </button>
              <button 
                onClick={() => handleInquiryAnswer(false)} 
                style={{ 
                  fontSize: '26px', 
                  padding: '20px 40px', 
                  borderRadius: '12px', 
                  backgroundColor: '#FF4500', 
                  border: 'none', 
                  cursor: 'pointer' 
                }}
              >
                問い合わせしない
              </button>
            </div>
          )}
          {step === 'findItem' && (
            <div style={{ marginTop: '30px', textAlign: 'center', display: 'flex', gap: '20px', justifyContent: 'center' }}>
              <button 
                onClick={() => handleFindItemAnswer(true)} 
                style={{ 
                  fontSize: '26px', 
                  padding: '20px 40px', 
                  borderRadius: '12px', 
                  backgroundColor: '#32CD32', 
                  border: 'none', 
                  cursor: 'pointer' 
                }}
              >
                見つけた！
              </button>
              <button 
                onClick={() => handleFindItemAnswer(false)} 
                style={{ 
                  fontSize: '26px', 
                  padding: '20px 40px', 
                  borderRadius: '12px', 
                  backgroundColor: '#FF4500', 
                  border: 'none', 
                  cursor: 'pointer' 
                }}
              >
                まだ…
              </button>
            </div>
          )}
          {step === 'checkout' && (
            <div style={{ marginTop: '30px', textAlign: 'center' }}>
              <button 
                onClick={handleCheckout} 
                style={{ 
                  fontSize: '28px', 
                  padding: '20px 40px', 
                  borderRadius: '12px', 
                  backgroundColor: '#FFD700', 
                  border: 'none', 
                  cursor: 'pointer' 
                }}
              >
                スキャン完了
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ChatSimulation;
