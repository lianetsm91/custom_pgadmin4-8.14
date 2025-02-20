SELECT
    CASE
        WHEN c.relkind = 'r' THEN 'Table'
        WHEN c.relkind = 'v' THEN 'View'
        WHEN c.relkind = 'm' THEN 'Materialized View'
        WHEN c.relkind = 'S' THEN 'Sequence'
        WHEN c.relkind = 't' THEN 'TOAST Table'
        ELSE c.relkind::text
    END AS type,
    n.nspname AS schema,
    c.relname AS objname,
    STRING_AGG(acl.privilege_type, ', ') AS privileges
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
CROSS JOIN LATERAL pg_catalog.aclexplode(c.relacl) acl
WHERE acl.grantee = {{ rid|qtLiteral(conn) }}
GROUP BY c.relkind, schema, objname

UNION ALL

SELECT
    'Function' AS type,
    n.nspname AS schema,
    p.proname AS objname,
    STRING_AGG(acl.privilege_type, ', ') AS privileges
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
CROSS JOIN LATERAL pg_catalog.aclexplode(p.proacl) acl
WHERE acl.grantee = {{ rid|qtLiteral(conn) }}
GROUP BY type, schema, objname

UNION ALL

SELECT
    'Schema' AS type,
    n.nspname AS schema,
    NULL AS objname,
    STRING_AGG(acl.privilege_type, ', ') AS privileges
FROM pg_namespace n
CROSS JOIN LATERAL pg_catalog.aclexplode(n.nspacl) acl
WHERE acl.grantee = {{ rid|qtLiteral(conn) }}
GROUP BY type, schema

UNION ALL

SELECT
    'Type' AS type,
    n.nspname AS schema,
    t.typname AS objname,
    STRING_AGG(acl.privilege_type, ', ') AS privileges
FROM pg_type t
JOIN pg_namespace n ON n.oid = t.typnamespace
CROSS JOIN LATERAL pg_catalog.aclexplode(t.typacl) acl
WHERE acl.grantee = {{ rid|qtLiteral(conn) }}
GROUP BY type, schema, objname

UNION ALL

SELECT
    'Database' AS type,
    NULL AS schema,
    d.datname AS objname,
    STRING_AGG(acl.privilege_type, ', ') AS privileges
FROM pg_database d
CROSS JOIN LATERAL pg_catalog.aclexplode(d.datacl) acl
WHERE acl.grantee = {{ rid|qtLiteral(conn) }}
GROUP BY type, objname

UNION ALL

SELECT
    'Language' AS type,
    NULL AS schema,
    l.lanname AS objname,
    STRING_AGG(acl.privilege_type, ', ') AS privileges
FROM pg_language l
CROSS JOIN LATERAL pg_catalog.aclexplode(l.lanacl) acl
WHERE acl.grantee = {{ rid|qtLiteral(conn) }}
GROUP BY type, objname

UNION ALL

SELECT
    'Tablespace' AS type,
    NULL AS schema,
    t.spcname AS objname,
    STRING_AGG(acl.privilege_type, ', ') AS privileges
FROM pg_tablespace t
CROSS JOIN LATERAL pg_catalog.aclexplode(t.spcacl) acl
WHERE acl.grantee = {{ rid|qtLiteral(conn) }}
GROUP BY type, objname

UNION ALL

SELECT
    'Foreign Server' AS type,
    NULL AS schema,
    srv.srvname AS objname,
    STRING_AGG(acl.privilege_type, ', ') AS privileges
FROM pg_foreign_server srv
CROSS JOIN LATERAL pg_catalog.aclexplode(srv.srvacl) acl
WHERE acl.grantee = {{ rid|qtLiteral(conn) }}
GROUP BY type, objname

UNION ALL

SELECT
    'Foreign Data Wrapper' AS type,
    NULL AS schema,
    fdw.fdwname AS objname,
    STRING_AGG(acl.privilege_type, ', ') AS privileges
FROM pg_foreign_data_wrapper fdw
CROSS JOIN LATERAL pg_catalog.aclexplode(fdw.fdwacl) acl
WHERE acl.grantee = {{ rid|qtLiteral(conn) }}
GROUP BY type, objname

ORDER BY type, schema, objname
