# Killing Floor Zone Discord bot

Discord.js bot for community directory management and private Steam statistics.

## Requirements

- Node.js 22.13 or newer.
- A Discord application with a bot token and application ID.
- The public URL of the Killing Floor Zone Next.js deployment and a shared bot API secret.
- A persistent Node.js host. The process maintains the Discord Gateway connection; serverless-only hosting is not sufficient for the bot itself.

## Local setup

1. Copy .env.example to .env and configure the values from Discord Developer Portal and the Killing Floor Zone API deployment.
2. Install the pinned dependencies with npm ci.
3. Register commands in a development guild by setting GUILD_ID, then run npm run deploy-commands.
4. Run npm run dev for local development or npm start to run the bot.
5. Use npm run lint before submitting changes.

WEB_API_BASE_URL must be the web origin only, with no path. Production requires HTTPS; local development can use http://localhost. Set BOT_API_SECRET to the same random secret configured in Vercel. GUILD_ID is optional; without it, commands are registered globally. Never commit .env or put tokens in command output.

## Commands

- /community setup: create or update the current server's directory listing.
- /community invite-url: publish it with an existing Discord invite.
- /community invite-create: ask the bot to create and save an invite for a selected channel. The bot needs Create Instant Invite only in that channel.
- /community remove: unpublish the listing.
- /link-steam: privately create a one-use, ten-minute Steam OpenID link.
- /stats: privately show cached stats for the linked Steam account; expired data refreshes on demand and the last snapshot is shown if Steam is unavailable.
- /unlink-steam: remove the Steam link and its saved stats.

The bot does not scan guild members or read messages. It is a Discord adapter: Steam OpenID, Steam API calls, Supabase access, and the 24-hour stats snapshot cache are handled by the Next.js API. The bot itself holds no Steam or Supabase credentials.

## Supabase migration

The canonical schema is in the web repository at `supabase/migrations/20261028101704_discord_community_steam_bot.sql`. Review and apply it to the intended Supabase project through the web repository's migration workflow before using the database-backed commands. The repository MCP is read-only and does not apply migrations.

## Repository guidance

See AGENTS.md and .agents/skills/ for project conventions. The Supabase MCP config in .codex/config.toml is limited to the Killing Floor Zone project and read-only database/documentation access; authenticate it in Codex with OAuth.
