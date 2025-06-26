// Types for MikroTik AAA functionality
export interface MikroTikCredentials {
    host: string;
    user: string;
    password: string;
    port?: number;
}

export interface PPPoEUser {
    name: string;
    password: string;
    profile: string;
    service: string;
    disabled?: boolean;
    comment?: string;
}

export interface HotspotUser {
    name: string;
    password: string;
    profile: string;
    disabled?: boolean;
    comment?: string;
    'mac-address'?: string;
    'ip-address'?: string;
}

export interface UserProfile {
    name: string;
    'rate-limit'?: string;
    'session-timeout'?: string;
    'idle-timeout'?: string;
    'keepalive-timeout'?: string;
    'status-autorefresh'?: string;
    'shared-users'?: number;
    'mac-cookie-timeout'?: string;
    'address-pool'?: string;
    'transparent-proxy'?: boolean;
    comment?: string;
}

export interface MikroTikResponse {
    success: boolean;
    message: string;
    data?: any;
    error?: string;
}

function getMikrotikCredentials(): MikroTikCredentials | { error: string } {
    const host = process.env.MIKROTIK_HOST;
    const user = process.env.MIKROTIK_USER;
    const password = process.env.MIKROTIK_PASSWORD;
    const port = process.env.MIKROTIK_PORT ? parseInt(process.env.MIKROTIK_PORT) : 8728;

    if (!host || !user) {
        return { error: 'Mikrotik host and user must be configured in your .env file or NAS devices.' };
    }

    return { host, user, password: password || '', port };
}

// Get MikroTik credentials from NAS device configuration
async function getMikrotikCredentialsFromNAS(deviceId?: string): Promise<MikroTikCredentials | { error: string }> {
    try {
        // Import NAS device model
        const NasDevice = require('./models/NasDevice').default;

        let query: any = {
            nasType: 'MikroTik RouterOS',
            isActive: true
        };

        if (deviceId) {
            query._id = deviceId;
        }

        const device = await NasDevice.findOne(query);

        if (!device) {
            return { error: 'No active MikroTik RouterOS device found in NAS configuration.' };
        }

        if (!device.mikrotikConfig) {
            return { error: 'MikroTik configuration is missing for the selected device.' };
        }

        const config = device.mikrotikConfig;

        if (!config.username || !config.password) {
            return { error: 'MikroTik username and password must be configured.' };
        }

        return {
            host: device.nasIpAddress,
            user: config.username,
            password: config.password,
            port: config.apiPort || 8728
        };
    } catch (error) {
        console.error('Error getting MikroTik credentials from NAS:', error);
        return { error: 'Failed to retrieve MikroTik configuration from database.' };
    }
}

// MikroTik API Client Class
class MikroTikClient {
    private credentials: MikroTikCredentials;
    private RouterOS: any;

    constructor(credentials: MikroTikCredentials) {
        this.credentials = credentials;
        this.RouterOS = require('node-routeros');
    }

    private async createConnection() {
        const conn = new this.RouterOS({
            host: this.credentials.host,
            user: this.credentials.user,
            password: this.credentials.password,
            port: this.credentials.port || 8728,
            timeout: 10000
        });
        await conn.connect();
        return conn;
    }

    private async executeCommand(command: string, params: any = {}): Promise<any> {
        let conn;
        try {
            conn = await this.createConnection();
            const result = await conn.write(command, params);
            return result;
        } finally {
            if (conn) {
                conn.close();
            }
        }
    }

    // Test connection
    async testConnection(): Promise<MikroTikResponse> {
        try {
            await this.executeCommand('/system/resource/print');
            return { success: true, message: 'Connection to MikroTik router successful!' };
        } catch (error: any) {
            return {
                success: false,
                message: `Connection failed: ${error.message || 'Unknown error'}`,
                error: error.message
            };
        }
    }

    // PPPoE User Management
    async createPPPoEUser(user: PPPoEUser): Promise<MikroTikResponse> {
        try {
            const params = {
                name: user.name,
                password: user.password,
                profile: user.profile,
                service: user.service || 'ppp',
                disabled: user.disabled ? 'yes' : 'no',
                ...(user.comment && { comment: user.comment })
            };

            await this.executeCommand('/ppp/secret/add', params);
            return {
                success: true,
                message: `PPPoE user ${user.name} created successfully`,
                data: params
            };
        } catch (error: any) {
            return {
                success: false,
                message: `Failed to create PPPoE user: ${error.message}`,
                error: error.message
            };
        }
    }

    async updatePPPoEUser(username: string, updates: Partial<PPPoEUser>): Promise<MikroTikResponse> {
        try {
            // First find the user
            const users = await this.executeCommand('/ppp/secret/print', { '?name': username });
            if (!users || users.length === 0) {
                return { success: false, message: `PPPoE user ${username} not found` };
            }

            const userId = users[0]['.id'];
            const params: any = {};

            if (updates.password) params.password = updates.password;
            if (updates.profile) params.profile = updates.profile;
            if (updates.service) params.service = updates.service;
            if (updates.disabled !== undefined) params.disabled = updates.disabled ? 'yes' : 'no';
            if (updates.comment) params.comment = updates.comment;

            await this.executeCommand('/ppp/secret/set', { '.id': userId, ...params });
            return {
                success: true,
                message: `PPPoE user ${username} updated successfully`,
                data: params
            };
        } catch (error: any) {
            return {
                success: false,
                message: `Failed to update PPPoE user: ${error.message}`,
                error: error.message
            };
        }
    }

    async deletePPPoEUser(username: string): Promise<MikroTikResponse> {
        try {
            const users = await this.executeCommand('/ppp/secret/print', { '?name': username });
            if (!users || users.length === 0) {
                return { success: false, message: `PPPoE user ${username} not found` };
            }

            const userId = users[0]['.id'];
            await this.executeCommand('/ppp/secret/remove', { '.id': userId });
            return {
                success: true,
                message: `PPPoE user ${username} deleted successfully`
            };
        } catch (error: any) {
            return {
                success: false,
                message: `Failed to delete PPPoE user: ${error.message}`,
                error: error.message
            };
        }
    }

    async getPPPoEUsers(): Promise<MikroTikResponse> {
        try {
            const users = await this.executeCommand('/ppp/secret/print');
            return {
                success: true,
                message: 'PPPoE users retrieved successfully',
                data: users
            };
        } catch (error: any) {
            return {
                success: false,
                message: `Failed to get PPPoE users: ${error.message}`,
                error: error.message
            };
        }
    }

    // Hotspot User Management
    async createHotspotUser(user: HotspotUser): Promise<MikroTikResponse> {
        try {
            const params: any = {
                name: user.name,
                password: user.password,
                profile: user.profile,
                disabled: user.disabled ? 'yes' : 'no'
            };

            if (user.comment) params.comment = user.comment;
            if (user['mac-address']) params['mac-address'] = user['mac-address'];
            if (user['ip-address']) params['ip-address'] = user['ip-address'];

            await this.executeCommand('/ip/hotspot/user/add', params);
            return {
                success: true,
                message: `Hotspot user ${user.name} created successfully`,
                data: params
            };
        } catch (error: any) {
            return {
                success: false,
                message: `Failed to create Hotspot user: ${error.message}`,
                error: error.message
            };
        }
    }

    async updateHotspotUser(username: string, updates: Partial<HotspotUser>): Promise<MikroTikResponse> {
        try {
            const users = await this.executeCommand('/ip/hotspot/user/print', { '?name': username });
            if (!users || users.length === 0) {
                return { success: false, message: `Hotspot user ${username} not found` };
            }

            const userId = users[0]['.id'];
            const params: any = {};

            if (updates.password) params.password = updates.password;
            if (updates.profile) params.profile = updates.profile;
            if (updates.disabled !== undefined) params.disabled = updates.disabled ? 'yes' : 'no';
            if (updates.comment) params.comment = updates.comment;
            if (updates['mac-address']) params['mac-address'] = updates['mac-address'];
            if (updates['ip-address']) params['ip-address'] = updates['ip-address'];

            await this.executeCommand('/ip/hotspot/user/set', { '.id': userId, ...params });
            return {
                success: true,
                message: `Hotspot user ${username} updated successfully`,
                data: params
            };
        } catch (error: any) {
            return {
                success: false,
                message: `Failed to update Hotspot user: ${error.message}`,
                error: error.message
            };
        }
    }

    async deleteHotspotUser(username: string): Promise<MikroTikResponse> {
        try {
            const users = await this.executeCommand('/ip/hotspot/user/print', { '?name': username });
            if (!users || users.length === 0) {
                return { success: false, message: `Hotspot user ${username} not found` };
            }

            const userId = users[0]['.id'];
            await this.executeCommand('/ip/hotspot/user/remove', { '.id': userId });
            return {
                success: true,
                message: `Hotspot user ${username} deleted successfully`
            };
        } catch (error: any) {
            return {
                success: false,
                message: `Failed to delete Hotspot user: ${error.message}`,
                error: error.message
            };
        }
    }

    async getHotspotUsers(): Promise<MikroTikResponse> {
        try {
            const users = await this.executeCommand('/ip/hotspot/user/print');
            return {
                success: true,
                message: 'Hotspot users retrieved successfully',
                data: users
            };
        } catch (error: any) {
            return {
                success: false,
                message: `Failed to get Hotspot users: ${error.message}`,
                error: error.message
            };
        }
    }

    // Profile Management
    async createPPPoEProfile(profile: UserProfile): Promise<MikroTikResponse> {
        try {
            const params: any = { name: profile.name };

            if (profile['rate-limit']) params['rate-limit'] = profile['rate-limit'];
            if (profile['session-timeout']) params['session-timeout'] = profile['session-timeout'];
            if (profile['idle-timeout']) params['idle-timeout'] = profile['idle-timeout'];
            if (profile['keepalive-timeout']) params['keepalive-timeout'] = profile['keepalive-timeout'];
            if (profile['shared-users']) params['shared-users'] = profile['shared-users'];
            if (profile['address-pool']) params['address-pool'] = profile['address-pool'];
            if (profile.comment) params.comment = profile.comment;

            await this.executeCommand('/ppp/profile/add', params);
            return {
                success: true,
                message: `PPPoE profile ${profile.name} created successfully`,
                data: params
            };
        } catch (error: any) {
            return {
                success: false,
                message: `Failed to create PPPoE profile: ${error.message}`,
                error: error.message
            };
        }
    }

    async createHotspotProfile(profile: UserProfile): Promise<MikroTikResponse> {
        try {
            const params: any = { name: profile.name };

            if (profile['rate-limit']) params['rate-limit'] = profile['rate-limit'];
            if (profile['session-timeout']) params['session-timeout'] = profile['session-timeout'];
            if (profile['idle-timeout']) params['idle-timeout'] = profile['idle-timeout'];
            if (profile['keepalive-timeout']) params['keepalive-timeout'] = profile['keepalive-timeout'];
            if (profile['shared-users']) params['shared-users'] = profile['shared-users'];
            if (profile['address-pool']) params['address-pool'] = profile['address-pool'];
            if (profile['transparent-proxy'] !== undefined) params['transparent-proxy'] = profile['transparent-proxy'] ? 'yes' : 'no';
            if (profile.comment) params.comment = profile.comment;

            await this.executeCommand('/ip/hotspot/user/profile/add', params);
            return {
                success: true,
                message: `Hotspot profile ${profile.name} created successfully`,
                data: params
            };
        } catch (error: any) {
            return {
                success: false,
                message: `Failed to create Hotspot profile: ${error.message}`,
                error: error.message
            };
        }
    }

    async getPPPoEProfiles(): Promise<MikroTikResponse> {
        try {
            const profiles = await this.executeCommand('/ppp/profile/print');
            return {
                success: true,
                message: 'PPPoE profiles retrieved successfully',
                data: profiles
            };
        } catch (error: any) {
            return {
                success: false,
                message: `Failed to get PPPoE profiles: ${error.message}`,
                error: error.message
            };
        }
    }

    async getHotspotProfiles(): Promise<MikroTikResponse> {
        try {
            const profiles = await this.executeCommand('/ip/hotspot/user/profile/print');
            return {
                success: true,
                message: 'Hotspot profiles retrieved successfully',
                data: profiles
            };
        } catch (error: any) {
            return {
                success: false,
                message: `Failed to get Hotspot profiles: ${error.message}`,
                error: error.message
            };
        }
    }

    // Session Management
    async getActivePPPoESessions(): Promise<MikroTikResponse> {
        try {
            const sessions = await this.executeCommand('/ppp/active/print');
            return {
                success: true,
                message: 'Active PPPoE sessions retrieved successfully',
                data: sessions
            };
        } catch (error: any) {
            return {
                success: false,
                message: `Failed to get active PPPoE sessions: ${error.message}`,
                error: error.message
            };
        }
    }

    async getActiveHotspotSessions(): Promise<MikroTikResponse> {
        try {
            const sessions = await this.executeCommand('/ip/hotspot/active/print');
            return {
                success: true,
                message: 'Active Hotspot sessions retrieved successfully',
                data: sessions
            };
        } catch (error: any) {
            return {
                success: false,
                message: `Failed to get active Hotspot sessions: ${error.message}`,
                error: error.message
            };
        }
    }

    async disconnectPPPoESession(sessionId: string): Promise<MikroTikResponse> {
        try {
            await this.executeCommand('/ppp/active/remove', { '.id': sessionId });
            return {
                success: true,
                message: 'PPPoE session disconnected successfully'
            };
        } catch (error: any) {
            return {
                success: false,
                message: `Failed to disconnect PPPoE session: ${error.message}`,
                error: error.message
            };
        }
    }

    async disconnectHotspotSession(sessionId: string): Promise<MikroTikResponse> {
        try {
            await this.executeCommand('/ip/hotspot/active/remove', { '.id': sessionId });
            return {
                success: true,
                message: 'Hotspot session disconnected successfully'
            };
        } catch (error: any) {
            return {
                success: false,
                message: `Failed to disconnect Hotspot session: ${error.message}`,
                error: error.message
            };
        }
    }

    // Utility Methods
    async getSystemInfo(): Promise<MikroTikResponse> {
        try {
            const info = await this.executeCommand('/system/resource/print');
            return {
                success: true,
                message: 'System information retrieved successfully',
                data: info
            };
        } catch (error: any) {
            return {
                success: false,
                message: `Failed to get system info: ${error.message}`,
                error: error.message
            };
        }
    }

    async getInterfaces(): Promise<MikroTikResponse> {
        try {
            const interfaces = await this.executeCommand('/interface/print');
            return {
                success: true,
                message: 'Interfaces retrieved successfully',
                data: interfaces
            };
        } catch (error: any) {
            return {
                success: false,
                message: `Failed to get interfaces: ${error.message}`,
                error: error.message
            };
        }
    }

    // Test connection
    async testConnection(): Promise<MikroTikResponse> {
        try {
            const systemInfo = await this.executeCommand('/system/resource/print');
            return {
                success: true,
                message: 'Connection successful',
                data: systemInfo
            };
        } catch (error: any) {
            return {
                success: false,
                message: `Connection failed: ${error.message}`,
                error: error.message
            };
        }
    }

    // Log Management Functions

    // Get NAT logs (firewall logs with NAT action)
    async getNATLogs(options: {
        count?: number;
        follow?: boolean;
        topics?: string[];
        where?: string;
    } = {}): Promise<MikroTikResponse> {
        try {
            const params: any = {};

            if (options.count) {
                params['count'] = options.count.toString();
            }

            if (options.follow) {
                params['follow'] = 'yes';
            }

            if (options.topics && options.topics.length > 0) {
                params['topics'] = options.topics.join(',');
            }

            if (options.where) {
                params['where'] = options.where;
            }

            // Get firewall logs that contain NAT information
            const logs = await this.executeCommand('/log/print', params);

            // Filter for NAT-related logs
            const natLogs = logs.filter((log: any) =>
                log.topics && (
                    log.topics.includes('firewall') ||
                    log.topics.includes('nat') ||
                    log.message?.toLowerCase().includes('nat') ||
                    log.message?.toLowerCase().includes('srcnat') ||
                    log.message?.toLowerCase().includes('dstnat')
                )
            );

            return {
                success: true,
                message: 'NAT logs retrieved successfully',
                data: natLogs
            };
        } catch (error: any) {
            return {
                success: false,
                message: `Failed to get NAT logs: ${error.message}`,
                error: error.message
            };
        }
    }

    // Get RADIUS/AAA logs (authentication logs)
    async getRADIUSLogs(options: {
        count?: number;
        follow?: boolean;
        topics?: string[];
        where?: string;
    } = {}): Promise<MikroTikResponse> {
        try {
            const params: any = {};

            if (options.count) {
                params['count'] = options.count.toString();
            }

            if (options.follow) {
                params['follow'] = 'yes';
            }

            if (options.topics && options.topics.length > 0) {
                params['topics'] = options.topics.join(',');
            }

            if (options.where) {
                params['where'] = options.where;
            }

            // Get logs related to RADIUS/AAA
            const logs = await this.executeCommand('/log/print', params);

            // Filter for RADIUS/AAA-related logs
            const radiusLogs = logs.filter((log: any) =>
                log.topics && (
                    log.topics.includes('radius') ||
                    log.topics.includes('ppp') ||
                    log.topics.includes('hotspot') ||
                    log.message?.toLowerCase().includes('radius') ||
                    log.message?.toLowerCase().includes('authentication') ||
                    log.message?.toLowerCase().includes('login') ||
                    log.message?.toLowerCase().includes('logout')
                )
            );

            return {
                success: true,
                message: 'RADIUS logs retrieved successfully',
                data: radiusLogs
            };
        } catch (error: any) {
            return {
                success: false,
                message: `Failed to get RADIUS logs: ${error.message}`,
                error: error.message
            };
        }
    }

    // Get all system logs with filtering
    async getSystemLogs(options: {
        count?: number;
        follow?: boolean;
        topics?: string[];
        where?: string;
        buffer?: string;
    } = {}): Promise<MikroTikResponse> {
        try {
            const params: any = {};

            if (options.count) {
                params['count'] = options.count.toString();
            }

            if (options.follow) {
                params['follow'] = 'yes';
            }

            if (options.topics && options.topics.length > 0) {
                params['topics'] = options.topics.join(',');
            }

            if (options.where) {
                params['where'] = options.where;
            }

            if (options.buffer) {
                params['buffer'] = options.buffer;
            }

            const logs = await this.executeCommand('/log/print', params);

            return {
                success: true,
                message: 'System logs retrieved successfully',
                data: logs
            };
        } catch (error: any) {
            return {
                success: false,
                message: `Failed to get system logs: ${error.message}`,
                error: error.message
            };
        }
    }
}

// Factory function to create MikroTik client
export function createMikroTikClient(deviceId?: string): MikroTikClient | { error: string } {
    const creds = getMikrotikCredentials();
    if ('error' in creds) {
        return creds;
    }
    return new MikroTikClient(creds);
}

// Factory function to create MikroTik client from NAS device configuration
export async function createMikroTikClientFromNAS(deviceId?: string): Promise<MikroTikClient | { error: string }> {
    const creds = await getMikrotikCredentialsFromNAS(deviceId);
    if ('error' in creds) {
        return creds;
    }
    return new MikroTikClient(creds);
}

// Legacy compatibility function
export async function testMikrotikConnection(): Promise<MikroTikResponse> {
    const client = createMikroTikClient();
    if ('error' in client) {
        return { success: false, message: client.error };
    }
    return client.testConnection();
}

// Export the client class for direct use
export { MikroTikClient };
