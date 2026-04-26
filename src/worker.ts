interface Env {
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
}

export default {
  async fetch(request: Request, env: Env) {
    try {
      const url = new URL(request.url);

      // Proxy /api/* to your backend
      if (url.pathname.startsWith('/api/')) {
        const backendUrl = `https://api.wealthra.cloud${url.pathname}${url.search}`;

        // Create a new request for the backend
        const headers = new Headers(request.headers);
        headers.delete('host');
        // Forward real client information to the backend
        headers.set('X-Forwarded-For', request.headers.get('CF-Connecting-IP') || '');
        headers.set('X-Forwarded-Proto', 'https');
        headers.set('X-Forwarded-Host', url.host);

        const proxyRequest = new Request(backendUrl, {
          method: request.method,
          headers: headers,
          body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
          redirect: 'follow',
        });

        return await fetch(proxyRequest);
      }

      // Serve static assets
      if (!env.ASSETS) {
        return new Response('ASSETS binding not found in env', { status: 500 });
      }

      return await env.ASSETS.fetch(request);
    } catch (err: any) {
      return new Response(`Worker Error: ${err.message}\n${err.stack}`, { status: 500 });
    }
  },
};
