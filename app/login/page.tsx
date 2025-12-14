'use client';

import { useEffect, useState } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [fid, setFid] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // ✅ Force light mode
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  }, []);

  const signIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const { token } = await sdk.quickAuth.getToken();
      localStorage.setItem('quickAuthToken', token);

      const res = await sdk.quickAuth.fetch('/api/auth', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to verify token with backend');

      const data = await res.json();
      setFid(data.fid);

      setTimeout(() => {
        router.push('/create');
      }, 800);
    } catch (err) {
      console.error('Auth failed:', err);
      setError('❌ Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--bg,#f5f2eb)] text-[var(--green)] px-4">
      <div className="w-full max-w-md">
        <div className="card px-6 py-7 space-y-6 text-center">
          <header className="space-y-3">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl border border-[var(--gold)] bg-[var(--gold)]/10">
              <span className="text-xl">❄️</span>
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">Enter the Lab</h1>
              <p className="text-sm text-muted">
                Connect with Farcaster to summon your Holibae and unlock the music studio.
              </p>
            </div>
          </header>

          {!fid ? (
            <section className="space-y-4">
              <button
                onClick={signIn}
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[var(--gold)] text-[var(--bg)] font-semibold tracking-wide hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Authenticating…' : 'Entrar con Farcaster'}
              </button>

              {error && (
                <p className="text-sm text-red-500 text-center whitespace-pre-line">
                  {error}
                </p>
              )}

              <p className="text-[11px] text-muted leading-relaxed">
                QuickAuth works in Farcaster clients like the Base app.
              </p>
            </section>
          ) : (
            <section className="space-y-3">
              <p className="text-base text-[var(--sage)] font-medium">
                ✅ Authenticated as FID <span className="font-semibold">{fid}</span>
              </p>
              <p className="text-sm text-muted">Redirecting to the Holibae creator…</p>
            </section>
          )}
        </div>

        <p className="mt-5 text-center text-xs text-muted">Onchain Fantasia</p>
      </div>
    </main>
  );
}
