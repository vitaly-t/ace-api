select comments.*, username
from comments join users on users.id=user_id
where exercise_id=${exerciseId}
order by comments.created desc;
