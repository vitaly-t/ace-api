select activity from (
  
select time, row_to_json(row) as activity from (
  select 
    'CREATE_COURSE' as type, 
    subjects.id, 
    subjects.name as text,
    activities.reinforcement,
    subjects.created as time
  from subjects
    join activities on activities.name = 'CREATE_COURSE'
  where subjects.user_id = ${userId}
) row

union all

select time, row_to_json(row) as activity from (
  select 
    'CREATE_TOPIC' as type, 
    collections.id, 
    collections.name as text,
    activities.reinforcement,
    collections.created as time
  from collections
    join activities on activities.name = 'CREATE_TOPIC'
  where collections.user_id = ${userId}
) row

union all

select time, row_to_json(row) as activity from (
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

