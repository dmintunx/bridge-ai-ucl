// bridge-ai-webapp/netlify/functions/update-user-profile.js
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
    const { userId, username, defaultLanguage } = JSON.parse(event.body);

    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'User ID is required.' }),
      };
    }

    const updateData = {};
    if (username) {
      updateData.username = username;
    }
    if (defaultLanguage) {
      updateData.default_language = defaultLanguage;
    }

    if (Object.keys(updateData).length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No data provided for update.' }),
      };
    }

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId);

    if (error) {
      console.error('Error updating user profile:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to update user profile.' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'User profile updated successfully!' }),
    };
  } catch (error) {
    console.error('Lambda function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error.' }),
    };
  }
};