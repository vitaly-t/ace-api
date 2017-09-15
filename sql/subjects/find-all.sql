-- userId

select 
  subjects.*, 
  schools.name as school, 
  count (*) as downloads, 
  ${userId} in (select user_id from favorites where subject_id = subjects.id) as favorite,
  counts.n_exercises,
  counts.n_topics
from subjects
left join (select subject_id, count(*) as n_topics, sum(n_exercises) as n_exercises from (select collection_id, count(*) as n_exercises from exercises group by collection_id) as ex join collections on ex.collection_id=collections.id group by subject_id) as counts on subjects.id=counts.subject_id
left join favorites on subjects.id = favorites.subject_id
left join schools on school_id=schools.id
where published = 'yes' and (subjects.code ilike '%${search#}%' or subjects.name ilike '%${search#}%')
group by subjects.id, schools.name, counts.n_exercises, counts.n_topics
order by favorite desc, downloads desc, code;

