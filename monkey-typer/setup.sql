-- Run this in your ClickHouse instance (e.g. via running `docker exec -it clickhouse-db clickhouse-client`)
CREATE TABLE IF NOT EXISTS default.scores (
    id UUID DEFAULT generateUUIDv4(),
    nickname String,
    wpm UInt32,
    accuracy Float32,
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY (wpm, created_at);
