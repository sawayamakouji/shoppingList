import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, Outlet } from 'react-router-dom';
import { ShoppingList } from './components/ShoppingList';
import { OCRCapture } from './components/OCRCapture';
import { PurchaseHistory } from './components/PurchaseHistory';
import { Auth } from './components/Auth';
import TopPage from './components/TopPage';
import QuestRewardsAnimated from './components/QuestRewardsAnimated';
import { supabase } from './lib/supabase';
import { AlbumPage } from "./components/AlbumPage";
import Recommend from './components/Recommend';
import Game from './components/Game';
import Rank from './components/Rank';
import King from './components/King';
import Game02 from "./components/Game02";
import Game03 from "./components/Game03";
import Game04 from "./components/Game04";
import Game05 from "./components/Game05";
import Game01 from "./components/Game01";
import ChatSimulation from './components/ChatSimulation';
import ShoppingAssistant from "./components/ShoppingAssistant";

function MainTabs() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('shoppinglist'); // 現在選択されているタブを管理
  const [pageTitle, setPageTitle] = useState('買い物リスト'); // 現在のページタイトルを管理

  // タブをクリックした時の処理
  const handleTabClick = (tab: string, title: string) => {
    setActiveTab(tab); // 選択されたタブを更新
    setPageTitle(title); // 選択されたタブに対応するページタイトルを設定
    navigate(tab); // それに応じてナビゲート
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow p-4 flex justify-around items-center">
        <div className="flex space-x-6">
          <button
            onClick={() => handleTabClick('shoppinglist', '買い物リスト')}
            className={`px-4 py-2 text-2xl font-bold ${activeTab === 'shoppinglist' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
          >
            買い物リスト
          </button>
          <button
            onClick={() => handleTabClick('memo', 'メモから読取')}
            className={`px-4 py-2 text-2xl font-bold ${activeTab === 'memo' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
          >
            メモから読取
          </button>
          <button
            onClick={() => handleTabClick('purchase', '購入履歴')}
            className={`px-4 py-2 text-2xl font-bold ${activeTab === 'purchase' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
          >
            購入履歴
          </button>
        </div>
        {/* 戻るボタン */}
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 text-2xl text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
        >
          戻る
        </button>
      </div>

    

      {/* タブごとの内容 */}
      <div className="p-4">
        <Outlet />  {/* 現在選択されているコンテンツを表示 */}
      </div>
    </div>
  );
}

function App() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return <Auth />;  // ログインしていない場合、Auth コンポーネントを表示
  }

  return (
    <Routes>
      {/* トップページ（買物クエスト） */}
      <Route path="/" element={<TopPage />} />
      {/* メイン画面 */}
      <Route path="/app" element={<MainTabs />}>
        <Route index element={<ShoppingList />} /> {/* /app にアクセスした際のデフォルト */}
        <Route path="shoppinglist" element={<ShoppingList />} />
        <Route path="memo" element={<OCRCapture />} />
        <Route path="purchase" element={<PurchaseHistory />} />
      </Route>
      <Route path="/QuestRewardsAnimated" element={<QuestRewardsAnimated />} />
      <Route path="/Recommend" element={<Recommend />} />
      <Route path="/Game" element={<Game />} />
      <Route path="/album" element={<AlbumPage />} />
      <Route path="/Rank" element={<Rank />} />
      <Route path="/King" element={<King />} />
      <Route path="/Game02" element={<Game02 />} />
      <Route path="/Game03" element={<Game03 />} />
      <Route path="/Game04" element={<Game04 />} />
      <Route path="/Game05" element={<Game05 />} />
      <Route path="/Game01" element={<Game01 />} />
      <Route path="/chat" element={<ChatSimulation />} />
      {/* フォールバック：何も該当しない場合、トップページにリダイレクト */}
      <Route path="*" element={<Navigate to="/" />} />
      <Route path="ShoppingAssistant" element={<ShoppingAssistant />} />
    </Routes>
  );
}

export default App;
