-- userId
-- subjectId
-- forceShow: Show subject even though it is not published

select subjects.*, (case when favorites.subject_id is null then false else true end) as favorite
from subjects
left join favorites on favorites.user_id=${userId} and favorites.subject_id=subjects.id
where id=${subjectId} and published='yes'
