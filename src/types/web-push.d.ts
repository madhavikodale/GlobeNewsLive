// Type declarations for web-push
declare module 'web-push' {
  export interface PushSubscription {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  }
  
  export interface WebPushError extends Error {
    statusCode: number;
    headers: Record<string, string>;
    body: string;
  }
  
  export function setVapidDetails(
    subject: string,
    publicKey: string,
    privateKey: string
  ): void;
  
  export function sendNotification(
    subscription: PushSubscription,
    payload?: string,
    options?: {
      TTL?: number;
      urgency?: 'very-low' | 'low' | 'normal' | 'high';
      topic?: string;
    }
  ): Promise<{ statusCode: number; headers: Record<string, string>; body: string }>;
  
  export function generateVAPIDKeys(): {
    publicKey: string;
    privateKey: string;
  };
}
