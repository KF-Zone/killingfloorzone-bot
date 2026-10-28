const { MessageFlags, SlashCommandBuilder } = require('discord.js');
const { postToWebApi } = require('../../lib/webApi');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlink-steam')
    .setDescription('Unlink your Steam account and delete its saved stats.'),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const { unlinked } = await postToWebApi('steam/unlink', { discordUserId: interaction.user.id });
    if (!unlinked) {
      return interaction.editReply({ content: 'No Steam account is linked to your Discord account.' });
    }

    return interaction.editReply({
      content: 'Your Steam account was unlinked and its saved stats were deleted.',
    });
  },
};
