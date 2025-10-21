// bridge-ai-webapp/netlify/functions/send-message.js
const { createClient } = require('@supabase/supabase-js');
// Gemini API client ကို အခုတော့ comment ပိတ်ထားပါ (နောက်မှ ထည့်ပါမယ်)
// const { GoogleGenerativeAI } = require('@google/generative-ai');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Gemini API client ကို အခုတော့ comment ပိတ်ထားပါ
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { roomId, senderId, senderName, originalMessage, senderLanguage, recipientLanguages, translationTone } = JSON.parse(event.body);

    if (!roomId || !senderName || !originalMessage || !senderLanguage) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Room ID, sender name, original message, and sender language are required.' }),
      };
    }

    // --- 1. ဘာသာပြန် Logic (နောက်မှ ထည့်သွင်းပါမည်) ---
    // လက်ရှိတော့ မူရင်းစာသားကိုပဲ ဘာသာပြန်ထားတဲ့ messages ထဲ ထည့်ထားပါ
    const translatedMessages = {};
    translatedMessages[senderLanguage] = originalMessage; // sender ရဲ့ ဘာသာစကားအတွက်

    // recipientLanguages array ထဲက language တွေအတွက်လည်း (နောက်မှ) ဘာသာပြန်ပါ
    if (recipientLanguages && Array.isArray(recipientLanguages)) {
        recipientLanguages.forEach(lang => {
            if (lang !== senderLanguage && !translatedMessages[lang]) {
                // ဒီနေရာမှာ Gemini API ကို ခေါ်ပြီး ဘာသာပြန်ရမှာပါ
                // Demo အတွက်တော့ မူရင်းစာသားကိုပဲ အတုအယောင် ဘာသာပြန်အဖြစ် ထားပါ
                translatedMessages[lang] = `(Translated to ${lang.toUpperCase()}: ${originalMessage})`;
            }
        });
    }
    // -----------------------------------------------------

    // --- 2. messages table ထဲမှာ Message သိမ်းဆည်းခြင်း ---
    const { data, error } = await supabase
      .from('messages')
      .insert({
        room_id: roomId,
        sender_id: senderId, // Paid User ဆိုရင် ပါမယ်၊ Guest ဆိုရင် null ဖြစ်နိုင်
        sender_name: senderName,
        original_message: originalMessage,
        translated_messages: translatedMessages, // AI ဘာသာပြန်ထားတဲ့ messages
        sender_language: senderLanguage,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving message to database:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to save message.' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Message sent and saved successfully!',
        chatMessage: data, // Save လုပ်ပြီးသား message ကို Frontend ကို ပြန်ပို့ပါ
      }),
    };
  } catch (error) {
    console.error('Lambda function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error.' }),
    };
  }
};