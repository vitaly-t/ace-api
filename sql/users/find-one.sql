select *
from users_view
where facebook_id = ${id} or device_id = ${id} or id = ${id};
