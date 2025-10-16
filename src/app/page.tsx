import { redirect } from 'next/navigation';

export default function RootPage() {
  // The main entry point redirects to the home screen of the app.
  // The layout for '/home' will handle authentication checks.
  redirect('/home');
}
