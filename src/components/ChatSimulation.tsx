import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MapDisplay from './MapDisplay';

interface Message {
  speaker: '😊' | 'あなた';
  text: string;
}

export interface Item {
  id: number;
  name: string;
  location: string;
  scanned: boolean;
}

const initialItems: Item[] = [
  { id: 1, name: "牛乳", location: "乳製品コーナー", scanned: false },
  { id: 2, name: "パン", location: "ベーカリー", scanned: false },
  { id: 3, name: "卵", location: "生鮮コーナー", scanned: false },
  { id: 4, name: "コーヒー", location: "飲料コーナー", scanned: false },
];

type ConversationStep =
  | 'arrival'
  | 'inquiry'
  | 'findItem'
  | 'checkout'
  | 'done';

const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
  const [displayedText, setDisplayedText] = useState("");
  const timerRef = useRef<number>();

  useEffect(() => {
    setDisplayedText("");
    let index = 0;
    const typeChar = () => {
      if (index < message.text.length) {
        setDisplayedText(message.text.slice(0, index + 1));
        index++;
        timerRef.current = window.setTimeout(typeChar, 50);
      }
    };
    typeChar();
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [message.text]);

  return (
    <div 
      style={{ 
        margin: '10px 0', 
        padding: '12px', 
        borderRadius: '10px', 
        backgroundColor: message.speaker === '😊' ? '#d0f0fd' : '#f0f0f0',
        fontSize: '22px'
      }}
    >
      <strong>{message.speaker}:</strong> {displayedText}
    </div>
  );
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
const computeDelay = (msg: Message) => msg.text.length * 50 + 500;

const ChatSimulation: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    { speaker: '😊', text: '店に着いた？' }
  ]);
  const [step, setStep] = useState<ConversationStep>('arrival');
  const [responseVisible, setResponseVisible] = useState(true);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [items, setItems] = useState<Item[]>(initialItems);
  const [mapVisible, setMapVisible] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // 固定高さのチャットエリア（200px）で最新行が見えるように
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const addSequentialMessages = async (msgs: Message[]) => {
    for (const msg of msgs) {
      setMessages(prev => [...prev, msg]);
      await delay(computeDelay(msg));
    }
  };

  const handleArrival = async () => {
    setResponseVisible(false);
    setMessages(prev => [...prev, { speaker: 'あなた', text: '着いたよ' }]);
    await delay(1000);
    const msgs1: Message[] = [
      { speaker: '😊', text: 'ほな、買物リストを表示するわ！' },
      { speaker: '😊', text: '【買物リスト】' },
      { speaker: '😊', text: '[1] 牛乳 － 乳製品コーナー' },
      { speaker: '😊', text: '[2] パン － ベーカリー' },
      { speaker: '😊', text: '[3] 卵 － 生鮮コーナー' },
      { speaker: '😊', text: '[4] コーヒー － 飲料コーナー' },
      { speaker: '😊', text: '【店内マップ】' },
      { speaker: '😊', text: '下にマップ表示したよー' }
    ];
    await addSequentialMessages(msgs1);
    setMapVisible(true);
    setMessages(prev => [...prev, { speaker: '😊', text: '店員さんに「お買い得情報」問い合わせする？' }]);
    setStep('inquiry');
    setResponseVisible(true);
  };

  const handleInquiryAnswer = async (answer: boolean) => {
    setResponseVisible(false);
    const msg1: Message = { speaker: 'あなた', text: answer ? '問い合わせするで' : '問い合わせせんわ' };
    setMessages(prev => [...prev, msg1]);
    await delay(computeDelay(msg1));
    if (answer) {
      await addSequentialMessages([
        { speaker: '😊', text: 'ええ情報あるで！' },
        { speaker: '😊', text: '乳製品コーナーはセール中やし、ベーカリーも今なら特典付きやで！' }
      ]);
    } else {
      await addSequentialMessages([{ speaker: '😊', text: '了解や、先に進もうや！' }]);
    }
    setStep('findItem');
    setMessages(prev => [...prev, { speaker: '😊', text: `「${items[currentItemIndex].name}」見つけた？` }]);
    setResponseVisible(true);
  };

  const handleFindItemAnswer = async (answer: boolean) => {
    setResponseVisible(false);
    if (answer) {
      setItems(prevItems =>
        prevItems.map((item, idx) =>
          idx === currentItemIndex ? { ...item, scanned: true } : item
        )
      );
      const msg: Message = { speaker: '😊', text: `グッジョブ！「${items[currentItemIndex].name}」をピックアップしたで！` };
      setMessages(prev => [...prev, msg]);
      await delay(computeDelay(msg));
      if (currentItemIndex + 1 < items.length) {
        const nextIndex = currentItemIndex + 1;
        setCurrentItemIndex(nextIndex);
        setMessages(prev => [...prev, { speaker: '😊', text: `「${items[nextIndex].name}」見つけた？` }]);
      } else {
        setStep('checkout');
        await addSequentialMessages([
          { speaker: '😊', text: '全部の商品ピックアップできたな！ほな、レジ行こか～' },
          { speaker: '😊', text: 'レジでボンタンとQRコードが表示されるから、スキャンしてもらってな！' },
          { speaker: '😊', text: 'レジでスキャンしたら「スキャン完了」ボタン押してな！' }
        ]);
      }
    } else {
      const msg: Message = { speaker: '😊', text: 'まだか？遠慮なく店員さんに聞いてな！' };
      setMessages(prev => [...prev, msg]);
      await delay(computeDelay(msg));
      setMessages(prev => [...prev, { speaker: '😊', text: `「${items[currentItemIndex].name}」見つけた？` }]);
    }
    setResponseVisible(true);
  };

  const handleCheckout = async () => {
    setResponseVisible(false);
    await addSequentialMessages([
      { speaker: '😊', text: 'かいけい終了！リワードとポイントもゲットやで！' },
      { speaker: '😊', text: '無事におうちに帰るまでがクエストや。気ぃつけて帰ってな！' }
    ]);
    setStep('done');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '10px' }}>
      {/* 固定高さのチャット画面（200px） */}
      <div 
        ref={chatContainerRef}
        style={{ 
          height: '200px',
          overflowY: 'auto', 
          border: '2px solid #ccc', 
          padding: '20px', 
          backgroundColor: '#FFFDE7', 
          borderRadius: '10px' 
        }}
      >
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}
      </div>
      {/* 返答選択ボタン用の固定高さコンテナ（例：80px） */}
      <div style={{ minHeight: '80px', marginTop: '10px', textAlign: 'center' }}>
        {step === 'arrival' && responseVisible && (
          <button 
            onClick={handleArrival} 
            style={{ fontSize: '28px', padding: '20px 40px', borderRadius: '12px', backgroundColor: '#87CEFA', border: 'none', cursor: 'pointer' }}
          >
            着いたよ
          </button>
        )}
        {step === 'inquiry' && responseVisible && (
          <>
            <button 
              onClick={() => handleInquiryAnswer(true)} 
              style={{ fontSize: '26px', padding: '20px 40px', borderRadius: '12px', backgroundColor: '#32CD32', border: 'none', cursor: 'pointer' }}
            >
              問い合わせする
            </button>
            <button 
              onClick={() => handleInquiryAnswer(false)} 
              style={{ fontSize: '26px', padding: '20px 40px', borderRadius: '12px', backgroundColor: '#FF4500', border: 'none', cursor: 'pointer', marginLeft: '20px' }}
            >
              問い合わせしない
            </button>
          </>
        )}
        {step === 'findItem' && responseVisible && (
          <>
            <button 
              onClick={() => handleFindItemAnswer(true)} 
              style={{ fontSize: '26px', padding: '20px 40px', borderRadius: '12px', backgroundColor: '#32CD32', border: 'none', cursor: 'pointer' }}
            >
              見つけた！
            </button>
            <button 
              onClick={() => handleFindItemAnswer(false)} 
              style={{ fontSize: '26px', padding: '20px 40px', borderRadius: '12px', backgroundColor: '#FF4500', border: 'none', cursor: 'pointer', marginLeft: '20px' }}
            >
              まだ…
            </button>
          </>
        )}
        {step === 'checkout' && responseVisible && (
          <button 
            onClick={handleCheckout} 
            style={{ fontSize: '28px', padding: '20px 40px', borderRadius: '12px', backgroundColor: '#FFD700', border: 'none', cursor: 'pointer' }}
          >
            スキャン完了
          </button>
        )}
        {step === 'done' && (
          <button 
            onClick={() => navigate('/')}
            style={{ fontSize: '28px', padding: '20px 40px', borderRadius: '12px', backgroundColor: '#8A2BE2', border: 'none', cursor: 'pointer' }}
          >
            ミッション完了！ TOPへ戻る
          </button>
        )}
      </div>
      {/* 常に画面最下部にマップ表示（mapVisible が true の場合） */}
      {mapVisible && (
        <div style={{ marginTop: '10px' }}>
          <MapDisplay items={items} />
        </div>
      )}
    </div>
  );
};

export default ChatSimulation;
