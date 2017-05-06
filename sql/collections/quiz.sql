select
    exercises.*,
    exercises.relevance_points >= 1 as is_approved,
    users.username as username,
    json_build_object('username', users.username, 'score', users.score) as creator,
    (case when user_likes_exercise.positive is null then false else true end) as has_liked,
    bool_or(case when a.user_id = ${userId} and a.status = true then true else false end) as status,
    count(case when a.user_id = ${userId} and a.status = true then 1 end) as c_m,
    count(case when a.user_id = ${userId} and a.status = false then 1 end) as w_m,
    count(case when a.status = false then 1 end) as w_a,
    count(case when a.status = true then 1 end) as c_a,
    count(distinct comments.id) as n_comments
from exercises
left join answers a on exercises.id = a.exercise_id
left join users_view users on exercises.updated_by=users.id
left join user_likes_exercise on exercises.id = user_likes_exercise.exercise_id and user_likes_exercise.user_id = ${userId}
left join comments on comments.exercise_id=exercises.id
where collection_id=${collectionId} and relevance_points > -1 and (relevance_points >= 1 or not ${isDaily}) and (is_feasible=true or not ${isDaily})
group by exercises.id, user_likes_exercise.positive, users.username, users.score
order by random()
