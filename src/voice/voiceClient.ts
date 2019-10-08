import * as Discord from 'discord.js';

import { VoiceConnection } from './voiceConnection';

export class VoiceClient {
	private gatewayWs: WebSocket;
	private connection: VoiceConnection;

	constructor(vc: Discord.VoiceChannel) {
		this.channel = vc;

		let obj = this.channel.client as any;
		this.gatewayWs = obj.ws.connection.ws;
		this.connection = new VoiceConnection(vc);

		this.isConnected = false;
	}

	public isConnected: boolean;
	public channel: Discord.VoiceChannel;

	private canConnect(): boolean {
		if (this.isConnected) return false;
		let client: Discord.Client = this.channel.client;
		if (client.user.id === this.channel.guild.ownerID) return true;

		let permissions: Discord.Permissions = this.channel.permissionsFor(client.user);
		if (!permissions) return false;
		if (!permissions.has(['VIEW_CHANNEL', 'CONNECT'])) return false;
		if (this.channel.full && !permissions.has('MANAGE_CHANNELS')) return false;

		return true;
	}

	private prepareConnection(): Promise<boolean> {
		return new Promise<boolean>((resolve, _) => {
			if (!this.canConnect()) {
				resolve(false);
				return;
			}

			let phase: number = 0;
			let listener = (e: MessageEvent) => {
				let data = JSON.parse(e.data);
				if (data.d && data.d.guild_id === this.channel.guild.id && data.t) {
					switch (data.t) {
						case 'VOICE_SERVER_UPDATE':
							this.connection.setEndpointAndToken(data.d.endpoint, data.d.token);
							if (++phase >= 2) {
								this.gatewayWs.removeEventListener('message', listener);
								resolve(true);
							}
							break;
						case 'VOICE_STATE_UPDATE':
							this.connection.setSessionId(data.d.session_id);
							if (++phase >= 2) {
								this.gatewayWs.removeEventListener('message', listener);
								resolve(true);
							}
							break;
					}
				}
			};

			setTimeout(() => resolve(false), 5000);
			this.gatewayWs.addEventListener('message', listener);
			this.gatewayWs.send(JSON.stringify({
				op: 4,
				d: {
					guild_id: this.channel.guild.id,
					channel_id: this.channel.id,
					self_mute: false,
					self_deaf: false,
				}
			}));
		});
	}

	public async connect(): Promise<boolean> {
		let success: boolean = await this.prepareConnection();
		if (!success) return false;
		this.isConnected = true;
		this.connection.initiate();

		return true;
	}

	public disconnect(): void {
		if (!this.isConnected) return;
		this.connection.destroy();
		this.isConnected = false;
	}
}