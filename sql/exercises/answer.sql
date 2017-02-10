insert into answers (status, user_id, exercise_id)
values (${answerStatus}, ${userId}, ${exerciseId})
on conflict (user_id, exercise_id) do update set status = ${answerStatus}
