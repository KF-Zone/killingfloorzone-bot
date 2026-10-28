const { EmbedBuilder, MessageFlags, SlashCommandBuilder } = require('discord.js');
const { postToWebApi } = require('../../lib/webApi');

const GAMES = {
  kf: { label: 'Killing Floor' },
  kf2: { label: 'Killing Floor 2' },
  kf3: { label: 'Killing Floor 3' },
};

function formatStatName(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100);
}

function formatStatValue(value) {
  const numericValue = Number(value);
  return Number.isInteger(numericValue)
    ? new Intl.NumberFormat('en').format(numericValue)
    : new Intl.NumberFormat('en', { maximumFractionDigits: 2 }).format(numericValue);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('View stats for your linked Steam account.')
    .addStringOption((option) => option
      .setName('game')
      .setDescription('Game to query; defaults to Killing Floor 2.')
      .addChoices(
        { name: 'Killing Floor', value: 'kf' },
        { name: 'Killing Floor 2', value: 'kf2' },
        { name: 'Killing Floor 3', value: 'kf3' },
      )
      .setRequired(false)),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const game = interaction.options.getString('game') || 'kf2';
      const result = await postToWebApi('steam/stats', {
        discordUserId: interaction.user.id,
        game,
      });
      const gameInfo = GAMES[game];
      const fields = result.stats.slice(0, 10).map(({ name, value }) => ({
        name: formatStatName(name) || 'Stat',
        value: formatStatValue(value),
        inline: true,
      }));
      const timestamp = new Date(result.fetchedAt).toLocaleString(interaction.locale || 'en');
      const embed = new EmbedBuilder()
        .setColor(0x9f1b1b)
        .setTitle(`${gameInfo.label} stats`)
        .setDescription(result.stale ? 'Steam could not refresh this snapshot; showing the last saved data.' : 'Your Steam stats, visible only to you.')
        .addFields(fields.length > 0 ? fields : [{ name: 'Stats', value: 'No stats are available for this profile.' }])
        .setFooter({ text: `Snapshot: ${timestamp}` });

      await interaction.editReply({ embeds: [embed], allowedMentions: { parse: [] } });
    }
 catch (error) {
      await interaction.editReply({ content: error.message || 'Could not load stats.' });
    }
  },
};
