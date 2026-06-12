'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export function BackButton() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };
    checkAuth();
  }, []);

  const handleBack = () => {
    router.push(isLoggedIn ? '/dashboard' : '/');
  };

  return (
    <button
      onClick={handleBack}
      className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-white"
    >
      <ArrowLeft className="h-4 w-4" />
      Volver al inicio
    </button>
  );
}
