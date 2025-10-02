'use server';

import { cookies } from 'next/headers';
import type { PopupState } from '@/lib/popup';

export async function dismissPopup(version: string): Promise<void> {
  const cookieStore = await cookies();

  const state: PopupState = {
    dismissed: true,
    version,
    timestamp: Date.now(),
  };

  cookieStore.set('popup-state', JSON.stringify(state), {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}
