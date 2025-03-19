import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import MapDisplay from './MapDisplay';
import { supabase } from '../lib/supabase';
import qrCode from '../images/qr-code.png';


interface Message {
  speaker: '😊' | 'あなた';
  text: string;
}

export interface Item {
  id: number;
  name: string;
  location?: string; 
  scanned: boolean;
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
const computeDelay = (msg: Message) => msg.text.length * 50 + 500;

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

const ChatSimulation: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    { speaker: '😊', text: 'お店にお着きになりましたか？' }
  ]);
  const [step, setStep] = useState<'arrival' | 'inquiry' | 'findItem' | 'checkout' | 'done'>('arrival');
  const [responseVisible, setResponseVisible] = useState(true);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [items, setItems] = useState<Item[]>([]);
  const [mapVisible, setMapVisible] = useState(false);
  const [qrVisible, setQrVisible] = useState(false);
  const [positions, setPositions] = useState<Record<number, { left: number; top: number }>>({});
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // チャットエリアを最新行までスクロール
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Supabaseから買い物リスト取得
  useEffect(() => {
    async function fetchItems() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data, error } = await supabase
          .from('shopping_items')
          .select('*')
          .order('created_at', { ascending: true });
        if (error) throw error;
        const fetchedItems: Item[] = (data || []).map((d: any) => ({
          id: d.id,
          name: d.name,
          location: d.category || '未設定',
          scanned: false,
        }));
        setItems(fetchedItems);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    }
    fetchItems();
  }, []);

  // itemsが取得されたら、一度だけ各商品の座標を生成する
  useEffect(() => {
    if (items.length > 0 && Object.keys(positions).length === 0) {
      const pos: Record<number, { left: number; top: number }> = {};
      items.forEach(item => {
        pos[item.id] = {
          left: Math.random() * 80 + 10,
          top: Math.random() * 80 + 10,
        };
      });
      setPositions(pos);
    }
  }, [items, positions]);

  // itemsをpositionsに基づいて、topの小さい順にソートする
  const sortedData = useMemo(() => {
    if (items.length === 0 || Object.keys(positions).length === 0) {
      return { sorted: [] as Item[], positions: {} as Record<number, { left: number; top: number }> };
    }
    const sorted = [...items].sort((a, b) => positions[a.id].top - positions[b.id].top);
    return { sorted, positions };
  }, [items, positions]);

  const addSequentialMessages = async (msgs: Message[]) => {
    for (const msg of msgs) {
      setMessages(prev => [...prev, msg]);
      await delay(computeDelay(msg));
    }
  };

  const handleArrival = async () => {
    setResponseVisible(false);
    setMessages(prev => [...prev, { speaker: 'あなた', text: '着きました' }]);
    await delay(1000);
    const listMessages: Message[] = [
      { speaker: '😊', text: 'では、買い物リストを表示いたしますね。' },
      { speaker: '😊', text: '【買い物リスト】' },
    ];
    sortedData.sorted.forEach((item, index) => {
      listMessages.push({ speaker: '😊', text: `[${index + 1}] ${item.name} － ${item.location}` });
    });
    listMessages.push(
      { speaker: '😊', text: '【店内マップ】' },
      { speaker: '😊', text: '下にマップを表示いたしました。' }
    );
    await addSequentialMessages(listMessages);
    setMapVisible(true);
    setMessages(prev => [...prev, { speaker: '😊', text: '店員さんに「お買い得情報」を問い合わせいたしますか？' }]);
    setStep('inquiry');
    setResponseVisible(true);
  };

  const handleInquiryAnswer = async (answer: boolean) => {
    setResponseVisible(false);
  
    const userMessage: Message = { speaker: 'あなた', text: answer ? '問い合わせします' : '問い合わせはいたしません' };
    
    setMessages(prev => [...prev, userMessage]);
  
    // レンダリングを待つために短いディレイを入れる
    await delay(200);
  
    if (answer) {
      await addSequentialMessages([
        { speaker: '😊', text: '良い情報がございます。乳製品コーナーはセール中、またベーカリーにも特典がございます。' }
      ]);
    } else {
      await addSequentialMessages([{ speaker: '😊', text: 'かしこまりました。では、次に進みますね。' }]);
    }
  
    setStep('findItem');
    setMessages(prev => [...prev, { speaker: '😊', text: `「${sortedData.sorted[currentItemIndex].name}」は見つかりましたか？` }]);
  
    setResponseVisible(true);
  };

  const handleFindItemAnswer = async (answer: boolean) => {
    setResponseVisible(false);
    if (answer) {
      // scanned状態を更新
      setItems(prevItems =>
        prevItems.map(item =>
          item.id === sortedData.sorted[currentItemIndex].id ? { ...item, scanned: true } : item
        )
      );
      const msg: Message = { speaker: '😊', text: `素晴らしいです。「${sortedData.sorted[currentItemIndex].name}」をピックアップいただきましたね。` };
      setMessages(prev => [...prev, msg]);
      await delay(computeDelay(msg));
      if (currentItemIndex + 1 < sortedData.sorted.length) {
        const nextIndex = currentItemIndex + 1;
        setCurrentItemIndex(nextIndex);
        setMessages(prev => [...prev, { speaker: '😊', text: `「${sortedData.sorted[nextIndex].name}」は見つかりましたか？` }]);
      } else {
        setStep('checkout');
        setMapVisible(false);
        setQrVisible(true);
        await addSequentialMessages([
          { speaker: '😊', text: 'すべての商品をピックアップいただきましたね。' },
          { speaker: '😊', text: 'レジでQRコードをスキャンいただき、その後「スキャン完了」ボタンを押してください。' }
        ]);
      }
    } else {
      const msg: Message = { speaker: '😊', text: 'まだ見つかっていないようです。お近くの店員さんにお尋ねくださいませ。' };
      setMessages(prev => [...prev, msg]);
      await delay(computeDelay(msg));
      setMessages(prev => [...prev, { speaker: '😊', text: `「${sortedData.sorted[currentItemIndex].name}」は見つかりましたか？` }]);
    }
    setResponseVisible(true);
  };

  const handleCheckout = async () => {
    setResponseVisible(false);
    await addSequentialMessages([
      { speaker: '😊', text: 'レジ精算が完了いたしました。'},
      { speaker: '😊', text: 'ご利用ありがとうございました。 リワードとポイントを獲得されました。どうぞお気をつけてお帰りくださいませ。' }
    ]);
    setStep('done');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '10px' }}>
      {/* チャット画面 */}
      <div 
  ref={chatContainerRef}
  style={{ 
    height: '40vh',          // 画面高さの40%程度にする（スマホでは十分な高さになることが多い）
    minHeight: '200px',       // 最低でも200pxは確保
    overflowY: 'auto', 
    border: '2px solid #ccc', 
    padding: '20px', 
    paddingBottom: '80px',    // 下部に余白を追加（ボタンエリアなどとの重なりを防ぐ）
    backgroundColor: '#FFFDE7', 
    borderRadius: '10px' 
  }}
>
  {messages.map((msg, index) => (
    <ChatMessage key={index} message={msg} />
  ))}
</div>
      {/* ボタンエリア */}
      <div style={{ minHeight: '80px', marginTop: '10px', textAlign: 'center' }}>
        {step === 'arrival' && responseVisible && (
          <button 
            onClick={handleArrival} 
            style={{ fontSize: '28px', padding: '20px 40px', borderRadius: '12px', backgroundColor: '#87CEFA', border: 'none', cursor: 'pointer' }}
          >
            着きました
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
      {/* マップまたはQRコード表示 */}
      <div style={{ marginTop: '10px', textAlign: 'center',display: 'flex', justifyContent: 'center' }}>
        {qrVisible ? (
          <img src={qrCode} alt="QR Code" style={{ width: '200px', height: '200px' }} />
        ) : (
          mapVisible && <MapDisplay items={sortedData.sorted} positions={sortedData.positions} currentItemId={sortedData.sorted[currentItemIndex]?.id} />
        )}
      </div>
    </div>
  );
};

export default ChatSimulation;
