select *
from comments
where exercise_id = ${exerciseId}
order by created desc