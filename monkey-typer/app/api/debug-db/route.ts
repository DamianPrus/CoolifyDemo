import { NextResponse } from 'next/server';

export async function GET() {
    const hostsToTest = [
        'http://10.0.0.1:8123',
        'http://172.17.0.1:8123',
        'http://host.docker.internal:8123',
        'http://clickhouse-db:8123',
        'http://clickhouse:8123',
        'http://clickhouse-database-jwcgk8sg40coss80wk8oc4cc:8123', // Actual Service Name
        process.env.CLICKHOUSE_HOST || 'env-var-missing'
    ];

    const results = [];

    for (const host of hostsToTest) {
        const start = Date.now();
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout

            const res = await fetch(`${host}/ping`, {
                method: 'GET',
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            results.push({
                host,
                status: res.status,
                ok: res.ok,
                text: await res.text().catch(() => 'no-text'),
                time: Date.now() - start
            });
        } catch (e) {
            results.push({
                host,
                error: e instanceof Error ? e.message : String(e),
                time: Date.now() - start
            });
        }
    }

    return NextResponse.json({
        env_host: process.env.CLICKHOUSE_HOST,
        results
    });
}
