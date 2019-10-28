import * as Discord from 'discord.js';

import { HttpClient, HttpResult } from './httpclient';

class Cache<T> {
    private objects: Discord.Collection<string, T>;
    private timeout: number;

    constructor (timeout: number) {
        this.objects = new Discord.Collection();
        this.timeout = timeout;
    }

    public cache(id: string, object: T): void {
        this.objects.set(id, object);
        setTimeout(() => this.objects.delete(id), this.timeout);
    }

    public isCached(id: string): boolean {
        return this.objects.has(id);
    }

    public get(id: string): T {
        return this.objects.get(id);
    }
}

class RestCache {
    public guilds: Cache<Discord.Guild>;
    public guildChannels: Cache<Discord.GuildChannel>;

    constructor (timeout: number) {
        this.guilds = new Cache<Discord.Guild>(timeout);
        this.guildChannels = new Cache<Discord.GuildChannel>(timeout);
    }
}

export class RestClient {
    private httpClient: HttpClient;
    private client: Discord.Client;
    private cache: RestCache;

    constructor(client: Discord.Client) {
        this.client = client;
        this.httpClient = new HttpClient();
        this.cache = new RestCache(3000);
    }

    private defaultFetchAPI(path: string): Promise<HttpResult> {
        return this.httpClient.get(`https://discordapp.com/api/${path}`, {
            'Authorization': `Bot ${this.client.token}`,
            'Content-Type': 'application/json',
        });
    }

    private createGuildChannel(guild: Discord.Guild, data: any): Discord.GuildChannel {
        switch (data.type) {
            case 0: // text
            case 5: // news
            case 6: // store
                return new Discord.TextChannel(guild, data);
            case 2: // voice
                return new Discord.VoiceChannel(guild, data);
            case 4: // category
                return new Discord.CategoryChannel(guild, data);
            default:
                return null;
        }
    }

    private async fetchGuildChannels(guild: Discord.Guild): Promise<void> {
        let res: HttpResult = await this.defaultFetchAPI(`guilds/${guild.id}/channels`);
        if (res.isSuccess()) {
            let dataArray: Array<object> = res.asObject<Array<object>>();
            for (let data of dataArray) {
                let chan: Discord.GuildChannel = this.createGuildChannel(guild, data)
                if (!chan) continue;

                guild.channels.set(chan.id, chan);
            }
        }
    }

    public async fetchGuild(guildId: string): Promise<Discord.Guild> {
        if (this.cache.guilds.isCached(guildId)) {
            return this.cache.guilds.get(guildId);
        }

        let res: HttpResult = await this.defaultFetchAPI(`guilds/${guildId}`);
        if (res.isSuccess()) {
            let data: object = res.asObject<object>();
            let guild = new Discord.Guild(this.client, data);
            await this.fetchGuildChannels(guild);

            this.cache.guilds.cache(guild.id, guild);
            return guild;
        }

        return null;
    }

    public async fetchGuildChannel(guild: Discord.Guild, chanId: string): Promise<Discord.GuildChannel> {
        if (this.cache.guildChannels.isCached(chanId)) {
            return this.cache.guildChannels.get(chanId);
        }

        let res: HttpResult = await this.defaultFetchAPI(`channels/${chanId}`);
        if (res.isSuccess()) {
            let data: object = res.asObject<any>();
            let chan: Discord.GuildChannel = this.createGuildChannel(guild, data);
            if (!chan) return null;

            if (chan.type != 'category') {
                let parent: Discord.GuildChannel = await this.fetchGuildChannel(guild, chan.parentID);
                if (parent) {
                    guild.channels.set(parent.id, parent);
                }
            }

            this.cache.guildChannels.cache(chan.id, chan);
            return chan;
        }

        return null;
    }
}