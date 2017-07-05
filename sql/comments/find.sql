select comments.*,
    users.username as username,
    json_build_object('username', users.username) as creator,
    sum(case when votes.id is null then 0 when votes.positive then 1 else -1 end) as votes,
    bool_or(case when votes.user_id = ${userId} then true else false end) has_voted
from comments 
  join users_view users on users.id=user_id
  left join votes on comment_id=comments.id 
where comments.exercise_id=${exerciseId}
group by comments.id, users.username
order by comments.created desc;
