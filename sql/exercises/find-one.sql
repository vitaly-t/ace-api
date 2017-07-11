select *
from  v_exercises exercises
where exercises.id = ${exerciseId}
limit 1;
