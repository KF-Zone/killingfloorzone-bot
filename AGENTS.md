# Killing Floor Zone Discord bot

## Project context

- Node.js CommonJS service using `discord.js` Gateway.
- Slash commands live under `commands/`; the current entrypoint subscribes only to the `Guilds` intent.
- The bot is a Discord adapter for the authenticated Next.js API. Community configuration, Steam account linking, Steam API calls, Supabase access, and stats snapshots belong to the web app.

## Working rules

- Keep package versions exact and synchronize `package-lock.json`.
- Keep `.env`, Discord credentials, and `BOT_API_SECRET` out of version control and logs. The bot must not contain Steam or Supabase credentials. `.env.example` contains names only.
- Preserve the minimal Gateway intent set. Do not enable message-content or member-list intents for the initial feature.
- `/stats` is for the requesting Discord account after Steam has been verified and linked once. Do not bulk scan or synchronize guild members.
- Verify guild-manager permissions for community configuration on every command. Request only the permissions needed for the selected operation.
- Call the web API for stats; do not access Steam or Supabase directly from this repository. The web app owns the persistent 24-hour snapshot cache.
- Database schema and migrations live in the web repository. For Supabase work there, follow its Supabase skills and migration workflow.
- Use the `discordjs-bot` skill for command, interaction, and Discord integration work.
- `.codex/config.toml` defines a project-scoped, read-only Supabase MCP. Complete OAuth in Codex; do not store MCP tokens in the repo.
