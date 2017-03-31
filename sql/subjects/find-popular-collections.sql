select collections.id, count(case when answers.created >= now()::date + interval '4h' then 1 end) as answers_last_day
from answers
    right join exercises on exercises.id=exercise_id
    join collections on collections.id=collection_id
where subject_id=${subjectId}
group by collections.id
order by answers_last_day desc, random()
limit ${count};