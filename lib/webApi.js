const ERROR_MESSAGES = {
  unauthorized: 'The Killing Floor Zone API rejected this bot. Check its API configuration.',
  community_not_found: 'Run `/community setup` before setting an invitation or removing the listing.',
  steam_not_linked: 'Link your Steam account first with `/link-steam`.',
  invalid_invite_url: 'Use an invitation from discord.gg or discord.com/invite.',
};

function getApiOrigin() {
  const configuredUrl = process.env.WEB_API_BASE_URL;
  if (!configuredUrl) throw new Error('The web API URL is not configured.');

  let url;
  try {
    url = new URL(configuredUrl);
  }
 catch {
    throw new Error('The web API URL is invalid.');
  }

  if (url.username || url.password || url.search || url.hash) {
    throw new Error('The web API URL is invalid.');
  }
  if (url.pathname !== '/') throw new Error('The web API URL must not include a path.');
  if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') {
    throw new Error('The web API must use HTTPS in production.');
  }
  return url.origin;
}

async function postToWebApi(path, payload) {
  const secret = process.env.BOT_API_SECRET;
  if (!secret || secret.length < 32) throw new Error('The web API secret is not configured.');

  const url = new URL(`/api/internal/discord/${path}`, getApiOrigin());
  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(20000),
    });
  }
 catch {
    throw new Error('Killing Floor Zone could not be reached. Please try again later.');
  }

  let result;
  try {
    result = await response.json();
  }
 catch {
    throw new Error('Killing Floor Zone returned an invalid response.');
  }

  if (!response.ok) {
    throw new Error(ERROR_MESSAGES[result.error] || 'Killing Floor Zone could not complete this request.');
  }
  return result;
}

module.exports = { postToWebApi };
