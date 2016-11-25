select exercises.*, answers.status as answer_status
from exercises
left join answers on exercises.id = exercise_id and answers.client_id = ${clientId}
where collection_id=${collectionId}
order by random()
limit 10;