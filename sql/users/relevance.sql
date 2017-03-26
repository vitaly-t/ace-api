select
    count(case when relevance >= 1 then 1 end) as approved,
    count(case when relevance <= -1 then 1 end) as disapproved
from users
join exercises on users.id=updated_by
where users.id = ${userId};