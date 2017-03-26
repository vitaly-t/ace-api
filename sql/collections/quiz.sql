select
    exercises.*,
    (case when approved is true then true else false end) as approved,
    (case when user_credibility is null then false else true end) as has_liked,
    bool_or(case when a.user_id = ${userId} and a.status = true then true else false end) as status,
    count(case when a.user_id = ${userId} and a.status = true then 1 end) as c_m,
    count(case when a.user_id = ${userId} and a.status = false then 1 end) as w_m,
    count(case when a.status = false then 1 end) as w_a,
    count(case when a.status = true then 1 end) as c_a
from exercises
left join exercise_is_approved on exercises.id = exercise_id
left join answers a on exercises.id = a.exercise_id
left join user_likes_exercise on exercises.id = user_likes_exercise.exercise_id and user_likes_exercise.user_id = ${userId}
where collection_id=${collectionId} and (disapproved is null or not disapproved)
group by exercises.id, approved, user_likes_exercise.user_credibility
order by random()
