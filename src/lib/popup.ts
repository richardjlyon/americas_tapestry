import { cookies } from 'next/headers';
import { getAllContent } from './content-core';

export interface PopupContent {
  title: string;
  version: string;
  enabled: boolean;
  showDuration: number;
  content: string;
  slug: string;
}

export interface PopupState {
  dismissed: boolean;
  version: string;
  timestamp: number;
}

export async function getPopupContent(): Promise<PopupContent | null> {
  try {
    const content = await getAllContent('popup');
    const popup = content[0];

    if (!popup?.frontmatter?.['enabled']) return null;

    return {
      title: popup.frontmatter['title'],
      version: popup.frontmatter['version'],
      enabled: popup.frontmatter['enabled'],
      showDuration: popup.frontmatter['showDuration'] || 30,
      content: popup.content,
      slug: popup.slug,
    };
  } catch {
    return null;
  }
}

export async function shouldShowPopup(popupContent: PopupContent): Promise<boolean> {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get('popup-state')?.value;

  if (!cookieValue) return true;

  try {
    const state: PopupState = JSON.parse(cookieValue);

    // Show if version changed
    if (state.version !== popupContent.version) return true;

    // Show if duration expired
    const daysSinceDismissed = (Date.now() - state.timestamp) / (1000 * 60 * 60 * 24);
    if (daysSinceDismissed > popupContent.showDuration) return true;

    return false;
  } catch {
    return true;
  }
}