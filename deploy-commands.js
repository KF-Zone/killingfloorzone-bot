require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { REST, Routes } = require('discord.js');

const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token || !clientId) {
  throw new Error('TOKEN and CLIENT_ID must be configured to deploy commands.');
}

function findCommandFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return findCommandFiles(entryPath);
    }
    return entry.isFile() && entry.name.endsWith('.js') ? [entryPath] : [];
  });
}

const commandsPath = path.join(__dirname, 'commands');
const commands = findCommandFiles(commandsPath).map((filePath) => {
  const command = require(filePath);
  if (!command.data || typeof command.execute !== 'function') {
    throw new Error(`Invalid command module: ${path.relative(__dirname, filePath)}`);
  }
  return command.data.toJSON();
});

const rest = new REST({ version: '10' }).setToken(token);
const route = guildId
  ? Routes.applicationGuildCommands(clientId, guildId)
  : Routes.applicationCommands(clientId);

rest.put(route, { body: commands })
  .then(() => {
    const scope = guildId ? `test guild ${guildId}` : 'globally';
    console.log(`Registered ${commands.length} application commands ${scope}.`);
  })
  .catch((error) => {
    console.error(`Command registration failed (${error?.name || 'Error'}).`);
    process.exitCode = 1;
  });