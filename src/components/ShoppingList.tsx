import React, { useState, useEffect } from 'react';
import { Plus, Mic, Tag, Star, ShoppingBag, Trash2 } from 'lucide-react';
import { supabase, type ShoppingItem } from '../lib/supabase';

type Priority = 'must' | 'preferred' | 'optional';

const CATEGORIES = ['食品', '日用品', '野菜・果物', '飲み物', 'その他'];

function speak(message: string) {
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = 'ja-JP';
  window.speechSynthesis.speak(utterance);
}

export function ShoppingList() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [selectedPriority, setSelectedPriority] =
    useState<Priority>('preferred');
  const [loading, setLoading] = useState(true);
  const [confirmDeleteItem, setConfirmDeleteItem] =
    useState<ShoppingItem | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('shopping_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  }

  async function addItem() {
    if (!newItemName.trim()) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('shopping_items').insert([
        {
          name: newItemName.trim(),
          priority: selectedPriority,
          category: 'その他',
          user_id: user.id,
        },
      ]);

      if (error) throw error;
      setNewItemName('');
      fetchItems();
    } catch (error) {
      console.error('Error adding item:', error);
    }
  }

  async function toggleItemComplete(item: ShoppingItem) {
    try {
      const { error } = await supabase
        .from('shopping_items')
        .update({ completed: !item.completed })
        .eq('id', item.id);

      if (error) throw error;
      fetchItems();
    } catch (error) {
      console.error('Error updating item:', error);
    }
  }

  async function deleteItem(item: ShoppingItem) {
    try {
      const { error } = await supabase
        .from('shopping_items')
        .delete()
        .eq('id', item.id);

      if (error) throw error;
      speak('商品を削除しました');
      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  }

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Add Item Form */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
          <div className="flex-1">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="商品名を入力"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => {}}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <Mic className="h-6 w-6" />
          </button>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value as Priority)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="must">絶対買う</option>
            <option value="preferred">あったらでいい</option>
            <option value="optional">気が向いたら</option>
          </select>
          <button
            onClick={async () => {
              await addItem();
              speak('商品を追加しました');
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            追加
          </button>
        </div>
      </div>

      {/* Shopping List */}
      <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
        {CATEGORIES.map((category) => {
          const categoryItems = items.filter(
            (item) => item.category === category
          );
          if (categoryItems.length === 0) return null;

          return (
            <div key={category} className="p-6">
              <h3 className="text-xl font-medium text-gray-900 mb-4">
                {category}
              </h3>
              <ul className="space-y-3">
                {categoryItems.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <button
                      onClick={() => toggleItemComplete(item)}
                      className="flex items-center flex-1"
                    >
                      <span
                        className={`flex items-center ${
                          item.completed ? 'line-through text-gray-400' : ''
                        }`}
                      >
                        {item.priority === 'must' && (
                          <Star className="h-5 w-5 text-yellow-500 mr-2" />
                        )}
                        {item.name}
                      </span>
                    </button>
                    <div className="flex items-center space-x-2">
                      <Tag className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {item.priority === 'must'
                          ? '絶対買う'
                          : item.priority === 'preferred'
                          ? 'あればOK'
                          : 'こんな感じでOK'}
                      </span>
                      {confirmDeleteItem && confirmDeleteItem.id === item.id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              deleteItem(item);
                              setConfirmDeleteItem(null);
                            }}
                            className="px-2 py-1 bg-red-600 text-white rounded"
                          >
                            削除する
                          </button>
                          <button
                            onClick={() => setConfirmDeleteItem(null)}
                            className="px-2 py-1 bg-yellow-300 text-gray-800 rounded"
                          >
                            削除しない
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setConfirmDeleteItem(item);
                            speak('削除しますか？');
                          }}
                          className="p-1 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
