import * as Discord from 'discord.js';

enum OpCode {
	Dispatch = 0,
	HeartBeat = 1,
	Identity = 2,
	StatusUpdate = 3,
	VoiceStateUpdate = 4,
	Resume = 6,
	Reconnect = 7,
	RequestGuildMembers = 8,
	InvalidSession = 9,
	Hello = 10,
	HeartBeatACK = 11,
}

export class VoiceClient {
	private gatewayWs: WebSocket;
	private voiceWs: WebSocket;

	private token: string;
	private endpoint: string;
	private sessionId: string;

	constructor(vc: Discord.VoiceChannel) {
		this.channel = vc;

		let obj = this.channel.client as any;
		this.gatewayWs = obj.ws.connection.ws;

		this.isConnected = false;
	}

	public isConnected: boolean;
	public channel: Discord.VoiceChannel;

	public prepareConnection(): Promise<boolean> {
		return new Promise<boolean>((resolve, _) => {
			if (this.isConnected) {
				resolve(false);
				return;
			}

			let phase: number = 0;
			let listener = (e: MessageEvent) => {
				let data = JSON.parse(e.data);
				if (data.d && data.d.guild_id === this.channel.guild.id && data.t) {
					switch (data.t) {
						case 'VOICE_SERVER_UPDATE':
							this.token = data.d.token;
							this.endpoint = data.d.endpoint;

							if (++phase >= 2) {
								this.isConnected = true;
								this.gatewayWs.removeEventListener('message', listener);
								resolve(true);
							}
							break;
						case 'VOICE_STATE_UPDATE':
							this.sessionId = data.d.session_id;

							if (++phase >= 2) {
								this.isConnected = true;
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
				op: OpCode.VoiceStateUpdate,
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
		if (!success) {
			return false;
		}

		this.voiceWs = new WebSocket(`ws://${this.endpoint}?v=3&encoding=json`);
		this.voiceWs.onmessage = console.debug;
		this.voiceWs.onclose = console.debug;
		this.voiceWs.onopen = console.debug;

		this.voiceWs.send(JSON.stringify({
			op: OpCode.Dispatch,
			d: {
				server_id: this.channel.guild.id,
				user_id: this.channel.client.user.id,
				session_id: this.sessionId,
				token: this.token,
			}
		}));

		return true;
	}

	public disconnect(): void {
		if (!this.isConnected) {

		}
	}
}