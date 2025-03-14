import React, { useState, useEffect } from 'react';
import { Calendar, ShoppingBag, ArrowRight } from 'lucide-react';
import { supabase, type PurchaseHistory } from '../lib/supabase';

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
      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">購入履歴</h2>
        <div className="border-t border-gray-200 pt-4">
          {history.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              購入履歴はまだありません
            </p>
          ) : (
            history.map((record) => (
              <div key={record.id} className="py-4 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <span className="ml-2 text-sm text-gray-500">
                    {new Date(record.purchase_date).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center">
                  <ShoppingBag className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-900">{record.store_name}</span>
                </div>
                <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200">
                  詳細を見る
                  <ArrowRight className="ml-1 h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">おすすめの商品</h3>
        <div className="border-t border-gray-200 pt-4">
          <p className="text-center text-gray-500 py-4">
            購入履歴に基づいたおすすめはまだありません
          </p>
        </div>
      </div>
    </div>
  );
}