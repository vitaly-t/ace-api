INSERT INTO ${table~} (${data~}) 
VALUES ('lol','ok') 
RETURNING *
ON CONFLICT DO NOTHING;
