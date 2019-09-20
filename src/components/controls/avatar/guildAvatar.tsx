import { Avatar, AvatarProps } from './avatar';
import { HttpClient, HttpResult } from '../../../utils/httpClient';
import { Guild, GuildMember } from 'discord.js';
import { ActionReporter } from '../../../utils/actionReporter';

export interface GuildAvatarProps extends AvatarProps {
    guild: Guild;
    reporter: ActionReporter;
}

export class GuildAvatar extends Avatar<GuildAvatarProps> {
    private httpClient: HttpClient;

    constructor(props: GuildAvatarProps) {
        super(props);

        this.httpClient = new HttpClient();
        this.props.client.on('guildUpdate', (_, guild: Guild) => {
            if (guild.id !== this.props.guild.id) return;
            this.updateAvatar(guild);
        });
    }

    private updateAvatar(guild: Guild): void {
        let avatar: HTMLElement = document.getElementById(this.props.id);
        let img: HTMLImageElement = avatar.children[0] as HTMLImageElement;
        let url = `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`;
        if (url) {
            img.src = url;
        } else {
            img.alt = guild.name[0];
        }
    }

    protected onValidated(fileType: string, base64: string): void {
        let botMember: GuildMember = this.props.guild.member(this.props.client.user);
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
}