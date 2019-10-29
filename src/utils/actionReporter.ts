import * as Discord from 'discord.js';

export class ActionReporter {
	private client: Discord.Client;

	constructor (client: Discord.Client) {
		this.client = client;
	}

	public formatChannel(chan: Discord.GuildChannel): string {
		if (!chan) return '';

		if (chan.type === 'category') {
			return `category \`${chan.name}\` (**${chan.id}**)`;
		} else {
			return `channel \`${chan.name} [ ${chan.type} ]\` (**${chan.id}**)`;
		}
	}

	private async getGuildOwner(guild: Discord.Guild): Promise<Discord.GuildMember> {
		let owner: Discord.GuildMember = null;
		if (guild.members.has(guild.ownerID)) {
			owner = guild.members.get(guild.ownerID);
		} else {
			try {
				owner = await guild.fetchMember(guild.ownerID, true);
			} catch {
				owner = null;
			}
		}

		return owner;
	}

	private async getUser(userId: string): Promise<Discord.User> {
		let user: Discord.User = null;
		if (this.client.users.has(userId)) {
			user = this.client.users.get(userId);
		} else {
			try {
				user = await this.client.fetchUser(userId, true);
			} catch {
				user = null;
			}
		}

		return user;
	}

	private notifyGuild(guild: Discord.Guild, embed: Discord.RichEmbed): void {
		this.getGuildOwner(guild)
			.then((owner: Discord.GuildMember) => {
				if (!owner) {
					if (guild.systemChannel && guild.systemChannel.permissionsFor(this.client.user).has('SEND_MESSAGES')) {
						let chan: Discord.TextChannel = guild.systemChannel as Discord.TextChannel;
						chan.send('', embed);
					}
				}

				owner.createDM()
					.then((dmChannel: Discord.DMChannel) => dmChannel.send('', embed))
					.catch(_ => {
						if (guild.systemChannel && guild.systemChannel.permissionsFor(this.client.user).has('SEND_MESSAGES')) {
							let chan: Discord.TextChannel = guild.systemChannel as Discord.TextChannel;
							chan.send('', embed);
						}
					});
			});
	}

	private notifyUser(userId: string, embed: Discord.RichEmbed): void {
		this.getUser(userId)
			.then((user: Discord.User) => {
				if (!user) return;
				user.createDM().then((dmChannel: Discord.DMChannel) => dmChannel.send('', embed));
			});
	}

	public reportGuildAction(action: string, guild: Discord.Guild): void {
		if (action.length > 1024) {
			action = `${action.slice(0, 1000)}...`;
		}

		let embed: Discord.RichEmbed = new Discord.RichEmbed({
			title: 'Conduit Reporter',
			/*description: `- Conduit is a system used by developers to manage their discord bots.

			- This message has been sent to you because changes were made to one of the servers / guilds you own.

			- You will receive this kind of message each time a server belonging to you is modified from our service, if you wish not to receive these messages anymore type \`conduit-stop\` in this channel.

			- If you have reasons to believe that someone is using **this bot** in a malicious way, we recommend you get rid of it in all of your servers / guilds and that you report it to our service / administrators.`,
			*/
			color: 0xB51235,
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

		this.notifyGuild(guild, embed);
	}

	public reportAction(action: string, userId: string): void{
		if (action.length > 1024) {
			action = `${action.slice(0, 1000)}...`;
		}

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

		this.notifyUser(userId, embed);
	}
}