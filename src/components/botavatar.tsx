import * as React from 'react';
import * as Discord from 'discord.js';
import { ConduitProps } from "../interfaces/conduitprops";

export class BotAvatar extends React.Component<ConduitProps, {}> {
    constructor(props: any) {
        super(props);

        this.props.client
            .on('ready', this.onReady.bind(this))
            .on('userUpdate', this.onUserUpdate.bind(this));
    }

    private onReady(): void {
        let avatar: HTMLElement = document.getElementById('bot-avatar');
        let img: HTMLImageElement = avatar.children.item(0) as HTMLImageElement;
        img.src = this.props.client.user.avatarURL;
    }

    private onUserUpdate(_: Discord.User, newUser: Discord.User): void {
        if (this.props.client.user.id === newUser.id) {
            let avatar: HTMLElement = document.getElementById('bot-avatar');
            let img: HTMLImageElement = avatar.children.item(0) as HTMLImageElement;
            img.src = newUser.avatarURL;
        }
    }

    private onClick(_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
        let avatar: HTMLElement = document.getElementById('bot-avatar');
        let fileInput: HTMLInputElement = avatar.children.item(2) as HTMLInputElement;
        fileInput.click();
    }

    private onChange(e: React.ChangeEvent<HTMLInputElement>): void {
        let fileReader: FileReader = new FileReader();
        fileReader.onload = () => {
            let arrayBuffer: ArrayBuffer = fileReader.result as ArrayBuffer;
            let array: Uint8Array = new Uint8Array(arrayBuffer);
            let base64: string = btoa(String.fromCharCode.apply(null, array));
            console.log(base64);
            this.props.loader.load(this.props.client.user.setAvatar(base64))
                .then(_ => {
                    this.props.logger.success('New avatar set');
                    let avatar: HTMLElement = document.getElementById('bot-avatar');
                    let img: HTMLImageElement = avatar.children.item(0) as HTMLImageElement;
                    img.src = this.props.client.user.avatarURL;
                })
        };

        fileReader.readAsArrayBuffer(e.target.files[0]);
    }

    render(): JSX.Element {
        return <div id='bot-avatar'>
            <img alt='avatar' />
            <button onClick={this.onClick}>Change Avatar</button>
            <input onChange={this.onChange.bind(this)} type='file' accept="image/png,image/jpeg"/>
        </div>
    }
}