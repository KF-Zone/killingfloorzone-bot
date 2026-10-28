# Discord bot: community listings and Steam stats

## Scope

The bot is a separate, persistent discord.js Gateway process. It configures public Discord community listings and lets each member retrieve stats for their own verified, linked Steam account. It does not scan guild members or read messages.

## Discord commands

- /community setup name game language description: creates or updates the current guild's listing. The command requires Manage Server both in its Discord command metadata and at execution time.
- /community invite-url url: saves an existing Discord invite.
- /community invite-create channel: creates a non-expiring invite for the selected channel. The bot needs Create Instant Invite in that channel only.
- /community remove: unpublishes the current guild's listing.
- /link-steam: responds privately with a one-use Steam identity verification link.
- /stats game: responds privately with up to ten stats for the linked account. The game is optional and defaults to Killing Floor 2.
- /unlink-steam: removes the Steam link and saved snapshots for that account.

A listing is public as soon as an invitation is set. There is no moderation queue in the initial implementation. Re-running setup updates listing details without clearing the existing invite. Removing a listing hides it but keeps its configuration row.

## Steam linking and privacy

The bot asks the Next.js API to create a hash-backed, ten-minute challenge. The short-lived raw token is delivered only in the ephemeral Discord reply. Next.js redirects the visitor to Steam OpenID, verifies the signed response with Steam, then atomically consumes the challenge and stores the verified SteamID. /stats sends the caller's Discord user ID and selected game to the authenticated web API; Steam identity is never supplied by a command option.

The /stats and account-link replies are private. The bot does not enable the message-content or guild-member intents. SteamIDs and credentials are never included in command responses or application logs. /unlink-steam deletes the identity mapping and its saved stats snapshots.

## Cache and Steam API

Stats are saved in Supabase by SteamID and game by the web app. A fresh snapshot is reused for 24 hours. An expired or missing snapshot triggers an on-demand Steam Web API request; concurrent requests within a web runtime instance share a single in-flight refresh. If refresh fails and an older snapshot exists, the API returns that stale snapshot. A daily scheduled ranking refresh is outside the current implementation.

Supported games are Killing Floor (1250), Killing Floor 2 (232090), and Killing Floor 3 (1430190). Steam may not return stats when a profile or game details are private.

## Runtime and configuration

Run the bot on a persistent Node.js host that supports a long-lived Discord Gateway connection. A serverless-only function host is not appropriate for this process. Steam linking callbacks and the JSON API run in the Next.js deployment.

Configure TOKEN, CLIENT_ID, WEB_API_BASE_URL, and BOT_API_SECRET in the bot host. Configure STEAM_API_KEY, SUPABASE_URL, SUPABASE_SECRET_KEY, APP_BASE_URL, and the matching BOT_API_SECRET in the Next.js deployment. GUILD_ID is optional for development command registration. The database migration lives in the web repository and must be applied through its migration workflow.

## Database access

The migration creates public-readable community listings filtered to published rows, and service-only Steam link/challenge/snapshot tables. RLS is enabled on all tables. Only server-side Next.js code uses the Supabase secret key; the bot does not receive database credentials.
