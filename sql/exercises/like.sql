-- exerciseId
-- vote

insert into user_likes_exercise (user_id, exercise_id, positive)
values (${userId}, ${exerciseId}, ${positive})
on conflict do nothing;
