select 
  users.id, 
  users.username, 
  count(exercises.*) as n_exercises 
from exercises 
  join users on updated_by=users.id 
  join collections on collections.id=collection_id 
where updated_by>1 and subject_id=${subjectId} 
group by users.id 
order by n_exercises;
