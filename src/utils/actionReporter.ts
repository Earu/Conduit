import * as Discord from 'discord.js';

export class ActionReporter {
	private client: Discord.Client;

	constructor(client: Discord.Client) {
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
		if (guild.members.has(guild.ownerID)) {
			return guild.members.get(guild.ownerID);
		}

		return await guild.fetchMember(guild.ownerID, true);
	}

	private async getUser(userId: string): Promise<Discord.User> {
		if (this.client.users.has(userId)) {
			return this.client.users.get(userId);
		}

		return await this.client.fetchUser(userId, true);
	}

	private notifyGuild(guild: Discord.Guild, embed: Discord.RichEmbed): void {
		if (guild.systemChannel && guild.systemChannel.permissionsFor(this.client.user).has('SEND_MESSAGES')) {
			let chan: Discord.TextChannel = guild.systemChannel as Discord.TextChannel;
			chan.send(`<@!${guild.ownerID}>`, embed);
		}
	}

	private notifyGuildOwner(guild: Discord.Guild, embed: Discord.RichEmbed): void {
		this.getGuildOwner(guild)
			.then((owner: Discord.GuildMember) => {
				if (!owner) {
					this.notifyGuild(guild, embed);
				}

				owner.createDM()
					.then((dmChannel: Discord.DMChannel) => {
						embed.addField('Guild', `\`${guild.name}\` (**${guild.id}**)`, false);
						dmChannel.send('', embed)
							.catch(_ => this.notifyGuild(guild, this.createEmbed(embed.fields[0].value)));
					})
					.catch(_ => this.notifyGuild(guild, embed));
			});
	}

	private notifyUser(userId: string, embed: Discord.RichEmbed): void {
		this.getUser(userId)
			.then((user: Discord.User) => {
				if (!user) return;
				user.createDM().then((dmChannel: Discord.DMChannel) => dmChannel.send('', embed));
			});
	}

	private createEmbed(action: string, addDescription = false): Discord.RichEmbed {
		let embed: Discord.RichEmbed = new Discord.RichEmbed()
			.setTitle('Conduit Reporter')
			.setColor(0xB51235)
			.addField('Action Performed', action, true);

		if (addDescription) {
			embed.setDescription(`- Conduit is a system used by developers to manage their discord bots.

			- This message has been sent to you because changes were made to one of the servers / guilds you own.

			- You will receive this kind of message each time a server belonging to you is modified from our service, if you wish not to receive these messages anymore type \`conduit-stop\` in this channel.

			- If you have reasons to believe that someone is using **this bot** in a malicious way, we recommend you get rid of it in all of your servers / guilds and that you report it to our service / administrators.`);
		}

		return embed;
	}

	public reportGuildAction(action: string, guild: Discord.Guild): void {
		if (action.length > 1024) {
			action = `${action.slice(0, 1000)}...`;
		}

		let embed: Discord.RichEmbed = this.createEmbed(action);
		this.notifyGuildOwner(guild, embed);
	}

	public reportAction(action: string, userId: string): void {
		if (action.length > 1024) {
			action = `${action.slice(0, 1000)}...`;
		}

		let embed: Discord.RichEmbed = this.createEmbed(action);
		this.notifyUser(userId, embed);
	}
}