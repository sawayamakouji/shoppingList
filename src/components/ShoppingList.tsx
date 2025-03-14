import React, { useState, useEffect } from 'react';
import { Plus, Mic, Tag, Star, Trash2 } from 'lucide-react';
import { supabase, type ShoppingItem } from '../lib/supabase';

type Priority = 'must' | 'preferred' | 'optional';

function speak(message: string) {
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = 'ja-JP';
  window.speechSynthesis.speak(utterance);
}

export function ShoppingList() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<Priority>('preferred');
  const [loading, setLoading] = useState(true);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState<ShoppingItem | null>(null);
  // 編集中のアイテムIDと一時的なpriorityの値を管理
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingPriority, setEditingPriority] = useState<Priority>('preferred');

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
          category: 'その他', // 固定値でも問題なければそのままでOK
          user_id: user.id,
        },
      ]);
      if (error) throw error;
      setNewItemName('');
      fetchItems();
      speak('商品を追加しました');
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

  // priority 更新用関数
  async function updateItemPriority(itemId: string, newPriority: Priority) {
    try {
      const { error } = await supabase
        .from('shopping_items')
        .update({ priority: newPriority })
        .eq('id', itemId);
      if (error) throw error;
      speak('タグを更新しました');
      setEditingItemId(null);
      fetchItems();
    } catch (error) {
      console.error('Error updating priority:', error);
      alert('タグの更新に失敗しました');
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-2xl">読み込み中...</div>;
  }

  return (
    <div className="space-y-8 p-4">
      {/* Add Item Form */}
      <div className="bg-white shadow-lg rounded-lg p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-4 sm:space-y-0">
          <div className="flex-1">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="商品名を入力"
              className="w-full px-6 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-2xl"
            />
          </div>
          <button
            onClick={() => {}}
            className="p-3 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <Mic className="h-8 w-8" />
          </button>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value as Priority)}
            className="px-6 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-2xl"
          >
            <option value="must">絶対買う</option>
            <option value="preferred">あったらでいい</option>
            <option value="optional">気が向いたら</option>
          </select>
          <button
            onClick={async () => {
              await addItem();
            }}
            className="inline-flex items-center px-6 py-4 border border-transparent text-2xl font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-8 w-8 mr-3" />
            追加
          </button>
        </div>
      </div>

      {/* Shopping List */}
      <div className="bg-white shadow-lg rounded-lg divide-y divide-gray-300">
        <div className="p-8">
          <h3 className="text-3xl font-bold text-gray-900 mb-6">買い物リスト</h3>
          <ul className="space-y-4">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <button
                  onClick={() => toggleItemComplete(item)}
                  className="flex items-center flex-1"
                >
                  <span
                    className={`flex items-center text-2xl ${
                      item.completed ? 'line-through text-gray-400' : ''
                    }`}
                  >
                    {item.priority === 'must' && (
                      <Star className="h-8 w-8 text-yellow-500 mr-3" />
                    )}
                    {item.name}
                  </span>
                </button>
                <div className="flex items-center space-x-4">
                  <Tag className="h-8 w-8 text-gray-400" />
                  {editingItemId === item.id ? (
                    <select
                      value={editingPriority}
                      onChange={(e) =>
                        setEditingPriority(e.target.value as Priority)
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg text-2xl"
                    >
                      <option value="must">絶対買う</option>
                      <option value="preferred">あったらでいい</option>
                      <option value="optional">気が向いたら</option>
                    </select>
                  ) : (
                    <span className="text-2xl text-gray-500">
                      {item.priority === 'must'
                        ? '絶対買う'
                        : item.priority === 'preferred'
                        ? 'あったらでいい'
                        : '気が向いたら'}
                    </span>
                  )}
                  {editingItemId === item.id ? (
                    <button
                      onClick={() =>
                        updateItemPriority(item.id, editingPriority)
                      }
                      className="px-3 py-2 bg-green-600 text-white rounded-lg text-2xl"
                    >
                      更新
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingItemId(item.id);
                        setEditingPriority(item.priority);
                      }}
                      className="px-3 py-2 bg-gray-300 text-gray-800 rounded-lg text-2xl"
                    >
                      編集
                    </button>
                  )}
                  {confirmDeleteItem && confirmDeleteItem.id === item.id ? (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          deleteItem(item);
                          setConfirmDeleteItem(null);
                        }}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg text-2xl"
                      >
                        削除する
                      </button>
                      <button
                        onClick={() => setConfirmDeleteItem(null)}
                        className="px-3 py-2 bg-yellow-300 text-gray-800 rounded-lg text-2xl"
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
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-8 w-8" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
