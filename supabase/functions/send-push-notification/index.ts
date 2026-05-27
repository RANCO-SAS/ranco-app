import { createClient } from 'npm:@supabase/supabase-js@2.106.1';

type ServiceAccount = {
  project_id: string;
  client_email: string;
  private_key: string;
  token_uri: string;
};

type PushRequest = {
  notificationId?: string;
};

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  return atob(normalized + padding);
}

function encodeBase64Url(value: string): string {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function createGoogleAccessToken(serviceAccount: ServiceAccount): Promise<string> {
  const header = encodeBase64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const claimSet = encodeBase64Url(
    JSON.stringify({
      iss: serviceAccount.client_email,
      scope: 'https://www.googleapis.com/auth/firebase.messaging',
      aud: serviceAccount.token_uri,
      iat: now,
      exp: now + 3600,
    }),
  );

  const unsignedToken = `${header}.${claimSet}`;
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(serviceAccount.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    new TextEncoder().encode(unsignedToken),
  );

  const signedToken = `${unsignedToken}.${encodeBase64Url(String.fromCharCode(...new Uint8Array(signature)))}`;
  const response = await fetch(serviceAccount.token_uri, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: signedToken,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Google access token: ${response.status}`);
  }

  const json = (await response.json()) as { access_token?: string };

  if (!json.access_token) {
    throw new Error('Google access token missing in response');
  }

  return json.access_token;
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const contents = pem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s+/g, '');
  const binary = decodeBase64Url(contents);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes.buffer;
}

async function sendFcmMessage(
  accessToken: string,
  projectId: string,
  token: string,
  title: string,
  body: string,
  data: Record<string, string>,
): Promise<void> {
  const response = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: {
        token,
        notification: { title, body },
        data,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`FCM send failed (${response.status}): ${errorBody}`);
  }
}

Deno.serve(async (request) => {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const dispatchSecret = Deno.env.get('PUSH_DISPATCH_SECRET');
  const providedSecret = request.headers.get('x-push-dispatch-secret');

  if (!dispatchSecret || providedSecret !== dispatchSecret) {
    return new Response('Unauthorized', { status: 401 });
  }

  const serviceAccountRaw = Deno.env.get('FIREBASE_SERVICE_ACCOUNT');

  if (!serviceAccountRaw) {
    return new Response('Missing FIREBASE_SERVICE_ACCOUNT', { status: 500 });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response('Missing Supabase service configuration', { status: 500 });
  }

  const body = (await request.json()) as PushRequest;

  if (!body.notificationId) {
    return new Response('notificationId is required', { status: 400 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data: notification, error: notificationError } = await supabase
    .from('notifications')
    .select('id, user_id, title, body, data')
    .eq('id', body.notificationId)
    .maybeSingle();

  if (notificationError || !notification) {
    return new Response('Notification not found', { status: 404 });
  }

  const { data: tokens, error: tokensError } = await supabase
    .from('push_tokens')
    .select('token')
    .eq('user_id', notification.user_id);

  if (tokensError) {
    return new Response(tokensError.message, { status: 500 });
  }

  if (!tokens || tokens.length === 0) {
    return new Response(JSON.stringify({ sent: 0 }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const serviceAccount = JSON.parse(serviceAccountRaw) as ServiceAccount;
  const accessToken = await createGoogleAccessToken(serviceAccount);
  const data = Object.fromEntries(
    Object.entries((notification.data ?? {}) as Record<string, string>).map(([key, value]) => [
      key,
      String(value),
    ]),
  );

  let sent = 0;

  for (const entry of tokens) {
    try {
      await sendFcmMessage(
        accessToken,
        serviceAccount.project_id,
        entry.token,
        notification.title,
        notification.body,
        data,
      );
      sent += 1;
    } catch {
      // Best-effort per device token.
    }
  }

  return new Response(JSON.stringify({ sent }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
