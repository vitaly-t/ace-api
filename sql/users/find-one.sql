select *
from users
where facebook_id = ${id} or device_id = ${id};