import * as Discord from 'discord.js';

import { HttpClient, HttpResult } from './httpclient';

export class RestClient {
    private httpClient: HttpClient;
    private client: Discord.Client;

    constructor(client: Discord.Client) {
        this.client = client;
        this.httpClient = new HttpClient();
    }

    private defaultFetchAPI(path: string): Promise<HttpResult> {
        return this.httpClient.get(`https://discordapp.com/api/` + path, {
            'Authorization': `Bot ${this.client.token}`,
            'Content-Type': 'application/json',
        });
    }

    private async fetchGuildChannels(guild: Discord.Guild): Promise<void> {
        let res: HttpResult = await this.defaultFetchAPI(`guilds/${guild.id}/channels`);
        if (res.isSuccess()) {
            let dataArray: Array<object> = res.asObject<Array<object>>();
            for (let data of dataArray) {
                let chan: Discord.GuildChannel = new Discord.GuildChannel(guild, data);
                guild.channels.set(chan.id, chan);
            }
        }
    }

    public async fetchGuild(guildId: string): Promise<Discord.Guild> {
        let res: HttpResult = await this.defaultFetchAPI(`guilds/${guildId}`);
        if (res.isSuccess()) {
            let data: object = res.asObject<object>();
            let guild = new Discord.Guild(this.client, data);
            await this.fetchGuildChannels(guild);
            return guild;
        }

        return null;
    }

    public async fetchChannel(chanId: string): Promise<Discord.Channel> {
        let res: HttpResult = await this.defaultFetchAPI(`channels/${chanId}`);
        if (res.isSuccess()) {
            let data: object = res.asObject<object>();
            return new Discord.Channel(this.client, data);
        }

        return null;
    }
}