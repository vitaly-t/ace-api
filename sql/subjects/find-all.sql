-- clientId

select subjects.*, count (*) as downloads, case
        when ${clientId} in (select client_id from favorites where subject_id = subjects.id)
            then true
            else false
    end as favorite
from subjects
left join favorites on subjects.id = subject_id
where published = 'yes'
group by subjects.id
order by code;
