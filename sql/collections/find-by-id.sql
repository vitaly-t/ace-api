select *
from collections
join user_owns_resource u on resource_id=collections.id
join v_users on u.user_id=v_users.id
where collections.id=${collectionId}
