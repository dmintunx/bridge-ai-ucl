// bridge-ai-webapp/netlify/functions/create-room.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { roomName, roomType, creatorId, participantIds, translationTone } = JSON.parse(event.body);

    if (!roomType || !creatorId || !translationTone) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Room type, creator ID, and translation tone are required.' }),
      };
    }

    // --- 1. rooms table ထဲမှာ Room ဖန်တီးပါ ---
    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .insert({
        name: roomType === 'group' ? roomName : null, // Group ဆိုရင် နာမည်ရှိမယ်
        type: roomType,
        creator_id: creatorId,
        translation_tone: translationTone,
      })
      .select() // Insert လုပ်ပြီးသား data တွေကို ပြန်ယူပါ
      .single(); // တစ်ခုတည်းသော record

    if (roomError) {
      console.error('Error creating room:', roomError);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to create chat room.' }),
      };
    }

    const roomId = roomData.id;

    // --- 2. room_participants table ထဲမှာ creator ကို ထည့်ပါ ---
    const participantsToInsert = [{
      room_id: roomId,
      user_id: creatorId,
      guest_name: null, // creator က Paid user မို့
      guest_language: null,
    }];

    // --- 3. တခြား participant တွေရှိရင် ထပ်ထည့်ပါ ---
    if (participantIds && participantIds.length > 0) {
      // participantIds array ထဲမှာ creatorId ကို ဖယ်ပြီးမှ ထည့်ပါ
      const uniqueParticipantIds = [...new Set(participantIds)].filter(id => id !== creatorId);

      uniqueParticipantIds.forEach(pId => {
        participantsToInsert.push({
          room_id: roomId,
          user_id: pId,
          guest_name: null,
          guest_language: null,
        });
      });
    }

    const { error: participantError } = await supabase
      .from('room_participants')
      .insert(participantsToInsert);

    if (participantError) {
      console.error('Error adding participants:', participantError);
      // Room ဖန်တီးပြီးသားမို့ error ပြရင် room ကို ပြန်ဖျက်တာမျိုး လုပ်နိုင်ပါတယ်
      // ဒါမှမဟုတ် participant မပါလည်း room က ရှိနေသေးတယ်လို့ ယူဆနိုင်ပါတယ်
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Chat room created successfully!',
        roomId: roomId,
        roomName: roomData.name,
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