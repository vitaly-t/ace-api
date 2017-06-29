select
    exercises.*,
    is_force_approved or sum(case when vote_exercise.positive=true then 1 else -1 end) >= 3 as is_approved,
    bool_or(case when vote_exercise.user_id=${userId} then true else false end) as has_voted,
    bool_or(case when a.user_id = ${userId} and a.status = true then true else false end) as status,
    json_build_object('username', users.username, 'experience', users.experience) as creator,
    count(case when a.user_id = ${userId} and a.status = true then 1 end) as c_m,
    count(case when a.user_id = ${userId} and a.status = false then 1 end) as w_m,
    count(case when a.status = false then 1 end) as w_a,
    count(case when a.status = true then 1 end) as c_a,
    count(distinct comments.id) as n_comments
from exercises
left join answers a on exercises.id = a.exercise_id
left join users_view users on exercises.updated_by=users.id
left join vote_exercise on exercises.id = vote_exercise.exercise_id
left join comments on comments.exercise_id=exercises.id
where collection_id=${collectionId} and not exercises.deleted 
group by exercises.id, vote_exercise.positive,users.username, users.experience
having sum(case when vote_exercise.positive=true then 1 else -1 end) > -3
order by random()
