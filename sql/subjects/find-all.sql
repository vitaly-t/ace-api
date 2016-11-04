-- Taking clientId
select subjects.*, count (exercises.id) as n_exercises, case
        when ${clientId} in (select client_id from favorites where subject_id = subjects.id)
            then true
            else false
    end as favorite
from subjects
join collections on collections.subject_id = subjects.id
join exercises on collection_id = collections.id
where published = 'yes'
group by subjects.id
order by code;
