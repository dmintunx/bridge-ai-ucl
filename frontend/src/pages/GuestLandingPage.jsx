// frontend/src/pages/GuestLandingPage.jsx
import React from 'react';
import { useParams } from 'react-router-dom';

function GuestLandingPage() {
  const { roomId } = useParams(); // URL ကနေ roomId ကို ယူသုံးမယ်

  return (
    <div>
      <h2>Welcome to the Chat!</h2>
      <h3>You've been invited to Room: {roomId}</h3>
      {/* Guest Language Selection and Name Input တွေ ဒီမှာ လာပါမယ် */}
      <p>Please choose your language and enter your name to join.</p>
    </div>
  );
}

export default GuestLandingPage;