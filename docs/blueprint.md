# **App Name**: StatConnect

## Core Features:

- User Authentication: Secure user registration and login with Firebase Authentication (email/password and Google). Auto-generate unique 5-digit User ID after successful registration.
- Profile Management: Allow users to create and edit profiles (avatar, name, email, 5-digit ID). Store profile data in Firebase Realtime Database and avatars in Firebase Storage.  Include a method to display QR codes.
- Friend System: Enable users to add friends by entering a 5-digit ID and manage friend requests with Accept/Reject functionality.
- Real-time Chat (Private): Implement one-on-one chat functionality with real-time messaging. Include a method for online status indicators.
- Real-time Chat (Community): Support group chats in public communities, with the ability to join existing communities or create new ones.
- Audio/Video Calls: Implement audio and video calling features using WebRTC, including incoming call notifications and in-call controls (mute, camera on/off). Firebase Realtime database for call signaling.
- Call History: Maintain a call history log, displaying call details such as contact name, date, type of call, and status.

## Style Guidelines:

- Primary color: Vivid blue (#29ABE2), evoking feelings of trust, connection, and clarity.
- Background color: Light blue (#E0F7FA), providing a clean, airy backdrop that contrasts with the primary blue.
- Accent color: Electric purple (#BE29E2), for a distinctive call to action.
- Body and headline font: 'PT Sans', a modern and clear choice suitable for a chat application.
- Use minimalistic, modern icons for navigation and actions. Use icons for audio and video options within the one-on-one chat screen.
- Design a mobile-first, responsive layout with a header, bottom navigation bar, and floating action buttons (FABs) for primary actions.  One-on-one chats will slide in from the right.
- Implement subtle animations for transitions, loading states, and user interactions (e.g., sliding in chat view, dismissing popups). Subtle transition when marking calls as missed.