select exercises.*, answers.status as answer_status, upvotes >= 10 as approved
from exercises
join collections on collection_id = collections.id
left join answers on exercises.id = exercise_id and answers.user_id = ${userId}
where subject_id=${subjectId} and exercises.upvotes >= 0
order by random();
