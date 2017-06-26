select comments.*,
    users.username as username,
    json_build_object('username', users.username) as creator
from comments join users_view users on users.id=user_id
where exercise_id=${exerciseId}
order by comments.created desc;
