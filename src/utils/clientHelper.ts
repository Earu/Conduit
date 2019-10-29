import * as Discord from 'discord.js';

export class ClientHelper {
	private readonly timeout: number = 10000;

	private client: Discord.Client;

	constructor (client: Discord.Client) {
		this.client = client;
	}

    private waitGatewayWS(wsObject: any): Promise<WebSocket> {
        return new Promise<WebSocket>((resolve, _) => {
            let wsHandle: number = null;
            let checkWs = () => {
                if (wsObject.connection && wsObject.connection.ws) {
                    if (wsHandle) {
                        clearInterval(wsHandle);
                    }

                    resolve(wsObject.connection.ws);
                }
            };

            wsHandle = setInterval(checkWs, 250);
            setTimeout(() => {
                clearInterval(wsHandle);
                resolve(null);
            }, this.timeout)
        });
    }

    public async getGatewayWS(): Promise<WebSocket> {
        let obj: any = this.client as any;
        return await this.waitGatewayWS(obj.ws);
    }
}