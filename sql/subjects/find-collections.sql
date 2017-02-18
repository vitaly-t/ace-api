select collections.*, count(exercises.id) as size
from collections
join exercises on collection_id=collections.id
where subject_id = ${subjectId}
group by collections.id
order by collections.position asc, collections.id desc
