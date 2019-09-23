import { ConduitProps } from '../../../utils/conduitProps';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Guild, Collection, GuildMember, PermissionResolvable, VoiceRegion, GuildChannel, CategoryChannel, TextChannel, VoiceChannel } from 'discord.js';
import { Input } from '../../controls/input';
import { Select } from '../../controls/select';
import { GuildAvatar } from '../../controls/avatar/guildAvatar';
import { DashboardTextChannel } from './dashboardTextChannel';
import { ActionReporter } from '../../../utils/actionReporter';

export class DashboardGuilds extends React.Component<ConduitProps, {}> {
    private selectedGuild: Guild;
    private reporter: ActionReporter;

    constructor(props: any) {
        super(props);

        this.selectedGuild = null;
        this.reporter = new ActionReporter();
        this.props.client
            .on('ready', this.onReady.bind(this))
            .on('guildCreate', this.onGuildCreate.bind(this))
            .on('guildDelete', this.onGuildDelete.bind(this));
    }

    private loadRegionSelect(): void {
        this.props.loader.load(this.props.client.fetchVoiceRegions())
            .then((regions: Collection<string, VoiceRegion>) => {
                let opts: Array<JSX.Element> = regions.map((region: VoiceRegion) => <option key={region.id} value={region.id}>{region.name}</option>);
                ReactDOM.render(<Select id='guild-region'
                    defaultValue={this.selectedGuild.region}
                    onSelected={this.onGuildRegionChange.bind(this)}>
                    {opts}
                </Select>, document.getElementById('container-guild-region'));
                let select: HTMLElement = document.getElementById('parent-guild-region');
                select.style.marginBottom = '0px';
                this.updateGuildInfo();
            });
    }

    private loadChannelSelect(): void {
        let opts: Array<JSX.Element> = this.selectedGuild.channels.map((c: GuildChannel) => <option key={c.id} value={c.id}>{c.name} [ {c.type} ]</option>);
        ReactDOM.render(<Select id='guild-channel'
            defaultValue={this.selectedGuild.channels.first().id}
            onSelected={this.loadChannel.bind(this)}>
            {opts}
        </Select>, document.getElementById('container-guild-channel'));
    }

    private addGuildsToDatalist(guilds: Array<Guild>): void {
        let opts: Array<JSX.Element> = guilds.map((g: Guild) => <option key={g.id} value={g.id}>{g.name} [{g.id}]</option>);
        ReactDOM.render(opts, document.getElementById('guilds'));
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
                    this.selectedGuild = guilds[0];
                    this.updateGuildInfo();
                    this.addGuildsToDatalist(guilds);
                    this.loadRegionSelect();
                })
                .catch((err: Error) => this.props.logger.error(err.message));
        } else {
            guilds = this.props.client.guilds.map((g: Guild) => g);
            this.props.logger.success('Fetched all guilds');
            this.selectedGuild = guilds[0];
            this.updateGuildInfo();
            this.addGuildsToDatalist(guilds);
            this.loadRegionSelect();
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

        let guildAvatar: HTMLElement = document.getElementById('container-guild-avatar');
        let guildName: HTMLInputElement = document.getElementById('guild-name') as HTMLInputElement;
        let parentGuildRegion: HTMLDivElement = document.getElementById('parent-guild-region') as HTMLDivElement;

        guildName.value = this.selectedGuild.name;

        if (parentGuildRegion) {
            let guildRegion: HTMLSelectElement = parentGuildRegion.getElementsByTagName('select')[0];
            let selected: HTMLDivElement = parentGuildRegion.getElementsByClassName('select-selected')[0] as HTMLDivElement;
            guildRegion.value = this.selectedGuild.region;
            selected.textContent = guildRegion.options[guildRegion.selectedIndex].text;
        }

        ReactDOM.render(<GuildAvatar id='guild-avatar' reporter={this.reporter} guild={this.selectedGuild}
            client={this.props.client} logger={this.props.logger} loader={this.props.loader} />, guildAvatar);
        this.loadChannelSelect();
        this.loadChannel(this.selectedGuild.channels.first().id); // refresh the channel panel
    }

    private onGuildSelected(): void {
        let guildSelect: HTMLInputElement = document.getElementById('guild-select') as HTMLInputElement;
        this.props.loader.load(this.tryFindGuild(guildSelect.value))
            .then((guild: Guild) => {
                if (!guild) return;
                this.props.logger.success(`Selected guild [ ${guild.id} ]`);
                this.selectedGuild = guild;
                this.updateGuildInfo();
            });
    }

    private hasPermissions(...perms: Array<PermissionResolvable>): boolean {
        if (this.selectedGuild) {
            let botMember: GuildMember = this.selectedGuild.member(this.props.client.user);
            for (let perm of perms) {
                if (!botMember.hasPermission(perm)) {
                    this.props.logger.error(`You do not have the '${perm}' permission for the selected guild`);
                    return false;
                }
            }

            return true;
        }

        this.props.logger.error('Cannot check permissions for a nonexistent guild');
        return false;
    }

    private onGuildNameChange(): void {
        let guildName: HTMLInputElement = document.getElementById('guild-name') as HTMLInputElement;
        if (guildName.value) {
            if (this.hasPermissions('MANAGE_GUILD')) {
                let oldName: string = this.selectedGuild.name;
                this.props.loader.load(this.selectedGuild.setName(guildName.value))
                    .then((g: Guild) => {
                        this.props.logger.success(`Changed selected guild's name to ${g.name}`);
                        this.reporter.reportGuildAction(`Changed guild\'s name [ \'${oldName}\' -> \'${g.name}\' ]`, this.selectedGuild);
                    })
                    .catch(_ => guildName.style.border = '2px solid red');
            } else {
                guildName.style.border = '2px solid red';
            }
        }
    }

    private onGuildRegionChange(): void {
        let guildRegion: HTMLSelectElement = document.getElementById('guild-region') as HTMLSelectElement;
        if (guildRegion.value && this.hasPermissions('MANAGE_GUILD')) {
            let oldRegion: string = this.selectedGuild.region;
            this.props.loader.load(this.selectedGuild.setRegion(guildRegion.value))
                .then((g: Guild) => {
                    this.props.logger.success(`Changed selected guild's region to ${g.region}`);
                    this.reporter.reportGuildAction(`Changed guild\'s voice region [ \'${oldRegion}\' -> \'${g.region}\' ]`, this.selectedGuild);
                });
        }
    }

    private loadChannel(chanId: string): void {
        let chan: GuildChannel = this.selectedGuild.channels.find((c: GuildChannel) => c.id === chanId);
        if (!chan) return;

        let jsx: JSX.Element = <div>UNKNOWN</div>
        switch (chan.type) {
            case 'category':
                let catChan: CategoryChannel = chan as CategoryChannel;
                break;
            case 'text':
                let txtChan: TextChannel = chan as TextChannel;
                jsx = <DashboardTextChannel reporter={this.reporter} channel={txtChan} client={this.props.client} logger={this.props.logger} loader={this.props.loader} />
                break;
            case 'voice':
                let voiceChan: VoiceChannel = chan as VoiceChannel;
                break;
            default:
                // general channel stuff here cannot test
                break;
        }

        ReactDOM.render(jsx, document.getElementById('channel'));
    }

    private onLeaveGuild(): void {
        if (!this.selectedGuild) return;

        this.props.loader.load(this.selectedGuild.leave())
            .then(_ => {
                this.props.logger.success('Left selected guild');
                this.selectedGuild = this.props.client.guilds.first();
                this.updateGuildInfo();
            });
    }

    private onDeleteGuild(): void {
        if (!this.selectedGuild) return;

        this.props.loader.load(this.selectedGuild.delete())
            .then(_ => {
                this.reporter.reportGuildAction('Deleted guild', this.selectedGuild);
                this.props.logger.success('Deleted selected guild');
                this.selectedGuild = this.props.client.guilds.first();
                this.updateGuildInfo();
            });
    }

    render(): JSX.Element {
        return <div>
            <div style={{ padding: '10px' }}>
                <div className='row'>
                    <div className='col-md-12'>
                        <Input id='guild-select' onValidated={this.onGuildSelected.bind(this)} placeholder='guild name or id...' list='guilds' />
                        <datalist id='guilds' />
                        <hr style={{ borderTop: '1px solid gray', marginTop: '5px', marginBottom: '5px' }} />
                    </div>
                </div>
                <div className='row'>
                    <div className='col-md-2 guild-avatar'>
                        <div id='container-guild-avatar' />
                    </div>
                    <div className='col-md-4'>
                        <Input id='guild-name' onValidated={this.onGuildNameChange.bind(this)} placeholder='guild name...' />
                        <div id='container-guild-region' />
                    </div>
                    <div className='col-md-3'>
                        <button style={{ height: '68px', width: '100%' }} className='purple-btn'>Guild Permissions</button>
                    </div>
                    <div className='col-md-3'>
                        <button className='red-btn' onClick={this.onLeaveGuild.bind(this)} style={{ width: '100%', padding: '0', height: '32px', marginBottom: '5px' }}>
                            Leave Guild
                        </button>
                        <button className='red-btn' onClick={this.onDeleteGuild.bind(this)} style={{ width: '100%', padding: '0', height: '32px' }}>
                            Delete Guild
                        </button>
                    </div>
                </div>
                <div className='row'>
                    <div className='col-md-12'>
                        <hr style={{ borderTop: '1px solid gray', marginTop: '5px', marginBottom: '5px' }} />
                        <div id='container-guild-channel' />
                    </div>
                </div>
            </div>
            <div id='channel' style={{ padding: '5px' }} />
        </div>;
    }
}