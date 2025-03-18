import React, { useState, useEffect } from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import { supabase, type PurchaseHistory } from '../lib/supabase';

// ダミーデータ（購入履歴）
const dummyPurchaseHistory: PurchaseHistory[] = [
  { id: 1, name: '牛乳', purchase_date: '2025-03-10', store_name: 'スーパーA' },
  { id: 2, name: 'パン', purchase_date: '2025-03-11', store_name: 'ベーカリーB' },
  { id: 3, name: '卵', purchase_date: '2025-03-09', store_name: '市場C' },
];

// ダミーデータ（おすすめ商品）
const dummyRecommendedItems = [
  {
    id: 1,
    title: '新商品 さっくりの山とかおりの里',
    description:
      'お菓子好きの皆様！新商品"さっくりの山とかおりの里"は、リッチな味わいとのほのかなイイ感じの香りが楽しめます。サクッとした触感もぜひ味わってください。',
    image: '/images/new-product.png',
  },
  {
    id: 2,
    title: '香り豊かなブレンドコーヒー "音更珈琲豆2025"',
    description:
      '香り豊かなブラジル産豆使用で、ほのかな苦みと程よい酸味をお楽しみください！',
    image: '/images/coffee.png',
  },
];

export function PurchaseHistory() {
  const [history, setHistory] = useState<PurchaseHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    try {
      const { data, error } = await supabase
        .from('purchase_history')
        .select('*')
        .order('purchase_date', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        setHistory(data);
      } else {
        setHistory(dummyPurchaseHistory);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      setHistory(dummyPurchaseHistory);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-3xl">読み込み中...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      {/* 購入履歴セクション */}
      <div className="bg-white shadow rounded-lg p-8">
        <h2 className="text-4xl font-bold mb-6">購入履歴</h2>
        <div className="pt-6">
          {history.length === 0 ? (
            <p className="text-center text-gray-500 py-6 text-3xl">
              購入履歴はまだありません
            </p>
          ) : (
            history.map((record) => (
              <div
                key={record.id}
                className="py-6 flex flex-col md:flex-row md:items-center border-b border-gray-100"
              >
                {/* 日付 */}
                <div className="mb-2 md:mb-0 md:mr-4">
                  <span className="text-3xl text-gray-500">
                    {new Date(record.purchase_date).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                {/* 商品名 */}
                <div className="mb-2 md:mb-0 md:mr-4">
                  <span className="text-3xl font-bold">{record.name}</span>
                </div>
                {/* 店名 */}
                <div className="mb-2 md:mb-0 md:mr-4">
                  <span className="text-3xl text-gray-900">
                    {record.store_name || '店舗情報なし'}
                  </span>
                </div>
                {/* 詳細ボタン */}
                <div>
                  <button className="inline-flex items-center px-4 py-2 border border-transparent text-3xl font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200">
                    詳細を見る
                    <ArrowRight className="ml-2 h-6 w-6" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* おすすめ商品のセクション */}
      <div className="bg-white shadow rounded-lg p-8">
        <h3 className="text-4xl font-bold mb-6">おすすめの商品</h3>
        <div className="border-t border-gray-200 pt-6">
          {dummyRecommendedItems.length === 0 ? (
            <p className="text-center text-gray-500 py-6 text-3xl">
              購入履歴に基づいたおすすめはまだありません
            </p>
          ) : (
            dummyRecommendedItems.map((item) => (
              <div key={item.id} className="py-6 border-b border-gray-100">
                <h4 className="text-3xl font-semibold mb-4">{item.title}</h4>
                <p className="text-3xl text-gray-700">{item.description}</p>
                                {/* 画像を表示 */}
                                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full max-w-md mx-auto my-8 "
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
