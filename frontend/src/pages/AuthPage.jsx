// frontend/src/pages/AuthPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../AuthContext'; // AuthContext က useAuth hook ကို import လုပ်ပါ
import { useNavigate } from 'react-router-dom';

// ဘာသာစကား ရွေးချယ်စရာများ
const languages = [
  { code: 'en', name: 'English' },
  { code: 'my', name: 'Myanmar' },
  { code: 'th', name: 'Thai' },
  { code: 'zh', name: 'Chinese' },
  // တခြားဘာသာစကားတွေ ထပ်ထည့်နိုင်ပါတယ်
];

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true); // Login/Register form ကို ပြောင်းဖို့
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // Register အတွက်
  const [defaultLanguage, setDefaultLanguage] = useState(languages[0].code); // Register အတွက် default
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signUp, signIn } = useAuth(); // AuthContext က function တွေကို ယူသုံးပါ
  const navigate = useNavigate(); // Login ပြီးရင် page ပြောင်းဖို့

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
        navigate('/dashboard'); // Login အောင်မြင်ရင် Dashboard ကို ပို့ပါ
      } else {
        await signUp(email, password, username, defaultLanguage);
        // Sign up ပြီးရင် Login ဝင်ခိုင်းနိုင်ပါတယ်။
        // ဒါမှမဟုတ် အတည်ပြုဖို့ email ပို့ရင် user ကို အသိပေးရပါမယ်။
        // Supabase settings မှာ email confirmation ကို OFF ထားရင်တော့ ချက်ချင်း login ဝင်လို့ရပါတယ်။
        alert('Account created successfully! Please login.');
        setIsLogin(true); // Sign up ပြီးရင် Login form ကို ပြန်ပြပါ
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>{isLogin ? 'Login' : 'Register'}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        {!isLogin && ( // Register form မှာ username နဲ့ defaultLanguage ထည့်ပါ
          <>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <select
              value={defaultLanguage}
              onChange={(e) => setDefaultLanguage(e.target.value)}
              required
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </>
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
        </button>
      </form>
      <p>
        {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
        <button type="button" onClick={() => setIsLogin(!isLogin)} disabled={loading}>
          {isLogin ? 'Register here' : 'Login here'}
        </button>
      </p>
    </div>
  );
}

export default AuthPage;