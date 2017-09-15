-- userId

select 
  subjects.*, 
  schools.name as school, 
  count (*) as downloads, 
  ${userId} in (select user_id from favorites where subject_id = subjects.id) as favorite,
  coalesce(counts.n_exercises,0) as n_exercises,
  coalesce(counts.n_topics,0) as n_topics,
  coalesce(progression, 0) as progression
from subjects
left join (select subject_id, count(*) as n_topics, sum(n_exercises) as n_exercises from (select collection_id, count(*) as n_exercises from exercises group by collection_id) as ex join collections on ex.collection_id=collections.id group by subject_id) as counts on subjects.id=counts.subject_id
left join (select subject_id, count(distinct exercise_id) as progression from exercises join answers on exercises.id=exercise_id and user_id=${userId} and status=true join collections on collection_id=collections.id group by subject_id) prog on subjects.id = prog.subject_id
left join favorites on subjects.id = favorites.subject_id
left join schools on school_id=schools.id
where published = 'yes' and (subjects.code ilike '%${search#}%' or subjects.name ilike '%${search#}%')
group by subjects.id, schools.name, counts.n_exercises, counts.n_topics, prog.progression
order by favorite desc, downloads desc, code;

