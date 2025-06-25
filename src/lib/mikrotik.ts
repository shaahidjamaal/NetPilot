'use server';

import RouterOS from 'node-routeros';

function getMikrotikCredentials() {
    const host = process.env.MIKROTIK_HOST;
    const user = process.env.MIKROTIK_USER;
    const password = process.env.MIKROTIK_PASSWORD;

    if (!host || !user) {
        return { error: 'Mikrotik host and user must be configured in your .env file.' };
    }

    return { host, user, password: password || '' };
}

export async function testMikrotikConnection() {
    const creds = getMikrotikCredentials();
    if (creds.error) {
        return { success: false, message: creds.error };
    }

    const { host, user, password } = creds;

    // The library is untyped, so we handle it carefully.
    const conn = new (RouterOS as any)({ host, user, password });

    try {
        await conn.connect();
        // A simple, non-intrusive command to verify the connection is live.
        await conn.write('/system/resource/print');
        conn.close(); // Important to close the connection
        return { success: true, message: 'Connection to Mikrotik router successful!' };
    } catch (error: any) {
        let errorMessage = 'An unknown error occurred.';
        if (error?.message) {
            errorMessage = error.message;
        }
        // The error might be about socket hang up, timeouts, or authentication failure.
        return { success: false, message: `Connection failed: ${errorMessage}` };
    }
}
