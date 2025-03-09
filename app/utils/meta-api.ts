interface MetaEvent {
  event_name: string;
  event_time: number;
  event_source_url: string;
  action_source: 'website';
  user_data: {
    client_ip_address?: string;
    client_user_agent: string;
    fbp?: string;
    fbc?: string;
    country?: string;
    email?: string;
    external_id?: string;
  };
  custom_data?: Record<string, any>;
  event_id?: string;
}

export async function sendMetaEvent(event: MetaEvent) {
  try {
    const response = await fetch(
      `https://graph.facebook.com/${process.env.META_API_VERSION}/` +
      `${process.env.NEXT_PUBLIC_META_PIXEL_ID}/events`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: [event],
          access_token: process.env.META_API_ACCESS_TOKEN,
          test_event_code: process.env.NODE_ENV === 'development' ? 'TEST12345' : undefined,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Meta API Error: ${JSON.stringify(data)}`);
    }

    return data;
  } catch (error) {
    console.error('Failed to send Meta event:', error);
    throw error;
  }
} 