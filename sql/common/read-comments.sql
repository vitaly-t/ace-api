select *
from comments 
join users_view users on user_id=users.id
where resource_id=${resourceId};
