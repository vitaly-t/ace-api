-- exerciseId
-- vote

insert into votes (user_id, exercise_id, positive)
values (${userId}, ${exerciseId}, ${positive})
on conflict do nothing;
