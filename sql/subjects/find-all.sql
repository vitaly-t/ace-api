select subjects.*, count (exercises.id) as n_exercises, case
        when favorites.client_id=${clientId}
            then true
            else false
    end as favorite
from subjects left join favorites on favorites.subject_id = subjects.id
join collections on collections.subject_id = subjects.id
join exercises on collection_id = collections.id
where published = 'yes'
group by subjects.id, favorites.client_id
order by code;
