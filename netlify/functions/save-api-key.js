// bridge-ai-webapp/netlify/functions/save-api-key.js
const { createClient } = require('@supabase/supabase-js');

// Supabase client ကို Initialize လုပ်ပါ
// Service Role Key ကို Backend Functions တွေမှာ သုံးတာက လုံခြုံရေး ပိုကောင်းပါတယ်
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Service Role Key ကိုသုံးပါ
);

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { userId, geminiApiKey } = JSON.parse(event.body);

    if (!userId || !geminiApiKey) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'User ID and Gemini API Key are required.' }),
      };
    }

    // Gemini API Key ကို users table ထဲမှာ သိမ်းဆည်းပါ
    const { data, error } = await supabase
      .from('users')
      .update({ gemini_api_key: geminiApiKey }) // Key ကို ဒီအတိုင်းသိမ်းပါ (encryption logic ကို နောက်မှ ထည့်နိုင်ပါတယ်)
      .eq('id', userId);

    if (error) {
      console.error('Error saving Gemini API Key:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to save Gemini API Key.' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Gemini API Key saved successfully!' }),
    };
  } catch (error) {
    console.error('Lambda function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error.' }),
    };
  }
};