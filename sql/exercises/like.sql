-- exerciseId
-- vote

insert into user_likes_exercise (user_id, exercise_id, user_credibility)
values (${userId}, ${exerciseId}, (select credibility * ${positive} from user_credibility where user_id=${userId}))
on conflict do nothing;
