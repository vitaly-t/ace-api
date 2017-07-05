-- exerciseId
-- vote

insert into votes (user_id, comment_id, positive)
values (${userId}, ${commentId}, ${positive})
on conflict do nothing;
