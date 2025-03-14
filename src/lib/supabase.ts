import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type ShoppingItem = {
  id: string;
  user_id: string;
  name: string;
  priority: 'must' | 'preferred' | 'optional';
  category: string;
  completed: boolean;
  created_at: string;
};

export type PurchaseHistory = {
  id: string;
  user_id: string;
  store_name: string;
  purchase_date: string;
  items: {
    name: string;
    category: string;
    quantity: number;
    price?: number;
  }[];
  created_at: string;
};

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}