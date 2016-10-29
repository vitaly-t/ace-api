insert into answers (status, client_id, exercise_id)
values (${answerStatus}, ${clientId}, ${exerciseId})
on conflict (client_id, exercise_id) do update set status = ${answerStatus}
