import { createMikroTikClient, MikroTikResponse, PPPoEUser, HotspotUser, UserProfile } from './mikrotik';
import { Customer, Package } from './types';

// AAA Service Types
export interface AAAUser {
    username: string;
    password: string;
    customerId: string;
    serviceType: 'pppoe' | 'hotspot';
    profile: string;
    enabled: boolean;
    comment?: string;
    macAddress?: string;
    ipAddress?: string;
}

export interface BandwidthProfile {
    name: string;
    downloadSpeed: number; // in Mbps
    uploadSpeed: number; // in Mbps
    burstDownload?: number;
    burstUpload?: number;
    burstThreshold?: number;
    burstTime?: number;
    sessionTimeout?: number; // in seconds
    idleTimeout?: number; // in seconds
    sharedUsers?: number;
    addressPool?: string;
}

export interface SyncResult {
    success: boolean;
    message: string;
    created?: number;
    updated?: number;
    errors?: string[];
}

// AAA Service Class
export class AAAService {
    private mikrotikClient: any;

    constructor() {
        const client = createMikroTikClient();
        if ('error' in client) {
            throw new Error(`MikroTik connection error: ${client.error}`);
        }
        this.mikrotikClient = client;
    }

    // Convert NetPilot package to MikroTik rate limit format
    private packageToRateLimit(pkg: Package): string {
        const downloadKbps = pkg.downloadSpeed * 1024; // Convert Mbps to Kbps
        const uploadKbps = pkg.uploadSpeed * 1024;
        
        if (pkg.burstEnabled && pkg.burstDownloadSpeed && pkg.burstUploadSpeed) {
            const burstDownloadKbps = pkg.burstDownloadSpeed * 1024;
            const burstUploadKbps = pkg.burstUploadSpeed * 1024;
            const burstThresholdDown = pkg.burstThresholdDownload ? pkg.burstThresholdDownload * 1024 : downloadKbps;
            const burstThresholdUp = pkg.burstThresholdUpload ? pkg.burstThresholdUpload * 1024 : uploadKbps;
            const burstTime = pkg.burstTime || 8;
            
            return `${uploadKbps}k/${downloadKbps}k ${burstUploadKbps}k/${burstDownloadKbps}k ${burstThresholdUp}k/${burstThresholdDown}k ${burstTime}/${burstTime} 8`;
        }
        
        return `${uploadKbps}k/${downloadKbps}k`;
    }

    // Create bandwidth profile from NetPilot package
    async createBandwidthProfile(pkg: Package, serviceType: 'pppoe' | 'hotspot'): Promise<MikroTikResponse> {
        const profile: UserProfile = {
            name: `${pkg.name.replace(/\s+/g, '_')}_${serviceType}`,
            'rate-limit': this.packageToRateLimit(pkg),
            'session-timeout': pkg.validity ? `${pkg.validity * 24 * 3600}` : undefined, // Convert days to seconds
            'idle-timeout': '1800', // 30 minutes default
            'keepalive-timeout': '120', // 2 minutes default
            'shared-users': 1,
            comment: `NetPilot: ${pkg.description || pkg.name}`
        };

        if (serviceType === 'pppoe') {
            return this.mikrotikClient.createPPPoEProfile(profile);
        } else {
            return this.mikrotikClient.createHotspotProfile(profile);
        }
    }

    // Create user account on MikroTik
    async createUserAccount(customer: Customer, pkg: Package, serviceType: 'pppoe' | 'hotspot'): Promise<MikroTikResponse> {
        const profileName = `${pkg.name.replace(/\s+/g, '_')}_${serviceType}`;
        
        if (serviceType === 'pppoe') {
            const pppoeUser: PPPoEUser = {
                name: customer.pppoeUsername || customer.email,
                password: customer.pppoePassword || this.generatePassword(),
                profile: profileName,
                service: 'ppp',
                disabled: customer.status !== 'Active',
                comment: `NetPilot Customer: ${customer.name} (ID: ${customer.id})`
            };
            
            return this.mikrotikClient.createPPPoEUser(pppoeUser);
        } else {
            const hotspotUser: HotspotUser = {
                name: customer.pppoeUsername || customer.email,
                password: customer.pppoePassword || this.generatePassword(),
                profile: profileName,
                disabled: customer.status !== 'Active',
                comment: `NetPilot Customer: ${customer.name} (ID: ${customer.id})`
            };
            
            return this.mikrotikClient.createHotspotUser(hotspotUser);
        }
    }

    // Update user account on MikroTik
    async updateUserAccount(customer: Customer, pkg: Package, serviceType: 'pppoe' | 'hotspot'): Promise<MikroTikResponse> {
        const profileName = `${pkg.name.replace(/\s+/g, '_')}_${serviceType}`;
        const username = customer.pppoeUsername || customer.email;
        
        const updates = {
            profile: profileName,
            disabled: customer.status !== 'Active',
            comment: `NetPilot Customer: ${customer.name} (ID: ${customer.id})`
        };

        if (customer.pppoePassword) {
            (updates as any).password = customer.pppoePassword;
        }

        if (serviceType === 'pppoe') {
            return this.mikrotikClient.updatePPPoEUser(username, updates);
        } else {
            return this.mikrotikClient.updateHotspotUser(username, updates);
        }
    }

    // Delete user account from MikroTik
    async deleteUserAccount(username: string, serviceType: 'pppoe' | 'hotspot'): Promise<MikroTikResponse> {
        if (serviceType === 'pppoe') {
            return this.mikrotikClient.deletePPPoEUser(username);
        } else {
            return this.mikrotikClient.deleteHotspotUser(username);
        }
    }

    // Sync customer with MikroTik
    async syncCustomer(customer: Customer, pkg: Package, serviceType: 'pppoe' | 'hotspot' = 'pppoe'): Promise<SyncResult> {
        try {
            // First ensure the profile exists
            const profileResult = await this.createBandwidthProfile(pkg, serviceType);
            if (!profileResult.success && !profileResult.message.includes('already exists')) {
                return {
                    success: false,
                    message: `Failed to create/verify profile: ${profileResult.message}`,
                    errors: [profileResult.error || profileResult.message]
                };
            }

            // Then create/update the user
            const userResult = await this.createUserAccount(customer, pkg, serviceType);
            if (!userResult.success) {
                // If user already exists, try to update
                if (userResult.message.includes('already exists') || userResult.message.includes('duplicate')) {
                    const updateResult = await this.updateUserAccount(customer, pkg, serviceType);
                    if (!updateResult.success) {
                        return {
                            success: false,
                            message: `Failed to update existing user: ${updateResult.message}`,
                            errors: [updateResult.error || updateResult.message]
                        };
                    }
                    return {
                        success: true,
                        message: `Customer ${customer.name} updated successfully on MikroTik`,
                        updated: 1
                    };
                } else {
                    return {
                        success: false,
                        message: `Failed to create user: ${userResult.message}`,
                        errors: [userResult.error || userResult.message]
                    };
                }
            }

            return {
                success: true,
                message: `Customer ${customer.name} synced successfully to MikroTik`,
                created: 1
            };
        } catch (error: any) {
            return {
                success: false,
                message: `Sync failed: ${error.message}`,
                errors: [error.message]
            };
        }
    }

    // Get active sessions
    async getActiveSessions(serviceType: 'pppoe' | 'hotspot' = 'pppoe'): Promise<MikroTikResponse> {
        if (serviceType === 'pppoe') {
            return this.mikrotikClient.getActivePPPoESessions();
        } else {
            return this.mikrotikClient.getActiveHotspotSessions();
        }
    }

    // Disconnect user session
    async disconnectUser(sessionId: string, serviceType: 'pppoe' | 'hotspot' = 'pppoe'): Promise<MikroTikResponse> {
        if (serviceType === 'pppoe') {
            return this.mikrotikClient.disconnectPPPoESession(sessionId);
        } else {
            return this.mikrotikClient.disconnectHotspotSession(sessionId);
        }
    }

    // Test MikroTik connection
    async testConnection(): Promise<MikroTikResponse> {
        return this.mikrotikClient.testConnection();
    }

    // Log Management Functions

    // Get NAT logs
    async getNATLogs(options: {
        count?: number;
        sourceIP?: string;
        destinationIP?: string;
        protocol?: string;
        action?: string;
        startDate?: string;
        endDate?: string;
    } = {}): Promise<MikroTikResponse> {
        const logOptions: any = {
            count: options.count || 100,
            topics: ['firewall']
        };

        // Build where clause for filtering
        let whereClause = '';

        if (options.sourceIP) {
            whereClause += `message~"${options.sourceIP}"`;
        }

        if (options.destinationIP) {
            if (whereClause) whereClause += ' && ';
            whereClause += `message~"${options.destinationIP}"`;
        }

        if (options.protocol) {
            if (whereClause) whereClause += ' && ';
            whereClause += `message~"${options.protocol}"`;
        }

        if (options.action) {
            if (whereClause) whereClause += ' && ';
            whereClause += `message~"${options.action}"`;
        }

        // Add date filtering
        if (options.startDate || options.endDate) {
            let dateFilter = '';
            if (options.startDate) {
                dateFilter += `time>="${options.startDate}"`;
            }
            if (options.endDate) {
                if (dateFilter) dateFilter += ' && ';
                dateFilter += `time<="${options.endDate}"`;
            }

            if (whereClause) {
                whereClause = `(${whereClause}) && (${dateFilter})`;
            } else {
                whereClause = dateFilter;
            }
        }

        if (whereClause) {
            logOptions.where = whereClause;
        }

        return this.mikrotikClient.getNATLogs(logOptions);
    }

    // Get RADIUS/AAA logs
    async getAccessRequestLogs(options: {
        count?: number;
        username?: string;
        clientIP?: string;
        authStatus?: string;
        startDate?: string;
        endDate?: string;
    } = {}): Promise<MikroTikResponse> {
        const logOptions: any = {
            count: options.count || 100,
            topics: ['radius', 'ppp', 'hotspot']
        };

        // Build where clause for filtering
        let whereClause = '';

        if (options.username) {
            whereClause += `message~"${options.username}"`;
        }

        if (options.clientIP) {
            if (whereClause) whereClause += ' && ';
            whereClause += `message~"${options.clientIP}"`;
        }

        if (options.authStatus) {
            if (whereClause) whereClause += ' && ';
            if (options.authStatus === 'accept') {
                whereClause += `(message~"accept" || message~"login" || message~"authenticated")`;
            } else if (options.authStatus === 'reject') {
                whereClause += `(message~"reject" || message~"deny" || message~"failed")`;
            }
        }

        // Add date filtering
        if (options.startDate || options.endDate) {
            let dateFilter = '';
            if (options.startDate) {
                dateFilter += `time>="${options.startDate}"`;
            }
            if (options.endDate) {
                if (dateFilter) dateFilter += ' && ';
                dateFilter += `time<="${options.endDate}"`;
            }

            if (whereClause) {
                whereClause = `(${whereClause}) && (${dateFilter})`;
            } else {
                whereClause = dateFilter;
            }
        }

        if (whereClause) {
            logOptions.where = whereClause;
        }

        return this.mikrotikClient.getRADIUSLogs(logOptions);
    }

    // Get system logs with filtering
    async getSystemLogs(options: {
        count?: number;
        topics?: string[];
        where?: string;
        buffer?: string;
    } = {}): Promise<MikroTikResponse> {
        return this.mikrotikClient.getSystemLogs(options);
    }

    // Generate random password
    private generatePassword(length: number = 8): string {
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let password = '';
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return password;
    }
}

// Factory function
export function createAAAService(): AAAService {
    return new AAAService();
}
