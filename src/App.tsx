import React, { useState, useEffect } from 'react';
import { Camera, List, History, Share2, ShoppingBag } from 'lucide-react';
import { ShoppingList } from './components/ShoppingList';
import { OCRCapture } from './components/OCRCapture';
import { PurchaseHistory } from './components/PurchaseHistory';
import { Auth } from './components/Auth';
import { supabase } from './lib/supabase';

type Tab = 'list' | 'ocr' | 'history';


function App() {
  const [activeTab, setActiveTab] = useState<Tab>('list');
  const [session, setSession] = useState<any>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return <Auth />;
  }

  const speak = (text: string) => {
    if (!voiceEnabled) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    window.speechSynthesis.speak(utterance);
  };

  const forceSpeak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between py-4 sm:py-6">
            <div className="flex items-center">
              <ShoppingBag className="h-10 w-10 sm:h-12 sm:w-12 text-blue-800" />
              <h1 className="ml-2 sm:ml-4 text-2xl sm:text-3xl font-bold text-gray-900">
                かんたんお買い物リスト
              </h1>
            </div>
            <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              {/* 共有ボタン */}
              <button
                onClick={() => {
                  speak('共有');
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-base sm:text-lg font-semibold rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <Share2 className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                共有
              </button>
              {/* ログアウトボタン */}
              <button
                onClick={() => supabase.auth.signOut()}
                className="text-base sm:text-lg font-medium text-gray-800 hover:text-black"
              >
                ログアウト
              </button>
              {/* 音声オンオフボタン */}
              <button
                onClick={() => {
                  const newState = !voiceEnabled;
                  setVoiceEnabled(newState);
                  forceSpeak(newState ? '音声オン' : '音声オフ');
                }}
                className="text-base sm:text-lg font-medium text-gray-800 hover:text-black border-2 border-gray-400 rounded-md px-3 py-1"
              >
                {voiceEnabled ? '音声:オン' : '音声:オフ'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Tab Navigation */}
        <div className="mb-4">
          <nav className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => {
                setActiveTab('list');
                speak('買い物リスト');
              }}
              className={`w-full py-4 rounded-lg shadow transition-colors font-semibold text-xl flex items-center justify-center space-x-2 ${
                activeTab === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              <List className="h-8 w-8" />
              <span>買い物リスト</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('ocr');
                speak('メモ・レシート読み取り');
              }}
              className={`w-full py-4 rounded-lg shadow transition-colors font-semibold text-xl flex items-center justify-center space-x-2 ${
                activeTab === 'ocr'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              <Camera className="h-8 w-8" />
              <span>メモ・レシート読み取り</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('history');
                speak('購入履歴');
              }}
              className={`w-full py-4 rounded-lg shadow transition-colors font-semibold text-xl flex items-center justify-center space-x-2 ${
                activeTab === 'history'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              <History className="h-8 w-8" />
              <span>購入履歴</span>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === 'list' && <ShoppingList />}
          {activeTab === 'ocr' && <OCRCapture />}
          {activeTab === 'history' && <PurchaseHistory />}
        </div>
      </main>
    </div>
  );
}

export default App;
