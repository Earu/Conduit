import { ConduitProps } from '../interfaces/conduitProps';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Guild, Collection, GuildMember, PermissionResolvable, VoiceRegion } from 'discord.js';
import { BotInput } from './botInput';
import { Select } from './select';

export class DashboardGuilds extends React.Component<ConduitProps, {}> {
    private selectedGuild: Guild;

    constructor(props: any) {
        super(props);

        this.selectedGuild = null;
        this.props.client
            .on('ready', this.onReady.bind(this))
            .on('guildCreate', this.onGuildCreate.bind(this))
            .on('guildDelete', this.onGuildDelete.bind(this));
    }

    private onReady(): void {
        this.props.client.fetchVoiceRegions().then(regions => {
            let opts: Array<JSX.Element> = regions.map((region: VoiceRegion) => <option key={region.id} value={region.id}>{region.name}</option>);
            ReactDOM.render(opts, document.getElementById('guild-region'));
            this.updateGuildInfo();
        });

        let guilds: Array<Guild> = [];
        if (this.props.client.shard) {
            this.props.client.shard.broadcastEval('this.guilds')
                .then((res: any) => {
                    for (let i = 0; i < res.length; i++) {
                        let gs: Collection<string, Guild> = res[i] as Collection<string, Guild>;
                        guilds = guilds.concat(gs.map((g: Guild) => g));
                    }
                    this.props.logger.success('Fetched all guilds');
                    this.selectedGuild = guilds[0];
                    this.updateGuildInfo();
                    let opts: Array<JSX.Element> = guilds.map((g: Guild) => <option key={g.id} value={g.id}>{g.name} [{g.id}]</option>);
                    ReactDOM.render(opts, document.getElementById('guilds'));
                })
                .catch((err: Error) => this.props.logger.error(err.message));
        } else {
            guilds = this.props.client.guilds.map((g: Guild) => g);
            this.props.logger.success('Fetched all guilds');
            this.selectedGuild = guilds[0];
            this.updateGuildInfo();
            let opts: Array<JSX.Element> = guilds.map((g: Guild) => <option key={g.id} value={g.id}>{g.name} [{g.id}]</option>);
            ReactDOM.render(opts, document.getElementById('guilds'));
        }
    }

    private onGuildCreate(guild: Guild): void {
        let guilds: HTMLDataListElement = document.getElementById('guilds') as HTMLDataListElement;
        let opt: HTMLOptionElement = document.createElement('option');
        opt.value = guild.id;
        opt.text = guild.name;
        guilds.appendChild(opt);
    }

    private onGuildDelete(guild: Guild): void {
        let guilds: HTMLDataListElement = document.getElementById('guilds') as HTMLDataListElement;
        let node: Node = null;
        for (let child of guilds.childNodes) {
            let opt: HTMLOptionElement = child as HTMLOptionElement;
            if (opt.value === guild.id) {
                node = opt;
                break;
            }
        }

        if (node) {
            guilds.removeChild(node);
        }
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

    private updateGuildInfo(): void {
        if (!this.selectedGuild) return;

        let guildImg: HTMLImageElement = document.getElementById('guild-avatar') as HTMLImageElement;
        let guildName: HTMLInputElement = document.getElementById('guild-name') as HTMLInputElement;
        let guildRegion: HTMLSelectElement = document.getElementById('guild-region') as HTMLSelectElement;

        guildName.value = this.selectedGuild.name;
        guildRegion.value = this.selectedGuild.region;
        if (this.selectedGuild.iconURL) {
            guildImg.src = this.selectedGuild.iconURL;
        } else {
            guildImg.alt = this.selectedGuild.name[0];
        }
    }

    private onGuildSelected(): void {
        let guildSelect: HTMLInputElement = document.getElementById('guild-select') as HTMLInputElement;
        this.props.loader.load(this.tryFindGuild(guildSelect.value))
            .then((guild: Guild) => {
                this.props.logger.success(`Selected guild [ ${guild.name} | ${guild.id} ]`);
                this.selectedGuild = guild;
                this.updateGuildInfo();
            });
    }

    private hasPermissions(... perms: Array<PermissionResolvable>): boolean {
        if (this.selectedGuild) {
            let botMember: GuildMember = this.selectedGuild.member(this.props.client.user);
            for (let perm of perms) {
                if (!botMember.hasPermission(perm)) {
                    this.props.logger.error(`You do not have the '${perm}' permission for the guild [ ${this.selectedGuild.name} | ${this.selectedGuild.id} ]`);
                    return false;
                }
            }

            return true;
        }

        this.props.logger.error(`Cannot check permissions for a nonexistent guild`);
        return false;
    }

    private onGuildNameChange(): void {
        let guildName: HTMLInputElement = document.getElementById('guild-name') as HTMLInputElement;
        if (guildName.value) {
            if (this.hasPermissions('MANAGE_GUILD')) {
                this.props.loader.load(this.selectedGuild.setName(guildName.value))
                    .then((g: Guild) => this.props.logger.success(`Changed selected guild's name to ${g.name}`))
                    .catch(_ => guildName.style.border = '2px solid red');
            } else {
                guildName.style.border = '2px solid red';
            }
        }
    }

    private onGuildRegionChange(): void {
        let guildRegion: HTMLSelectElement = document.getElementById('guild-region') as HTMLSelectElement;
        if (guildRegion.value && this.hasPermissions('MANAGE_GUILD')) {
            this.props.loader.load(this.selectedGuild.setRegion(guildRegion.value))
                .then((g: Guild) => this.props.logger.success(`Changed selected guild's region to ${g.region}`));
        }
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
                        <BotInput id='guild-name' onValidated={this.onGuildNameChange.bind(this)} placeholder='guild name...' />
                        <Select id='guild-region' onSelected={this.onGuildRegionChange.bind(this)}>
                        </Select>
                    </div>
                </div>
            </div>
            awdawdawd
        </div>;
    }
}