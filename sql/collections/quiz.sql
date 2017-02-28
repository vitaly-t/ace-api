select
    exercises.*,
    bool_or(case when a.user_id = ${userId} and a.status = true then true else false end) as status,
    upvotes >= 10 as approved,
    count(case when a.user_id = ${userId} and a.status = true then 1 end) as c_m,
    count(case when a.user_id = ${userId} and a.status = false then 1 end) as w_m,
    count(case when a.status = false then 1 end) as w_a,
    count(case when a.status = true then 1 end) as c_a
from exercises
left join answers a on exercises.id = exercise_id
where collection_id=${collectionId} and exercises.upvotes >= 0
group by exercises.id
order by random()
