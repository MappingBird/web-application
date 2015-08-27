SELECT pg_terminate_backend(pid)
FROM pg_stat_activity 
WHERE 
    datname = 'mappingbird'
    AND pid <> pg_backend_pid()
    AND state = 'idle'
    AND state_change < current_timestamp - INTERVAL '1' MINUTE;
;
