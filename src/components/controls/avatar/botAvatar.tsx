import * as Discord from 'discord.js';

import { Avatar, AvatarProps } from './avatar';
import { HttpClient, HttpResult } from '../../../utils/httpClient';

export class BotAvatar extends Avatar<AvatarProps> {
    private httpClient: HttpClient;

    constructor(props: any) {
        super(props);

        this.httpClient = new HttpClient();
        this.props.client
            .on('ready', this.onReady.bind(this))
            .on('userUpdate', this.onUserUpdate.bind(this));
    }

    private updateAvatar(): void {
        let avatar: HTMLElement = document.getElementById(this.props.id);
        let img: HTMLImageElement = avatar.children[0] as HTMLImageElement;
        let url = this.props.client.user.avatarURL;
        if (url) {
            img.src = url;
        } else {
            img.src = '';
            let parts: Array<string> = this.props.client.user.username.split(' ');
            img.alt = parts.map((p: string) => p[0]).join('');
        }
    }

    private onReady(): void {
        this.updateAvatar();
    }

    private onUserUpdate(_: Discord.User, newUser: Discord.User): void {
        if (this.props.client.user.id === newUser.id) {
            this.updateAvatar();
        }
    }

    protected onValidated(fileType: string, base64: string): void {
        let body: string = JSON.stringify({
            username: this.props.client.user.username,
            avatar: `data:${fileType};base64,${base64}`,
        });
        this.props.loader.load(this.httpClient.patch('https://discordapp.com/api/users/@me', body, {
            'Authorization': `Bot ${this.props.client.token}`,
            'Content-Type': 'application/json',
        })).then((res: HttpResult) => {
            if (res.isSuccess()) {
                this.props.logger.success('New avatar set');
                this.updateAvatar();
            } else {
                let obj = res.asObject<{ avatar?: Array<string> }>();
                if (obj.avatar && obj.avatar[0]) {
                    this.props.logger.error(obj.avatar[0]);
                } else {
                    this.props.logger.error('Coult not set new avatar');
                }
            }
        });
    }
}