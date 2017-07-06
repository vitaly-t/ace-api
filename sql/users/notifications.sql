select * from (select time, row_to_json(row) as activity from (
  select 
    'COMMENT_YOUR_EXERCISE' as type, 
    comments.created as time, 
    message,
    exercises.id as exercise_id,
    exercises.content->'question'->>'text' as question,
    users.username,
    users.experience,
    comments.created < ${lastChecked} as has_seen
  from comments 
    join users_view users on user_id=users.id
    join exercises on exercise_id=exercises.id 
  where exercises.updated_by = ${userId} and comments.user_id <> ${userId}
) row

union all

select time, row_to_json(row) as activity from (
  select 
    'COMMENT_ON_SAME_EXERCISE' as type, 
    comments.created as time, 
    message,
    exercises.id as exercise_id,
    exercises.content->'question'->>'text' as question,
    users.username,
    users.experience,
    comments.created < ${lastChecked} as has_seen
  from comments 
    join users_view users on user_id=users.id
    join exercises on exercise_id=exercises.id 
  where comments.exercise_id in (select exercise_id from comments where user_id=${userId} ) and comments.user_id <> ${userId}
) row
) lol 
order by time desc
limit 20;
