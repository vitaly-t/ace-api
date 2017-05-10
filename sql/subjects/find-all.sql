-- userId

select subjects.*, schools.name as school, count (*) as downloads, case
        when ${userId} in (select user_id from favorites where subject_id = subjects.id)
            then true
            else false
    end as favorite
from subjects
left join favorites on subjects.id = subject_id
join schools on school_id=schools.id
where published = 'yes'
group by subjects.id, schools.name
order by favorite desc, downloads desc, code;
