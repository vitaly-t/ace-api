select
    exercises.*,
--    a.status as answer_status,
    upvotes >= 10 as approved,
    array_remove(array_agg(case when a.user_id = ${userId} then a.status end),null) as me_answers,
    array_remove(array_agg(a.status),null) as all_answers
from exercises
left join answers a on exercises.id = exercise_id
where collection_id=${collectionId} and exercises.upvotes >= 0
group by exercises.id
order by random()
