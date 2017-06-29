select
    collections.*,
    count(exercises.id),
    count(a) as correctly_answered
from collections
    left join exercises on collection_id=collections.id
    left join
       (select distinct user_id, exercise_id from answers where status = true) as a
       on exercise_id=exercises.id and user_id=${userId}
where subject_id = ${subjectId}
group by collections.id
order by collections.position asc, collections.id desc
