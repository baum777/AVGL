import { clearCookie } from '../../src/github-app-auth.js';

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error:'Use POST /api/github-app/disconnect.' });
  }
  response.setHeader('Set-Cookie', [
    clearCookie('avgl_github_user_session'),
    clearCookie('avgl_github_state'),
    clearCookie('avgl_github_oauth_state')
  ]);
  return response.status(200).json({ disconnected:true });
}
