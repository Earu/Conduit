import { ConduitProps } from '../interfaces/conduitProps';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Guild, Collection } from 'discord.js';
import { BotInput } from './botInput';

export class DashboardGuilds extends React.Component<ConduitProps, {}> {
    constructor(props: any) {
        super(props);

        this.props.client.on('ready', this.onReady.bind(this));
    }

    private onReady(): void {
        let guilds: Array<Guild> = [];
        if (this.props.client.shard) {
            this.props.client.shard.broadcastEval('this.guilds')
                .then((res: any) => {
                    for (let i = 0; i < res.length; i++) {
                        let gs: Collection<string, Guild> = res[i] as Collection<string, Guild>;
                        guilds = guilds.concat(gs.map((g: Guild) => g));
                    }
                    this.props.logger.success('Fetched all guilds');
                })
                .catch((err: Error) => this.props.logger.error(err.message));
        } else {
            guilds = this.props.client.guilds.map((g: Guild) => g);
            this.props.logger.success('Fetched all guilds');
        }

        let opts: Array<JSX.Element> = guilds.map((g: Guild) => <option key={g.id} value={g.id}>{g.name} [{g.id}]</option>);
        ReactDOM.render(opts, document.getElementById('guilds'));
    }

    private async tryFindGuild(id: string): Promise<Guild> {
        if (!id) return null;

        if (this.props.client.shard) {
            let res: any = await this.props.client.shard.broadcastEval('this.guilds');
            for (let i = 0; i < res.length; i++) {
                let gs: Collection<string, Guild> = res[i] as Collection<string, Guild>;
                return gs.find((_: Guild, guildId: string) => guildId === id);
            }
        } else {
            return this.props.client.guilds.find((_: Guild, guildId: string) => guildId == id);
        }

        return null;
    }

    private onGuildSelected(): void {
        let input: HTMLInputElement = document.getElementById('guild-select') as HTMLInputElement;
        this.props.loader.load(this.tryFindGuild(input.value))
            .then((guild: Guild) => {
                this.props.logger.success(`Selected guild [ ${guild.name} | ${guild.id} ]`)
                let guildImg: HTMLImageElement = document.getElementById('guild-avatar') as HTMLImageElement;
                let guildName: HTMLInputElement = document.getElementById('guild-name') as HTMLInputElement;

                guildName.value = guild.name;
                if (guild.iconURL) {
                    guildImg.src = guild.iconURL;
                } else {
                    guildImg.alt = guild.name[0];
                }
            });
    }

    render(): JSX.Element {
        return <div>
            <div style={{ padding: '5px', backgroundColor: '#2c2f34' }}>
                <div className='row'>
                    <div className='col-md-12'>
                        <BotInput id='guild-select' onValidated={this.onGuildSelected.bind(this)} placeholder='guild name or id...' list='guilds' />
                        <datalist id='guilds' />
                        <hr style={{ borderTop: '1px solid gray', marginTop: '5px', marginBottom: '5px' }} />
                    </div>
                </div>
                <div className='row'>
                    <div className='col-md-1' style={{ textAlign: 'center' }}>
                        <img alt='g' id='guild-avatar' style={{ width: '64px', borderRadius: '9999px', textAlign: 'center' }} />
                    </div>
                    <div className='col-md-2'>
                        <BotInput id='guild-name' onValidated={() => { }} placeholder='guild name...' />
                    </div>
                </div>
            </div>
            awdawdawd
        </div>;
    }
}