import { GuildChannel } from 'discord.js';
import { RichEmbed } from 'discord.js';
import { Guild } from 'discord.js';
import { DMChannel } from 'discord.js';
import { User } from 'discord.js';

export class ActionReporter {
	public formatChannel(chan: GuildChannel): string {
		if (chan.type === 'category') {
			return `category \`${chan.name}\` (**${chan.id}**)`;
		} else {
			return `channel \`${chan.name} [ ${chan.type} ]\` (**${chan.id}**)`;
		}
	}

	public reportGuildAction(action: string, guild: Guild): void {
		if (action.length > 1024) {
			action = `${action.slice(0, 1000)}...`;
		}

		let embed: RichEmbed = new RichEmbed({
			title: 'Conduit Reporter',
			/*description: `- Conduit is a system used by developers to manage their discord bots.

			- This message has been sent to you because changes were made to one of the servers / guilds you own.

			- You will receive this kind of message each time a server belonging to you is modified from our service, if you wish not to receive these messages anymore type \`conduit-stop\` in this channel.

			- If you have reasons to believe that someone is using **this bot** in a malicious way, we recommend you get rid of it in all of your servers / guilds and that you report it to our service / administrators.`,
			*/color: 0xB51235,
			fields: [
				{
					name: 'Action performed',
					value: action,
					inline: true,
				},
				{
					name: 'Guild',
					value: `\`${guild.name}\` (**${guild.id}**)`,
					inline: false,
				}
			],
		});

		guild.owner.createDM().then((dmChannel: DMChannel) => dmChannel.send('', embed));
	}

	public reportAction(action: string, user: User): void{
		if (action.length > 1024) {
			action = `${action.slice(0, 1000)}...`;
		}

		let embed: RichEmbed = new RichEmbed({
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

		user.createDM().then((dmChannel: DMChannel) => dmChannel.send('', embed))
	}
}