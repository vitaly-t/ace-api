select comments.*,
  users.username,
  users.experience
from comments 
join v_users users on user_id=users.id
where resource_id=${resourceId}
order by comments.id desc;
