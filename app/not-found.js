'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from './components/Header';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#EE4266] mb-4">404</h1>
          <p className="text-xl mb-4">Página no encontrada</p>
          <p className="text-gray-600">
            Serás redirigido a la página principal en 3 segundos...
          </p>
        </div>
      </div>
    </div>
  );
} 