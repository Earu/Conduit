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

	constructor(vc: Discord.VoiceChannel) {
		this.channel = vc;

		let obj = this.channel.client as any;
		this.gatewayWs = obj.ws.connection.ws;

		this.isConnected = false;
	}

	public isConnected: boolean;
	public channel: Discord.VoiceChannel;

	public initializeConnection(): Promise<boolean> {
		return new Promise<boolean>((resolve, _) => {
			if (this.isConnected) {
				resolve(false);
				return;
			}

			let payload: string = JSON.stringify({
				op: OpCode.VoiceStateUpdate,
				d: {
					guild_id: this.channel.guild.id,
					channel_id: this.channel.id,
					self_mute: false,
					self_deaf: false,
				}
			});

			let listener = (e: MessageEvent) => {
				let data = JSON.parse(e.data);
				if (data.t === 'VOICE_SERVER_UPDATE') {
					if (data.d.guild_id === this.channel.guild.id) {
						this.isConnected = true;
						this.token = data.d.token;
						this.endpoint = data.d.endpoint;

						this.gatewayWs.removeEventListener('message', listener);
						resolve(true);
					}
				}
			};

			this.gatewayWs.send(payload);
			setTimeout(() => resolve(false), 5000);
			this.gatewayWs.addEventListener('message', listener);
		});
	}

	public async connect(): Promise<boolean> {
		let success: boolean = await this.initializeConnection();
		if (!success) {
			return false;
		}

		this.voiceWs = new WebSocket(`wss://${this.endpoint}?v=3`);

		this.voiceWs.addEventListener('message', console.debug);
		this.voiceWs.addEventListener('open', console.debug);
		this.voiceWs.addEventListener('close', console.debug);
		console.debug(this.voiceWs);
	}

	public disconnect(): void {
		if (!this.isConnected) {

		}
	}
}