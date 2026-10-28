require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, MessageFlags } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

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
for (const filePath of findCommandFiles(commandsPath)) {
  const command = require(filePath);
  if (!command.data || typeof command.execute !== 'function') {
    console.warn(`Skipped invalid command module: ${path.relative(__dirname, filePath)}`);
    continue;
  }

  client.commands.set(command.data.name, command);
}

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready as ${readyClient.user.username}; loaded ${client.commands.size} commands.`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  const command = client.commands.get(interaction.commandName);
  if (!command) {
    return;
  }

  try {
    await command.execute(interaction);
  }
 catch (error) {
    console.error(`Command /${interaction.commandName} failed (${error?.name || 'Error'}).`);
    const reply = { content: 'This command could not be completed. Please try again later.' };

    try {
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(reply);
      }
 else {
        await interaction.reply({ ...reply, flags: MessageFlags.Ephemeral });
      }
    }
 catch {
      console.error(`Could not reply to /${interaction.commandName}.`);
    }
  }
});

client.login(process.env.TOKEN).catch((error) => {
  console.error(`Discord login failed (${error?.name || 'Error'}).`);
  process.exitCode = 1;
});
