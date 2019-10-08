import * as Discord from 'discord.js';

import { VoiceOpCodes } from "./voiceOpCodes";

export class VoiceConnection {
	private channel: Discord.VoiceChannel;
	private destroyed: boolean;

	private voiceWs: WebSocket;
	private wsEndpoint: string;
	private token: string;
	private sessionId: string;
	private heartBeatHandle: number;

	constructor (vc: Discord.VoiceChannel) {
		this.channel = vc;
		this.destroyed = false;

		this.voiceWs = null;
		this.wsEndpoint = '';
		this.token = '';
		this.sessionId = '';
		this.heartBeatHandle = -1;
	}

	public setEndpointAndToken(endpoint: string, token: string): void {
		this.wsEndpoint = endpoint;
		this.token = token;
	}

	public setSessionId(sessionId: string): void {
		this.sessionId = sessionId;
	}

	private canInitiate(): boolean {
		if (this.destroyed) return false;
		if (!this.token || !this.sessionId || !this.wsEndpoint) return false;

		return true;
	}

	public initiate(): void {
		if (!this.canInitiate()) return;

		this.voiceWs = new WebSocket(`ws://${this.wsEndpoint}?v=3&encoding=json`);
		this.voiceWs.onopen = this.onOpen.bind(this);
		this.voiceWs.onmessage = this.onMessage.bind(this);
		this.voiceWs.onclose = this.destroy.bind(this);
	}

	public destroy(): void {
		if (this.destroyed) return;

		if (this.heartBeatHandle != -1) {
			clearInterval(this.heartBeatHandle);
		}

		if (this.voiceWs && this.voiceWs.readyState != WebSocket.CLOSING
			&& this.voiceWs.readyState != WebSocket.CLOSED) {
			this.voiceWs.close();
		}

		this.destroyed = true;
	}

	private onOpen(): void {
		this.voiceWs.send(JSON.stringify({
			op: VoiceOpCodes.Identify,
			d: {
				server_id: this.channel.guild.id,
				user_id: this.channel.client.user.id,
				session_id: this.sessionId,
				token: this.token,
			}
		}));
	}

	private onMessage(e: MessageEvent): void {
		let data = JSON.parse(e.data);
		switch (data.op) {
			case VoiceOpCodes.Hello:
				let interval = data.d.heartbeat_interval;
				this.heartBeatHandle = setInterval(this.sendHeartBeat.bind(this), interval * 0.75);
				break;
			case VoiceOpCodes.Ready:
				data.d.port;
				data.d.ip;
				let rtc = new RTCPeerConnection({

				});
				break;
		}
	}

	private sendHeartBeat(): void {
		this.voiceWs.send(JSON.stringify({
			op: VoiceOpCodes.HeartBeat,
			d: Date.now(),
		}));
	}
}
