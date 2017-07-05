-- exerciseId
-- vote

insert into votes (user_id, exercise_id, positive)
values (${userId}, ${comment_id}, ${positive})
on conflict do nothing;
