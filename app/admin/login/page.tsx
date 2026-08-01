'use client'

import React, { useState } from 'react';
import { API_URL } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message || 'Login failed');
        return;
      }
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Network error');
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin Login</h1>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <form onSubmit={submit}>
        <div>
          <label>Phone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
