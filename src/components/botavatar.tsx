import * as React from 'react';
import * as Discord from 'discord.js';
import { ConduitProps } from "../interfaces/conduitprops";
import { HttpClient } from '../utils/httpclient';

export class BotAvatar extends React.Component<ConduitProps, {}> {
    private httpClient: HttpClient;

    constructor(props: any) {
        super(props);

        this.httpClient = new HttpClient();
        this.props.client
            .on('ready', this.onReady.bind(this))
            .on('userUpdate', this.onUserUpdate.bind(this));
    }

    private updateAvatar(): void {
        let avatar: HTMLElement = document.getElementById('bot-avatar');
        let img: HTMLImageElement = avatar.children.item(0) as HTMLImageElement;
        let url = this.props.client.user.avatarURL;
        if (url) {
            img.src = url;
        } else {
            img.alt = this.props.client.user.username[0];
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

    private onClick(_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
        let avatar: HTMLElement = document.getElementById('bot-avatar');
        let fileInput: HTMLInputElement = avatar.children.item(2) as HTMLInputElement;
        fileInput.click();
    }

    private onChange(e: React.ChangeEvent<HTMLInputElement>): void {
        let fileReader: FileReader = new FileReader();
        let file: File = e.target.files[0];
        fileReader.onload = () => {
            let arrayBuffer: ArrayBuffer = fileReader.result as ArrayBuffer;
            let array: Uint8Array = new Uint8Array(arrayBuffer);
            let base64: string = btoa(String.fromCharCode.apply(null, array));
            let body: string = JSON.stringify({
                username: this.props.client.user.username,
                avatar: `data:${file.type};base64,${base64}`,
            });
            this.httpClient.patch('https://discordapp.com/api/users/@me', body, {
                'Authorization': `Bot ${this.props.client.token}`,
                'Content-Type': 'application/json',
            }).then(res => {
                if (res.isSuccess()) {
                    this.props.logger.success('New avatar set');
                    this.updateAvatar();
                } else {
                    let obj = res.asObject();
                    if (obj.avatar && obj.avatar[0]) {
                        this.props.logger.error(obj.avatar[0]);
                    } else {
                        this.props.logger.error('Coult not set new avatar');
                    }
                }
            });
        };

        fileReader.readAsArrayBuffer(file);
    }

    render(): JSX.Element {
        return <div id='bot-avatar'>
            <img alt='avatar' />
            <button onClick={this.onClick}>Change Avatar</button>
            <input onChange={this.onChange.bind(this)} type='file' accept="image/png,image/jpeg"/>
        </div>
    }
}