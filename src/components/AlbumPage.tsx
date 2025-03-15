import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Upload, Trash2 } from "lucide-react";

export function AlbumPage() {
  const [photos, setPhotos] = useState<{ id: string; url: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // ✅ ユーザー情報取得
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("❌ ユーザー情報の取得に失敗:", error);
      } else {
        console.log("✅ 取得したユーザー:", data?.user);
        setUserId(data.user?.id || null);
      }
    };
    fetchUser();
  }, []);

  // ✅ ユーザーの写真一覧を取得
  const fetchPhotos = async () => {
    if (!userId) return;
    console.log("📌 `fetchPhotos` 実行: ユーザーID", userId);

    const { data, error } = await supabase
      .from("photos")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ 写真の取得に失敗:", error);
    } else {
      console.log("✅ 取得した写真リスト:", data);
      setPhotos(data || []);
    }
  };

  // 🔄 useEffect で `fetchPhotos` を呼び出す
  useEffect(() => {
    if (userId) fetchPhotos();

    // 📡 リアルタイム監視
    const subscription = supabase
      .channel("realtime:photos")
      .on("postgres_changes", { event: "*", schema: "public", table: "photos" }, () => {
        if (userId) fetchPhotos();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [userId]);

  // ✅ 画像アップロード処理
  const uploadPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 🔑 ユーザー情報取得
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      console.error("❌ 認証ユーザー情報の取得に失敗:", userError);
      return;
    }

    const userId = userData.user.id;
    console.log("📌 取得したユーザーID:", userId);

    setUploading(true);
    const fileName = `${userId}/${Date.now()}-${encodeURIComponent(file.name)}`;

    // 📤 Supabase ストレージにアップロード
    const { data: uploadData, error: uploadError } = await supabase.storage.from("album").upload(fileName, file);

    if (uploadError) {
      console.error("❌ アップロード失敗:", uploadError);
      setUploading(false);
      return;
    }

    // 🔗 ストレージURLの取得
    const publicUrl = supabase.storage.from("album").getPublicUrl(fileName).data.publicUrl;

    console.log("📌 `photos` に追加するデータ:", { url: publicUrl, user_id: userId });

    // 📦 `photos` テーブルにデータを挿入
    const { error: insertError } = await supabase.from("photos").insert([
      { url: publicUrl, user_id: userId }
    ]);

    if (insertError) {
      console.error("❌ データベースへの保存失敗:", insertError);
    } else {
      console.log("✅ 写真がデータベースへ正常に保存されました！");
      fetchPhotos();
    }

    setUploading(false);
  };

  // ✅ 画像削除処理
  const deletePhoto = async (photoId: string, photoUrl: string) => {
    if (!userId) return;

    console.log("🗑 削除対象の写真ID:", photoId);
    console.log("🗑 削除対象の写真URL:", photoUrl);

    // 🔍 パス取得修正（decodeURIComponent）
    const filePath = decodeURIComponent(photoUrl.split(`${userId}/`).pop() || "");

    if (!filePath) {
      console.error("❌ 削除対象のパスが見つかりません");
      return;
    }

    // 📤 ストレージから削除
    const { error: storageError } = await supabase.storage.from("album").remove([`${userId}/${filePath}`]);

    if (storageError) {
      console.error("❌ ストレージからの削除失敗:", storageError);
      return;
    }

    // 🗄 データベースから削除
    const { error: dbError } = await supabase.from("photos").delete().eq("id", photoId);
    if (dbError) {
      console.error("❌ データベースからの削除失敗:", dbError);
    } else {
      console.log("✅ 写真が削除されました");
      fetchPhotos();
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-blue-700 text-center mb-6">📸 アルバム</h1>

      {/* アップロードボタン */}
      <label className="flex items-center justify-center p-4 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600">
        <Upload className="w-6 h-6 mr-2" />
        写真をアップロード
        <input type="file" accept="image/*" className="hidden" onChange={uploadPhoto} />
      </label>

      {uploading && <p className="text-center mt-2 text-gray-600">アップロード中...</p>}

      {/* 写真一覧 */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        {photos.map((photo) => (
          <div key={photo.id} className="relative">
            <img
              src={photo.url}
              alt="アップロードされた写真"
              className="w-full h-auto rounded-lg shadow"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/fallback-image.png";
                console.error("❌ 画像の読み込みに失敗:", photo.url);
              }}
            />
            <button
              onClick={() => deletePhoto(photo.id, photo.url)}
              className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
