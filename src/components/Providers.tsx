'use client';

import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  if (!clientId) {
    console.warn('NEXT_PUBLIC_GOOGLE_CLIENT_ID não está configurado. Configure esta variável no arquivo .env.local');
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <GoogleOAuthProvider clientId={clientId || 'placeholder'}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </GoogleOAuthProvider>
    </ThemeProvider>
  );
}

