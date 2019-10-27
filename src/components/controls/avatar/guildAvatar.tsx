import * as Discord from 'discord.js';

import { Avatar, AvatarProps } from './avatar';
import { HttpClient, HttpResult } from '../../../http/httpclient';
import { ActionReporter } from '../../../utils/actionReporter';

export interface GuildAvatarProps extends AvatarProps {
    guild: Discord.Guild;
    reporter: ActionReporter;
}

export class GuildAvatar extends Avatar<GuildAvatarProps> {
    private httpClient: HttpClient;

    constructor(props: GuildAvatarProps) {
        super(props);

        this.httpClient = new HttpClient();
        this.props.client.on('guildUpdate', (_, guild: Discord.Guild) => {
            if (guild.id !== this.props.guild.id) return;
            this.updateAvatar(guild);
        });
    }

    private updateAvatar(guild: Discord.Guild): void {
        let avatar: HTMLElement = document.getElementById(this.props.id);
        let img: HTMLImageElement = avatar.getElementsByTagName('img')[0];
        let alt: HTMLSpanElement = avatar.getElementsByTagName('span')[0];

        if (guild.iconURL) {
            img.style.display = 'block';
            img.src = `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`;
            alt.textContent = '';
        } else {
            img.style.display = 'none';
            if (guild.name) {
                let parts: Array<string> = guild.name.split(' ');
                alt.textContent = parts.map((p: string) => p[0]).join('');
            } else {
                alt.textContent = '?';
            }
        }
    }

    protected onValidated(fileType: string, base64: string): void {
        let botMember: Discord.GuildMember = this.props.guild.member(this.props.client.user);
        if (!botMember.hasPermission('MANAGE_GUILD')) {
            this.props.logger.error(`You do not have the 'MANAGE_GUILD' permission for the guild [ ${this.props.guild.id} ]`);
            return;
        }

        let body: string = JSON.stringify({
            icon: `data:${fileType};base64,${base64}`,
        });
        this.props.loader.load(this.httpClient.patch(`https://discordapp.com/api/guilds/${this.props.guild.id}`, body, {
            'Authorization': `Bot ${this.props.client.token}`,
            'Content-Type': 'application/json',
        })).then((res: HttpResult) => {
            if (res.isSuccess()) {
                this.props.logger.success('New guild icon set');
                this.props.reporter.reportGuildAction('Changed guild\'s avatar', this.props.guild);
            } else {
                let obj = res.asObject<{ message?: string }>();
                if (obj.message) {
                    this.props.logger.error(obj.message);
                } else {
                    this.props.logger.error('Could not set new guild icon');
                }
            }
        });
    }

    componentDidUpdate(): void {
        this.updateAvatar(this.props.guild);
    }

    componentDidMount(): void {
        this.updateAvatar(this.props.guild);
    }
}