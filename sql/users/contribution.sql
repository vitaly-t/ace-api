select activity from (select time, row_to_json(row) as activity from (
  select 
    'CREATE_EXERCISE' as type, 
    exercises.id, 
    content->'question'->>'text' as text,
    activities.reinforcement,
    exercises.created as time
  from exercises
    join activities on activities.name = 'CREATE_EXERCISE'
  where exercises.updated_by = ${userId}
) row

union all

select time, row_to_json(row) as activity from (
  select 
    'COMMENT' as type, 
    exercise_id, 
    message,
    activities.reinforcement,
    comments.created as time
  from comments
    join activities on activities.name = 'COMMENT'
  where comments.user_id=${userId}
) row
) lol 
order by time desc
limit 20;

