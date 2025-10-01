'use client';

import { useEffect, useState } from 'react';
import { PopupModal } from './popup-modal';
import type { PopupContent } from '@/lib/popup';

interface PopupWrapperProps {
  content: PopupContent;
}

export function PopupWrapper({ content }: PopupWrapperProps) {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    // Check popup state on client side
    const checkPopupState = () => {
      try {
        const cookieValue = document.cookie
          .split('; ')
          .find((row) => row.startsWith('popup-state='))
          ?.split('=')[1];

        if (!cookieValue) {
          setShouldShow(true);
          return;
        }

        const state = JSON.parse(decodeURIComponent(cookieValue));

        // Show if version changed
        if (state.version !== content.version) {
          setShouldShow(true);
          return;
        }

        // Show if duration expired
        const daysSinceDismissed =
          (Date.now() - state.timestamp) / (1000 * 60 * 60 * 24);
        if (daysSinceDismissed > content.showDuration) {
          setShouldShow(true);
          return;
        }

        setShouldShow(false);
      } catch (error) {
        console.error('Error reading popup state:', error);
        setShouldShow(true);
      }
    };

    checkPopupState();
  }, [content.version, content.showDuration]);

  if (!shouldShow) return null;

  return <PopupModal content={content} initialOpen={true} />;
}
