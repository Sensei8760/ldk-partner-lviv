'use client';

import Clarity from '@microsoft/clarity';
import { useEffect } from 'react';

export default function MicrosoftClarity() {
  useEffect(() => {
    const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;

    if (!clarityId) return;

    Clarity.init(clarityId);
  }, []);

  return null;
}