insert into users (device_id, username)
values (${deviceId}, ${username}) returning username
