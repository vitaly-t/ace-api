select comments.*,
    json_build_object('username', users.username, 'score', users.score) as creator
from comments join users_view users on users.id=user_id
where exercise_id=${exerciseId}
order by comments.created desc;
