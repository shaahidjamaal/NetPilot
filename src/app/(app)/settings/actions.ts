'use server';

import { testMikrotikConnection } from '@/lib/mikrotik';

export async function testConnectionAction() {
    return testMikrotikConnection();
}
