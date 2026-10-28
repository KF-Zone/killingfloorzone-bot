# Killing Floor Zone Discord bot

Discord.js bot for managing community listings and viewing a linked Steam account's stats. The bot runs as a persistent process and uses the Killing Floor Zone Next.js API for Steam and database operations.

## Commands

In Discord, a command with a space is a root command followed by a subcommand. For example, `/community setup` is the `community` command with the `setup` option.

### Community management

```text
/community
├─ setup
├─ invite-url
├─ invite-create
└─ remove
```

| Command | What it does |
| --- | --- |
| `/community setup` | Creates or updates this server's listing: name, game, language, and optional description. Requires **Manage Server**. |
| `/community invite-url` | Publishes the listing with an existing `discord.gg` or `discord.com/invite` link. |
| `/community invite-create` | Creates and publishes a non-expiring invite for a selected channel. The bot needs **Create Invite** permission in that channel. |
| `/community remove` | Hides this server's listing from the directory. |

Set up the listing first, then choose one of the invitation commands to publish it.

### Player stats

| Command | What it does |
| --- | --- |
| `/link-steam` | Sends a private, one-use Steam verification link that expires after 10 minutes. Run this once before using `/stats`. |
| `/stats` | Shows up to ten stats for the linked account. Replies are private. Its optional `game` choice supports Killing Floor, Killing Floor 2, and Killing Floor 3; the default is Killing Floor 2. |
| `/unlink-steam` | Removes the Steam link and its saved stats. |

Steam linking is only needed for the bot to identify which account to show. The public website's search and player stats pages do not require login.

## Run locally

### Requirements

- Node.js 22.13 or newer.
- A Discord application with a bot token and application ID.
- A running Killing Floor Zone web API and a shared API secret.

### Configure and start

1. Copy `.env.example` to `.env`.
2. Set the environment variables:

   | Variable | Purpose |
   | --- | --- |
   | `TOKEN` | Discord bot token. |
   | `CLIENT_ID` | Discord application ID. |
   | `GUILD_ID` | Optional: register commands in one development server. Omit for global registration. |
   | `WEB_API_BASE_URL` | Web app origin only, such as `https://example.com` or `http://localhost:3000`; do not include a path. |
   | `BOT_API_SECRET` | High-entropy secret of at least 32 characters, shared with the Next.js deployment. Use HTTPS in production. |

3. Install the pinned dependencies with `npm ci`.
4. For development, set `GUILD_ID` and register commands with `npm run deploy-commands`.
5. Start the bot with `npm run dev` (watch mode) or `npm start`.

Run `npm run lint` before submitting changes. Never commit `.env` or include tokens and one-use Steam links in logs.

## Architecture and deployment

- Host the bot on a persistent Node.js service; it maintains a long-lived Discord Gateway connection.
- The bot handles Discord commands, permissions, and channel invitation creation.
- The Next.js API handles Steam OpenID, Steam Web API requests, Supabase, and the 24-hour stats cache. The bot does not store Steam or Supabase credentials.
- The bot does not read messages or scan server members. Each player starts their own Steam link.

Configure `STEAM_API_KEY`, `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `APP_BASE_URL`, and `BOT_API_SECRET` in the web deployment. Set `WEB_API_BASE_URL` and the same `BOT_API_SECRET` in the bot host.

## Repository guidance

See `AGENTS.md` and `.agents/skills/` for project conventions. The Supabase MCP config in `.codex/config.toml` is project-scoped and read-only; authenticate it in Codex with OAuth.
