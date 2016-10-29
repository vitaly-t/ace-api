insert into answers (correct, client_id, exercise_id)
values (${correct}, ${clientId}, ${exerciseId})
on conflict (client_id, exercise_id) do update set correct = ${correct}
