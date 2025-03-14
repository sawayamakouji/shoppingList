// src/App.tsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, Outlet } from 'react-router-dom';
import { ShoppingList } from './components/ShoppingList';
import { OCRCapture } from './components/OCRCapture';
import { PurchaseHistory } from './components/PurchaseHistory';
import { Auth } from './components/Auth';
import { TopPage } from './components/TopPage';
import QuestRewardsAnimated from './components/QuestRewardsAnimated';
import { supabase } from './lib/supabase';

function MainTabs() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow p-4 flex justify-around items-center">
        <div className="flex space-x-6">
          <button
            onClick={() => navigate("shoppinglist")}
            className="px-4 py-2 text-2xl text-blue-600 font-bold"
          >
            買い物リスト
          </button>
          <button
            onClick={() => navigate("memo")}
            className="px-4 py-2 text-2xl text-gray-600"
          >
            メモから読取
          </button>
          <button
            onClick={() => navigate("purchase")}
            className="px-4 py-2 text-2xl text-gray-600"
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
      <div className="p-4">
        <Outlet />
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
    return <Auth />;
  }

  return (
    <Routes>
      {/* トップページ（買物クエスト） */}
      <Route path="/" element={<TopPage />} />
      {/* メイン画面 */}
      <Route path="/app" element={<MainTabs />}>
        <Route path="shoppinglist" element={<ShoppingList />} />
        <Route path="memo" element={<OCRCapture />} />
        <Route path="purchase" element={<PurchaseHistory />} />
        <Route path="*" element={<ShoppingList />} />
      </Route>
      <Route path="/QuestRewardsAnimated" element={<QuestRewardsAnimated />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
