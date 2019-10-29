import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Discord from 'discord.js';

import { ConduitProps } from '../../../utils/conduitProps';
import { Input } from '../../controls/input';
import { Select } from '../../controls/select';
import { GuildAvatar } from '../../controls/avatar/guildAvatar';
import { ActionReporter } from '../../../utils/actionReporter';
import { DashboardPanel } from '../dashboardPanel';
import { SelectHelper } from '../../../utils/selectHelper';
import { DashboardEmojis } from './dashboardEmojis';
import { DashboardChannels } from './dashboardChannels';
import { DashboardRoles } from './dashboardRoles';
import { RestClient } from '../../../http/restClient';

export class DashboardGuilds extends React.Component<ConduitProps, {}> {
    private selectedGuild: Discord.Guild;
    private reporter: ActionReporter;
    private restClient: RestClient;

    constructor(props: any) {
        super(props);

        this.selectedGuild = null;
        this.reporter = new ActionReporter(this.props.client);
        this.restClient = new RestClient(this.props.client);
        this.props.client
            .on('ready', this.onReady.bind(this))
            .on('loggedIn', this.loadRegionSelect.bind(this))
            .on('guildCreate', this.onGuildCreate.bind(this))
            .on('guildCached', this.onGuildCached.bind(this))
            .on('guildDelete', this.onGuildDelete.bind(this))
            .on('guildUpdate', (_, g: Discord.Guild) => this.onGuildUpdate(g))
            .on('guildIntegrationsUpdate', this.onGuildUpdate.bind(this));
    }

    private loadRegionSelect(): void {
        this.props.loader.load(this.props.client.fetchVoiceRegions())
            .then((regions: Discord.Collection<string, Discord.VoiceRegion>) => {
                let opts: Array<JSX.Element> = regions.map((region: Discord.VoiceRegion) => <option key={region.id} value={region.id}>{region.name}</option>);
                ReactDOM.render(<Select id='guild-region'
                    defaultValue={this.selectedGuild ? this.selectedGuild.region : null}
                    onSelected={this.onGuildRegionChange.bind(this)}>
                    {opts}
                </Select>, document.getElementById('container-guild-region'));
                let select: HTMLElement = document.getElementById('parent-guild-region');
                select.style.marginBottom = '0px';
            });
    }

    private addGuildsToDatalist(guilds: Array<Discord.Guild>): void {
        let opts: Array<JSX.Element> = guilds.map((g: Discord.Guild) => <option key={g.id} value={g.id}>{g.name} [ {g.id} ]</option>);
        ReactDOM.render(opts, document.getElementById('guilds'));
    }

    private initialize(guilds: Array<Discord.Guild>): void {
        this.addGuildsToDatalist(guilds);
        this.props.logger.success('Cached all guilds');
        if (!this.selectedGuild) {
            this.selectedGuild = guilds[0];
            this.updateGuildInfo();
        }
    }

    private onReady(): void {
        let guilds: Array<Discord.Guild> = [];
        if (this.props.client.shard) {
            this.props.client.shard.broadcastEval('this.guilds')
                .then((res: any) => {
                    for (let i = 0; i < res.length; i++) {
                        let gs: Discord.Collection<string, Discord.Guild> = res[i] as Discord.Collection<string, Discord.Guild>;
                        guilds = guilds.concat(gs.map((g: Discord.Guild) => g));
                    }
                    this.initialize(guilds);
                })
                .catch((err: Error) => this.props.logger.error(err.message));
        } else {
            guilds = this.props.client.guilds.map((g: Discord.Guild) => g);
            this.initialize(guilds);
        }
    }

    private onGuildCreate(guild: Discord.Guild): void {
        let guilds: HTMLDataListElement = document.getElementById('guilds') as HTMLDataListElement;
        let opt: HTMLOptionElement = document.createElement('option');
        opt.value = guild.id;
        opt.text = `${guild.name} [ ${guild.id} ]`;
        guilds.appendChild(opt);
    }

    private onGuildCached(guildId: string, guildName: string): void {
        let guilds: HTMLDataListElement = document.getElementById('guilds') as HTMLDataListElement;
        let opt: HTMLOptionElement = document.createElement('option');
        opt.value = guildId;
        opt.text = `${guildName} [ ${guildId} ]`;
        guilds.appendChild(opt);
    }

    private onGuildDelete(guild: Discord.Guild): void {
        if (this.props.client.guilds.size < 2500) { // This operation is too laggy for over 2500 guilds bots
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

        if (this.selectedGuild && guild.id === this.selectedGuild.id) {
            this.selectedGuild = this.props.client.guilds.first();
            this.updateGuildInfo();
        }
    }

    private onGuildUpdate(guild: Discord.Guild): void {
        if (!this.selectedGuild) return;
        if (guild.id === this.selectedGuild.id) {
            this.selectedGuild = guild;
            this.updateGuildInfo(false);
        }
    }

    private async tryFindGuild(id: string): Promise<Discord.Guild> {
        //if (this.props.client.guilds.has(id)) {
        //    return this.props.client.guilds.get(id);
        //}

        let guild: Discord.Guild = await this.restClient.fetchGuild(id);
        if (guild) {
            this.props.client.guilds.set(guild.id, guild);
            return guild;
        }

        return null;
    }

    private updateGuildInfo(updateSubPanels: boolean = true): void {
        let guildAvatar: HTMLElement = document.getElementById('container-guild-avatar');
        let guildName: HTMLInputElement = document.getElementById('guild-name') as HTMLInputElement;
        let guildChannelContainer: HTMLElement = document.getElementById('container-guild-channel');
        let guildEmojisContainer: HTMLElement = document.getElementById('container-guild-emojis');
        let guildRolesContainer: HTMLElement = document.getElementById('container-guild-roles');
        if (!guildAvatar || !guildName || !guildChannelContainer || !guildEmojisContainer || !guildRolesContainer) return;

        if (!this.selectedGuild) {
            guildName.value = '';
            ReactDOM.render(<div />, guildAvatar);
            ReactDOM.render(<div />, guildChannelContainer);
            return;
        }

        guildName.value = this.selectedGuild.name;
        SelectHelper.trySetValue('guild-region', this.selectedGuild.region);

        ReactDOM.render(<GuildAvatar id='guild-avatar' reporter={this.reporter} guild={this.selectedGuild} client={this.props.client}
            logger={this.props.logger} loader={this.props.loader} />, guildAvatar);

        if (updateSubPanels) {
            ReactDOM.render(<DashboardChannels guild={this.selectedGuild} client={this.props.client} restClient={this.restClient}
                onLayoutInvalidated={this.updateGuildInfo.bind(this)} logger={this.props.logger} loader={this.props.loader} reporter={this.reporter} />, guildChannelContainer);

            ReactDOM.render(<DashboardEmojis guild={this.selectedGuild} client={this.props.client} restClient={this.restClient}
                onLayoutInvalidated={this.updateGuildInfo.bind(this)} logger={this.props.logger} loader={this.props.loader} reporter={this.reporter} />, guildEmojisContainer);

            ReactDOM.render(<DashboardRoles guild={this.selectedGuild} client={this.props.client} restClient={this.restClient}
                onLayoutInvalidated={this.updateGuildInfo.bind(this)} logger={this.props.logger} loader={this.props.loader} reporter={this.reporter} />, guildRolesContainer);
        }
    }

    private onGuildSelected(): void {
        let guildSelect: HTMLInputElement = document.getElementById('guild-select') as HTMLInputElement;
        this.props.loader.load(this.tryFindGuild(guildSelect.value))
            .then((guild: Discord.Guild) => {
                if (!guild || (guild && guild.deleted)) return;

                this.props.logger.success(`Selected guild [ ${guild.id} ]`);
                this.selectedGuild = guild;
                this.updateGuildInfo();
            });
    }

    private hasPermissions(...perms: Array<Discord.PermissionResolvable>): boolean {
        if (this.selectedGuild) {
            let botMember: Discord.GuildMember = this.selectedGuild.member(this.props.client.user);
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
        if (!this.selectedGuild) return;

        let guildName: HTMLInputElement = document.getElementById('guild-name') as HTMLInputElement;
        if (guildName.value && this.hasPermissions('MANAGE_GUILD')) {
            let oldName: string = this.selectedGuild.name;
            this.props.loader.load(this.selectedGuild.setName(guildName.value))
                .then((g: Discord.Guild) => {
                    this.props.logger.success(`Changed selected guild's name to ${g.name}`);
                    this.reporter.reportGuildAction(`Changed guild\'s name [ \`${oldName}\` -> \`${g.name}\` ]`, this.selectedGuild);
                })
                .catch(_ => guildName.value = this.selectedGuild.name);
        } else {
            guildName.value = this.selectedGuild.name;
        }
    }

    private onGuildRegionChange(): void {
        if (!this.selectedGuild) return;

        let guildRegion: HTMLSelectElement = document.getElementById('guild-region') as HTMLSelectElement;
        if (guildRegion.value && this.hasPermissions('MANAGE_GUILD')) {
            let oldRegion: string = this.selectedGuild.region;
            this.props.loader.load(this.selectedGuild.setRegion(guildRegion.value))
                .then((g: Discord.Guild) => {
                    this.props.logger.success(`Changed selected guild's region to ${g.region}`);
                    this.reporter.reportGuildAction(`Changed guild\'s voice region [ \`${oldRegion}\` -> \`${g.region}\` ]`, this.selectedGuild);
                })
                .catch(_ => guildRegion.value = this.selectedGuild.region);
        } else {
            guildRegion.value = this.selectedGuild.region;
        }
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
            <div style={{ padding: '10px', paddingBottom: '0' }}>
                <div className='row'>
                    <div className='col-md-12'>
                        <Input id='guild-select' onValidated={this.onGuildSelected.bind(this)} placeholder='guild name or id...' list='guilds' />
                        <datalist id='guilds' />
                        <hr style={{ marginBottom: '10px' }} />
                    </div>
                </div>
                <div className='row'>
                    <div className='col-md-2 guild-avatar'>
                        <div id='container-guild-avatar' />
                    </div>
                    <div className='col-md-4'>
                        <Input id='guild-name' onValidated={this.onGuildNameChange.bind(this)} placeholder='name...' />
                        <div id='container-guild-region' />
                    </div>
                    <div className='col-md-3'>
                        <button style={{ marginBottom: '5px' }} className='purple-btn small-btn'>Members</button>
                        <button className='purple-btn small-btn'>Bans</button>
                    </div>
                    <div className='col-md-3'>
                        <button className='red-btn small-btn' onClick={this.onLeaveGuild.bind(this)} style={{ marginBottom: '5px' }}>
                            Leave
                </button>
                        <button className='red-btn small-btn' onClick={this.onDeleteGuild.bind(this)}>
                            Delete
                </button>
                    </div>
                </div>
            </div>
            <DashboardPanel title='CHANNELS' foldable={true} style={{ marginTop: '10px' }}>
                <div id='container-guild-channel' />
            </DashboardPanel>
            <DashboardPanel title='EMOJIS' foldable={true} style={{ marginTop: '0px' }}>
                <div id='container-guild-emojis' />
            </DashboardPanel>
            <DashboardPanel title='ROLES' foldable={true} style={{ marginTop: '0px' }}>
                <div id='container-guild-roles' />
            </DashboardPanel>
        </div>;
    }
}