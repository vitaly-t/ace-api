-- userId

select 
  subjects.*, 
  schools.name as school, 
  count (*) as downloads, 
  ${userId} in (select user_id from favorites where subject_id = subjects.id) as favorite
from subjects
left join favorites on subjects.id = subject_id
left join schools on school_id=schools.id
where published = 'yes' and (subjects.code ilike '%${search#}%' or subjects.name ilike '%${search#}%')
group by subjects.id, schools.name
order by favorite desc, downloads desc, code;
