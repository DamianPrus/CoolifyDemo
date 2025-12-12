import { NextResponse } from 'next/server';
import { client } from '@/lib/clickhouse';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { nickname, wpm, accuracy } = body;

        if (!nickname || typeof wpm !== 'number' || typeof accuracy !== 'number') {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        // Insert into ClickHouse
        await client.insert({
            table: 'scores',
            values: [
                {
                    id: crypto.randomUUID(),
                    nickname,
                    wpm,
                    accuracy,
                    created_at: Math.floor(Date.now() / 1000) // Send Unix timestamp (seconds) for DateTime
                },
            ],
            format: 'JSONEachRow',
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error submitting score:', error);
        return NextResponse.json({ error: 'Failed to submit score' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const resultSet = await client.query({
            query: `
        SELECT nickname, wpm, accuracy, created_at 
        FROM scores 
        ORDER BY wpm DESC, created_at DESC 
        LIMIT 10
      `,
            format: 'JSONEachRow',
        });

        const dataset = await resultSet.json();
        return NextResponse.json(dataset);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        // Return empty array on error (e.g. table doesn't exist yet) to avoid crashing UI
        return NextResponse.json([]);
    }
}
