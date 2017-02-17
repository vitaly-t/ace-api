select exercises.*, answers.status as answer_status, upvotes >= 10 as approved
from exercises
left join answers on exercises.id = exercise_id and answers.user_id = ${userId}
where collection_id=${collectionId} and exercises.upvotes >= 0
order by random()
limit ${quizLength};