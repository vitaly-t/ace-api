select collections.*, user_id, username, experience, coalesce(size,0) as size
from collections
join user_owns_resource u on resource_id=collections.id
join v_users on u.user_id=v_users.id
left join (select collection_id, count(*) as size from exercises group by collection_id) sz on collection_id=collections.id
where collections.id=${collectionId}
