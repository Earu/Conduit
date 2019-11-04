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

    public async getGatewayWS(): Promise<Array<WebSocket>> {
        let shard: Discord.ShardClientUtil = null;//Discord.ShardClientUtil.singleton(this.client);
        if (!shard || (shard && shard.count === 1)) {
            let obj: any = this.client as any;
            let ws: WebSocket = await this.waitGatewayWS(obj.ws);
            return ws ? [ ws ] : [];
        }

        let objs: Array<any> = await shard.broadcastEval('this.ws');
        let wss: Array<WebSocket> = [];
        for(let obj of objs) {
            let ws: WebSocket = await this.waitGatewayWS(obj.ws);
            if (ws) {
                wss.push(ws);
            }
        }

        return wss;
    }
}