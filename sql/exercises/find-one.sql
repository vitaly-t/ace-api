select exercises.*, collections.name as collection_name, subjects.name as subject_name, color
from exercises
join collections on collection_id = collections.id
join subjects on subject_id = subjects.id
where exercises.id = ${exerciseId};