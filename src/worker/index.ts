// Minimal worker that serves static React app
export default {
  async fetch(request: Request, env: { ASSETS: Fetcher }): Promise<Response> {
    const url = new URL(request.url);
    
    // For SPA routing - if it's not a file request, serve index.html
    if (!url.pathname.includes('.') && !url.pathname.startsWith('/api')) {
      const indexRequest = new Request(new URL('/', request.url), request);
      return env.ASSETS.fetch(indexRequest);
    }
    
    // For all other requests (static assets), pass through to ASSETS
    return env.ASSETS.fetch(request);
  }
};
