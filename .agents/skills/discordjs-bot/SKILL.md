---
name: discordjs-bot
description: Build and maintain this repository's Discord adapter with discord.js, slash commands, Gateway events, and authenticated calls to the Killing Floor Zone Next.js API.
---

# Discord.js bot

Use this skill when editing the bot entrypoint, command modules, Discord installation/configuration, or calls from Discord into the web API.

## Repository conventions

- This project is CommonJS and uses `discord.js`; keep command modules under `commands/` and export `data` plus `execute(interaction)`.
- Keep Gateway intents minimal. The current feature set uses guild slash commands and does not need message-content or guild-member intents; add privileged intents only when a user-approved feature needs them.
- Dispatch commands through `client.commands`, defer slow interactions promptly, and handle command failures without logging interaction payloads, tokens, private Steam IDs, or user data.
- Make personal `/stats` replies ephemeral by default. `/link-steam` requests a short-lived, one-use Steam OpenID link from the web API; Steam identity verification runs only in Next.js.
- Restrict community setup/edit/remove commands to guild managers or administrators. Enforce the permission in command metadata and again in server-side command logic.
- Keep the Discord token and shared `BOT_API_SECRET` in server environment variables. This process must not receive a Steam API key or Supabase secret key and must never log request secrets or payloads.
- Make all Steam and database operations through the authenticated Next.js API. Schema and migration work belongs in the web repository and follows its Supabase skills.
- Register slash commands through a dedicated deployment script, not on every bot startup. Use a test guild during development and global commands for release.

## References

- [discord.js guide](https://discordjs.guide/)
- [discord.js API documentation](https://discord.js.org/docs/packages/discord.js/main)
- [Discord Application Commands](https://docs.discord.com/developers/interactions/application-commands)
