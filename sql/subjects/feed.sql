select 
  'COMMENT' as type, 
  comments.created, 
  message,
  exercises.id as exercise_id,
  users.username,
  users.experience
from comments 
  join users_view users on user_id=users.id
  join exercises on exercise_id=exercises.id 
  join collections on collection_id=collections.id 
where subject_id=${subjectId};
