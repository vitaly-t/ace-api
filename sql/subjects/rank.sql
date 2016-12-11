select client_id, count as answered_correct, rank, (
    select count(distinct client_id)
    from answers
    join exercises on exercise_id=exercises.id
    join collections on collection_id=collections.id
    join subjects on subject_id=subjects.id
    where answers.created >= now()::date and subjects.id=${subjectId}
    ) as participants
from (
    select client_id,count(*), row_number() over (order by count(*) desc) as rank
    from answers
    join exercises on exercise_id=exercises.id
    join collections on collection_id=collections.id
    join subjects on subject_id=subjects.id
    where
    status=true
    and subjects.id=${subjectId}
    and answers.created >= now()::date
    group by answers.client_id
) as a
where
client_id=${clientId}
union all
select ${clientId} as client_id, '0' as count, '0' as rank, '0' as participants
limit 1;

