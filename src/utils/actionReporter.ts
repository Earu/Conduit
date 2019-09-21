import * as Discord from 'discord.js';

export class ActionReporter {
	public reportGuildAction(action: string, guild: Discord.Guild): void {
		let embed: Discord.RichEmbed = new Discord.RichEmbed({
			title: 'Conduit Reporter',
			description: `- Conduit is a system used by developers to manage their discord bots.

			- This message has been sent to you because changes were made to one of the servers / guilds you own.

			- You will receive this kind of message each time a server belonging to you is modified from our service, if you wish not to receive these messages anymore type \`conduit-stop\` in this channel.

			- If you have reasons to believe that someone is using **this bot** in a malicious way, we recommend you get rid of it in all of your servers / guilds and that you report it to our service / administrators.`,
			color: 0xB51235,
			fields: [
				{
					name: 'Action performed',
					value: action,
					inline: true,
				},
				{
					name: 'Guild',
					value: `${guild.name} (${guild.id})`,
					inline: false,
				}
			]
		});

		guild.owner.createDM().then((dmChannel: Discord.DMChannel) => dmChannel.send('', embed));
	}

	public reportAction(action: string, user: Discord.User): void{
		let embed: Discord.RichEmbed = new Discord.RichEmbed({
			title: 'Conduit Reporter',
			description: `- Conduit is a system used by developers to manage their discord bots.

			- This message has been sent to you because you are concerned by the data accessed / modified.

			- You will receive this kind of message each time data belonging to you is accessed / modified from our service, if you wish not to receive these messages anymore type \`conduit-stop\` in this channel.

			- If you have reasons to believe that someone is using **this bot** in a malicious way, we recommend you get rid of it in all of your servers / guilds and that you report it to our service / administrators.`,
			color: 0xB51235,
			fields: [
				{
					name: 'Action performed',
					value: action,
					inline: true,
				},
			],
		});

		user.createDM().then((dmChannel: Discord.DMChannel) => dmChannel.send('', embed))
	}
}