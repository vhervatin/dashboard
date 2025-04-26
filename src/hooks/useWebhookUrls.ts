import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { defaultWebhookUrls, type WebhookUrls } from '@/config/webhooks';

interface WebhookUrlsStore {
  urls: WebhookUrls;
  setUrls: (urls: WebhookUrls) => void;
  resetUrls: () => void;
}

export const useWebhookUrls = create<WebhookUrlsStore>()(
  persist(
    (set) => ({
      urls: defaultWebhookUrls,
      setUrls: (newUrls) => set({ urls: newUrls }),
      resetUrls: () => set({ urls: defaultWebhookUrls }),
    }),
    {
      name: 'webhook-urls-storage',
    }
  )
); 