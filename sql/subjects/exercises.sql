select *
from v_exercises
where subject_id=${subjectId} and updated_by=${userId}
order by id desc;
