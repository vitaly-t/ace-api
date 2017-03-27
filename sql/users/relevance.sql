select
    count(case when approved then 1 end) as approved,
    count(case when disapproved then 1 end) as disapproved
from users
join exercises on users.id=updated_by
join exercise_is_approved on exercise_is_approved.exercise_id = exercises.id
where users.id = ${userId};