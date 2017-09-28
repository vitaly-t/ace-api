select 
  exercises.*,
  (case when votes.positive is null then false else true end) as has_voted
from v_exercises exercises
left join votes on votes.resource_id=exercises.id and votes.user_id=${userId}
where collection_id=${collectionId}
order by random()
limit ${size}
