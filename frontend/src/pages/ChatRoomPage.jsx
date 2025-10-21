// frontend/src/pages/ChatRoomPage.jsx
import React from 'react';
import { useParams } from 'react-router-dom';

function ChatRoomPage() {
  const { roomId } = useParams(); // URL ကနေ roomId ကို ယူသုံးမယ်

  return (
    <div>
      <h2>Chat Room: {roomId}</h2>
      {/* Chat Messages တွေနဲ့ Input Field ဒီမှာ လာပါမယ် */}
      <p>This is the chat room for room ID: {roomId}.</p>
    </div>
  );
}

export default ChatRoomPage;