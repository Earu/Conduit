import * as Discord from 'discord.js';

import { HttpClient, HttpResult } from './httpclient';

interface RestObject<T> {
    toWSObject(): T;
}

export class RestGuild implements RestObject<Discord.Guild> {
    public id: string;
    public name: string;
    public channels: Discord.Collection<string, Discord.GuildChannel>;
    public roles: Discord.Collection<string, Discord.Role>;
    public members: Discord.Collection<string, Discord.GuildMember>;

    public toWSObject(): Discord.Guild {
        // TODO: fill in fields not handled by REST objects

        return null;
    }
}

export class RestClient {
    private httpClient: HttpClient;
    private token: string;

    constructor(token: string) {
        this.httpClient = new HttpClient();
        this.token = token;
    }

    public async fetchGuild(guildId: string): Promise<Discord.Guild> {
        let res: HttpResult = await this.httpClient.get(`https://discordapp.com/api/guilds/${guildId}`, {
            'Authorization': `Bot ${this.token}`,
            'Content-Type': 'application/json',
        });

        if (res.isSuccess()) {
            let restGuild: RestGuild = res.asObject<RestGuild>();
            return restGuild.toWSObject();
        } 

        return null;
    }
}