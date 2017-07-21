select * from (
  
select time, row_to_json(row) as activity from (
  select 
    'CREATE_TOPIC' as type,
    collections.created as time,
    collections.id as collection_id,
    collections.name as collection_name,
    users.username,
    users.experience
  from collections
    join users_view users on user_id=users.id
  where subject_id=${subjectId}
) row

union all

select time, row_to_json(row) as activity from (
  select 
    'COMMENT' as type, 
    comments.created as time, 
    message,
    exercises.id as exercise_id,
    exercises.content->'question'->>'text' as question,
    users.username,
    users.experience
  from comments 
    join users_view users on user_id=users.id
    join exercises on exercise_id=exercises.id 
    join collections on collection_id=collections.id 
  where subject_id=${subjectId}
) row

union all

select time, row_to_json(row) as activity from (
  select 
    'CREATE_EXERCISE' as type,
    exercises.created as time,
    exercises.id as exercise_id,
    exercises.content->'question'->>'text' as question,
    collections.name as collection_name,
    users.username,
    users.experience
  from exercises
    join users_view users on updated_by=users.id
    join collections on collection_id=collections.id
  where subject_id=${subjectId}
) row

union all

select time, row_to_json(row) as activity from (
  select 
    'MODIFY_EXERCISE' as type,
    exercises.modified as time,
    exercises.id as exercise_id,
    exercises.content->'question'->>'text' as question,
    collections.name as collection_name,
    users.username,
    users.experience
  from exercises
    join users_view users on updated_by=users.id
    join collections on collection_id=collections.id
  where subject_id=${subjectId} and exercises.modified <> exercises.created
) row
) lol 
order by time desc
limit 20;
