import React, { useState } from 'react';
import { Send, MessageCircle, ThumbsUp, ThumbsDown, Smile, Frown, Heart, Mail, User, Phone, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function King() {
const navigate = useNavigate();

  // 状態管理
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    inquiryType: 'question',
  });
  const [step, setStep] = useState(1); // 1: 気分選択, 2: フォーム入力, 3: 送信完了
  const [mood, setMood] = useState('neutral');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jokeIndex, setJokeIndex] = useState(0);
  
  // ユーモアのある応答メッセージ
  const funnyResponses = {
    question: [
      "なるほど、素晴らしい質問ですね！担当者が眠りから覚めたら回答します。",
      "その質問、私たちのAIにも答えられません。人間の担当者が考えます。",
      "質問を受け付けました！答えを知るまで、お茶でも飲みながらお待ちください。"
    ],
    complaint: [
      "おっと、ご不満を感じさせてしまったようですね。担当者を叩き起こします！",
      "クレームですって？担当者が震えながら対応準備中です。",
      "ご不満、承りました。担当者は現在、あなたの怒りに耐えられる精神力を鍛えています。"
    ],
    praise: [
      "わぁ、褒めていただきありがとうございます！担当者が舞い上がって天井に届きそうです。",
      "素晴らしい言葉をありがとうございます！このままだと担当者の頭が大きくなりそうです。",
      "称賛のお言葉、ありがとうございます！担当者に転送...あ、感動で倒れました。"
    ],
    other: [
      "興味深いお問い合わせですね。解読班が急いで分析中です。",
      "なるほど！...というふりをしていますが、実は担当者も混乱しています。",
      "このお問い合わせ、社内会議で議論になりそうです。準備しておきます。"
    ]
  };
  
  // ジョークの配列
  const jokes = [
    {
      setup: "なぜプログラマーはメガネをかけているのでしょう？",
      punchline: "C言語が見えないからです！"
    },
    {
      setup: "バグはどうやって修正するの？",
      punchline: "デバッガー（虫取り）スプレーを使います！"
    },
    {
      setup: "プログラマーはなぜ社交的になれないの？",
      punchline: "オブジェクト指向だからです！"
    },
    {
      setup: "コンピューターが風邪をひくとどうなる？",
      punchline: "ハードディスクがくしゃみをします！"
    },
    {
      setup: "データベースの管理者が飲み会で注文するものは？",
      punchline: "「ビールをSELECT」です！"
    }
  ];
  
  // 別のジョークを表示
  const showNextJoke = () => {
    setJokeIndex((prevIndex) => (prevIndex + 1) % jokes.length);
  };
  
  // ムードに基づくカラーテーマの取得
  const getMoodTheme = () => {
    switch (mood) {
      case 'happy':
        return {
          primary: 'bg-amber-600',
          secondary: 'bg-amber-100',
          text: 'text-amber-900',
          border: 'border-amber-400',
          hover: 'hover:bg-amber-700',
          icon: <Smile className="text-amber-600" />
        };
      case 'angry':
        return {
          primary: 'bg-red-600',
          secondary: 'bg-red-100',
          text: 'text-red-900',
          border: 'border-red-400',
          hover: 'hover:bg-red-700',
          icon: <ThumbsDown className="text-red-600" />
        };
      case 'sad':
        return {
          primary: 'bg-blue-600',
          secondary: 'bg-blue-100',
          text: 'text-blue-900',
          border: 'border-blue-400',
          hover: 'hover:bg-blue-700',
          icon: <Frown className="text-blue-600" />
        };
      case 'inLove':
        return {
          primary: 'bg-pink-600',
          secondary: 'bg-pink-100',
          text: 'text-pink-900',
          border: 'border-pink-400',
          hover: 'hover:bg-pink-700',
          icon: <Heart className="text-pink-600" />
        };
      default:
        return {
          primary: 'bg-indigo-600',
          secondary: 'bg-indigo-100',
          text: 'text-indigo-900',
          border: 'border-indigo-400',
          hover: 'hover:bg-indigo-700',
          icon: <MessageCircle className="text-indigo-600" />
        };
    }
  };
  
  const theme = getMoodTheme();
  
  // フォームの入力変更を処理
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // エラーがあれば消去
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };
  
  // フォームのバリデーション
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'お名前を入力してください';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'メールアドレスを入力してください';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'メッセージを入力してください';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // フォーム送信処理
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // 送信処理をシミュレート
    setTimeout(() => {
      console.log({ ...formData, mood });
      setIsSubmitting(false);
      setStep(3); // 完了ステップへ
    }, 1500);
  };
  
  // ステップ1: 気分選択
  const renderMoodSelector = () => {
    return (
      <div className="flex flex-col items-center max-w-md mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">今日のお気分を教えてください</h2>
        
        <div className="grid grid-cols-2 gap-6 w-full mb-8">
          <button
            className={`flex flex-col items-center p-6 rounded-xl transition-all duration-300 ${mood === 'happy' ? 'bg-amber-200 border-4 border-amber-500 scale-105' : 'bg-white border-4 border-gray-300 hover:border-amber-400'}`}
            onClick={() => setMood('happy')}
          >
            <Smile size={60} className="text-amber-600 mb-3" />
            <span className="text-2xl font-bold text-gray-900">ハッピー</span>
          </button>
          
          <button
            className={`flex flex-col items-center p-6 rounded-xl transition-all duration-300 ${mood === 'angry' ? 'bg-red-200 border-4 border-red-500 scale-105' : 'bg-white border-4 border-gray-300 hover:border-red-400'}`}
            onClick={() => setMood('angry')}
          >
            <ThumbsDown size={60} className="text-red-600 mb-3" />
            <span className="text-2xl font-bold text-gray-900">イライラ</span>
          </button>
          
          <button
            className={`flex flex-col items-center p-6 rounded-xl transition-all duration-300 ${mood === 'sad' ? 'bg-blue-200 border-4 border-blue-500 scale-105' : 'bg-white border-4 border-gray-300 hover:border-blue-400'}`}
            onClick={() => setMood('sad')}
          >
            <Frown size={60} className="text-blue-600 mb-3" />
            <span className="text-2xl font-bold text-gray-900">しょんぼり</span>
          </button>
          
          <button
            className={`flex flex-col items-center p-6 rounded-xl transition-all duration-300 ${mood === 'inLove' ? 'bg-pink-200 border-4 border-pink-500 scale-105' : 'bg-white border-4 border-gray-300 hover:border-pink-400'}`}
            onClick={() => setMood('inLove')}
          >
            <Heart size={60} className="text-pink-600 mb-3" />
            <span className="text-2xl font-bold text-gray-900">ウキウキ</span>
          </button>
        </div>
        
        <div className="w-full">
          <button
            className={`w-full ${theme.primary} text-white font-bold py-6 px-8 rounded-xl text-2xl ${theme.hover} transition-all duration-300 shadow-lg flex items-center justify-center`}
            onClick={() => setStep(2)}
          >
            <span className="mr-2">次へ進む</span>
            <ArrowRight size={24} />
          </button>
        </div>
      </div>
    );
  };
  
  // ステップ2: お問い合わせフォーム
  const renderContactForm = () => {
    return (
      <div>
        <div className="flex items-center mb-8">
          <button
            className="mr-4 p-3 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
            onClick={() => setStep(1)}
            aria-label="前のページに戻る"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-3xl font-bold text-gray-900">お問い合わせフォーム</h2>
        </div>
        
        <div className={`mb-8 p-6 rounded-xl ${theme.secondary} ${theme.border} border-4 flex items-center`}>
          <div className="p-3 rounded-full bg-white mr-4">
            {React.cloneElement(theme.icon, { size: 36 })}
          </div>
          <div>
            <p className={`font-bold text-xl ${theme.text}`}>
              {mood === 'happy' ? 'ハッピーな気分ですね！素晴らしい一日をお過ごしください。' :
               mood === 'angry' ? 'イライラしていますね。お手伝いできることがあれば、ぜひお聞かせください。' :
               mood === 'sad' ? 'お気持ち、お察しします。何かお力になれることがあれば。' :
               mood === 'inLove' ? 'ウキウキしていますね！その気持ち、大事にしてくださいね。' :
               'どんなご用件でしょうか？'}
            </p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* 入力フィールド */}
          <div className="space-y-8">
            <div>
              <label htmlFor="name" className="block mb-3 text-2xl font-bold text-gray-900 flex items-center">
                <User size={28} className="mr-2 text-indigo-700" />
                お名前
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full p-5 text-xl rounded-xl border-4 ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:ring-4 ${theme.border} focus:border-transparent transition-colors`}
                placeholder={mood === 'angry' ? 'お怒りの方' : 'おじいちゃん'}
              />
              {errors.name && <p className="mt-2 text-xl text-red-600 font-bold">{errors.name}</p>}
            </div>
            
            <div>
              <label htmlFor="email" className="block mb-3 text-2xl font-bold text-gray-900 flex items-center">
                <Mail size={28} className="mr-2 text-indigo-700" />
                メールアドレス
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full p-5 text-xl rounded-xl border-4 ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:ring-4 ${theme.border} focus:border-transparent transition-colors`}
                placeholder="example@gmail.com"
              />
              {errors.email ? (
                <p className="mt-2 text-xl text-red-600 font-bold">{errors.email}</p>
              ) : (
                <p className="mt-2 text-lg text-gray-700">
                  {formData.email.includes('gmail') ? 'Gmailですね、素晴らしい選択です！' : 
                   formData.email.includes('yahoo') ? 'Yahoo!メールですか、クラシックな味わいですね！' : 
                   ''}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="phone" className="block mb-3 text-2xl font-bold text-gray-900 flex items-center">
                <Phone size={28} className="mr-2 text-indigo-700" />
                電話番号 (任意)
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-5 text-xl rounded-xl border-4 border-gray-300 focus:ring-4 focus:ring-indigo-300 focus:border-transparent transition-colors"
                placeholder="090-1234-5678"
              />
            </div>
            
            <div>
              <label htmlFor="inquiryType" className="block mb-3 text-2xl font-bold text-gray-900 flex items-center">
                <MessageCircle size={28} className="mr-2 text-indigo-700" />
                お問い合わせの種類
              </label>
              <select
                id="inquiryType"
                name="inquiryType"
                value={formData.inquiryType}
                onChange={handleChange}
                className="w-full p-5 text-xl rounded-xl border-4 border-gray-300 focus:ring-4 focus:ring-indigo-300 focus:border-transparent transition-colors"
              >
                <option value="question">質問（シンプルなものだと嬉しいです）</option>
                <option value="complaint">苦情（できるだけやさしく伝えてください）</option>
                <option value="praise">称賛（たくさんどうぞ！）</option>
                <option value="other">その他（何でもお聞かせください）</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="message" className="block mb-3 text-2xl font-bold text-gray-900 flex items-center">
                {formData.inquiryType === 'question' ? 'ご質問内容' :
                 formData.inquiryType === 'complaint' ? 'ご不満な点' :
                 formData.inquiryType === 'praise' ? '褒めていただける点' :
                 'お問い合わせ内容'}
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                className={`w-full p-5 text-xl rounded-xl border-4 ${errors.message ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:ring-4 ${theme.border} focus:border-transparent transition-colors`}
                placeholder={
                  formData.inquiryType === 'question' ? 'どんなことでも質問してください...' :
                  formData.inquiryType === 'complaint' ? '何がお気に召さなかったですか？改善します...' :
                  formData.inquiryType === 'praise' ? '褒め言葉をどうぞ！担当者が喜びます...' :
                  'お問い合わせ内容を入力してください...'
                }
              ></textarea>
              {errors.message && <p className="mt-2 text-xl text-red-600 font-bold">{errors.message}</p>}
            </div>
          </div>
          
          {/* 送信ボタン */}
          <div className="mt-10">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full ${theme.primary} text-white font-bold py-6 px-8 rounded-xl text-2xl transition-all duration-300 shadow-lg flex items-center justify-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : theme.hover}`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  送信中...
                </>
              ) : (
                <>
                  <Send className="mr-3" size={28} />
                  送信する
                </>
              )}
            </button>
            
            <p className="text-center mt-4 text-lg text-gray-700">
              {mood === 'angry' ? '※深呼吸してから送信ボタンを押してくださいね' :
               mood === 'happy' ? '※あなたの明るい気持ちが伝わります！' :
               mood === 'sad' ? '※元気出してくださいね、きっと良いことがあります' :
               mood === 'inLove' ? '※素敵な気持ち、大切にしてくださいね' :
               '※24時間以内に返信いたします'}
            </p>
          </div>
        </form>
      </div>
    );
  };
  
  // ステップ3: 送信完了画面
  const renderThankYou = () => {
    const randomResponse = funnyResponses[formData.inquiryType][Math.floor(Math.random() * funnyResponses[formData.inquiryType].length)];
    const currentJoke = jokes[jokeIndex];
    
    return (
      <div className="flex flex-col items-center">
        <div className="w-32 h-32 rounded-full bg-green-100 flex items-center justify-center mb-8 animate-bounce">
          <ThumbsUp size={64} className="text-green-600" />
        </div>
        
        <h2 className="text-4xl font-bold mb-4 text-center text-gray-900">ありがとうございます！</h2>
        <p className="text-2xl mb-8 text-center text-gray-800">お問い合わせを受け付けました</p>
        
        <div className={`w-full p-6 rounded-xl ${theme.secondary} ${theme.border} border-4 mb-8`}>
          <p className={`text-xl italic font-medium ${theme.text}`}>"{randomResponse}"</p>
        </div>
        
        <div className="w-full p-6 bg-amber-50 rounded-xl border-4 border-amber-200 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-amber-800">プログラマージョーク</h3>
            <button
              onClick={showNextJoke}
              className="p-3 bg-white rounded-full hover:bg-gray-100 transition-colors"
              aria-label="次のジョークを表示"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          <p className="text-xl font-bold mb-3">{currentJoke.setup}</p>
          <p className="text-xl italic">{currentJoke.punchline}</p>
        </div>
        
        <div className="flex gap-6 w-full">
          <button
            onClick={() => {
              setFormData({
                name: '',
                email: '',
                phone: '',
                message: '',
                inquiryType: 'question',
              });
              setStep(1);
            }}
            className="flex-1 bg-white border-4 border-gray-300 text-gray-800 font-bold py-4 px-6 rounded-xl text-xl hover:bg-gray-50 transition-colors"
          >
            新しいお問い合わせ
          </button>
          
          <button
            onClick={() => navigate('/TopPage')}
            className={`flex-1 ${theme.primary} text-white font-bold py-4 px-6 rounded-xl text-xl ${theme.hover} transition-colors`}
          >
            ホームに戻る
          </button>
        </div>
        
        <div className="mt-8 w-full flex justify-center">
          <div className="inline-flex items-center bg-white px-5 py-3 rounded-full border-2 border-gray-200">
            <Sparkles size={24} className="text-yellow-500 mr-2" />
            <span className="text-xl text-gray-700">今日も素敵な一日を！</span>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className={`max-w-2xl mx-auto p-10 rounded-xl shadow-xl bg-white`}>
      {/* ヘッダー */}
      <header className="mb-10 text-center">
        <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-gray-900">おつかいクエスト</h1>
        <p className="text-xl mt-2 text-gray-700">お問い合わせフォーム</p>
      </header>
      
      {/* 進行ステップ表示 */}
      <div className="mb-10">
        <div className="flex items-center">
          <div className={`flex items-center justify-center w-12 h-12 rounded-full text-xl font-bold ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
            1
          </div>
          <div className={`flex-1 h-2 mx-2 ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center justify-center w-12 h-12 rounded-full text-xl font-bold ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
            2
          </div>
          <div className={`flex-1 h-2 mx-2 ${step >= 3 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center justify-center w-12 h-12 rounded-full text-xl font-bold ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
            3
          </div>
        </div>
        <div className="flex justify-between mt-2 text-lg text-gray-700">
          <span>気分選択</span>
          <span>お問い合わせ</span>
          <span>完了</span>
        </div>
      </div>
      
      {/* ステップごとのコンテンツ */}
      {step === 1 && renderMoodSelector()}
      {step === 2 && renderContactForm()}
      {step === 3 && renderThankYou()}
    </div>
  );
};

export default King;