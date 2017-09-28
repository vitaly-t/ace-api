select 
  exercises.*,
  (case when votes.positive is null then false else true end) as has_voted
from v_exercises exercises
left join votes on votes.resource_id=exercises.id and votes.user_id=${userId}
join collections on collection_id=collections.id
where collections.subject_id=${subjectId}
order by random()
limit ${size}
