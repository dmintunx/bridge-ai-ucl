// frontend/src/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; // Supabase client ကို import လုပ်ပါ

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // လက်ရှိ Login ဝင်ထားတဲ့ user (Supabase user object)
  const [loading, setLoading] = useState(true); // User authentication state ကို စစ်နေလားဆိုတာ

  useEffect(() => {
    // App စတင်တုန်းမှာ လက်ရှိ user session ကို စစ်ဆေးပါ
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting session:", error);
      }
      setUser(session?.user || null); // Session ရှိရင် user ကို set, မရှိရင် null
      setLoading(false);
    };

    getSession();

    // Auth state ပြောင်းလဲမှုတွေကို နားထောင်ပါ (Login, Logout, Sign up)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    // Cleanup function
    return () => {
      if (authListener && authListener.subscription) { // subscription ရှိမရှိ စစ်ဆေးပါ
        authListener.subscription.unsubscribe(); // Listener ကို ဖျက်ပါ
      }
    };
  }, []);

  // --- Authentication Functions ---
  const signUp = async (email, password, username, defaultLanguage) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
          default_language: defaultLanguage,
          // gemini_api_key ကို Register လုပ်တုန်းက မထည့်သေးပါဘူး
        },
      },
    });

    if (error) {
      throw error; // Error ကို ပြန်ပို့ပါ
    }

    // User ကို users table ထဲမှာ ထည့်သွင်းပါ။
    // RLS policy ကို အဆင့် 4.4.4 မှာ ဖန်တီးထားရင် ဒါက အလုပ်လုပ်ပါလိမ့်မယ်။
    if (data.user) {
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          username: username,
          default_language: defaultLanguage,
          // gemini_api_key ကို ဒီမှာ null အဖြစ် ထားနိုင်ပါတယ်
        });
      if (insertError) {
        console.error("Error inserting user into 'users' table:", insertError);
      }
    }

    return data;
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      throw error;
    }
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  };


  // Context ထဲမှာ ပေးပို့မယ့် value တွေ
  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children} {/* Loading မပြီးခင် children ကို မပြသပါနဲ့ */}
    </AuthContext.Provider>
  );
};

// Custom Hook: Auth Context ကို အလွယ်တကူ သုံးနိုင်ဖို့
export const useAuth = () => {
  // Context value မရှိရင် (ဥပမာ: AuthProvider နဲ့ မထုပ်ပိုးထားရင်) error ပြပါ
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};