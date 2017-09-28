-- userId
-- subjectId
-- forceShow: Show subject even though it is not published

select subjects.*, (case when favorites.subject_id is null then false else true end) as favorite, users.id as user_id, username, experience
from subjects
left join favorites on favorites.user_id=${userId} and favorites.subject_id=subjects.id
join user_owns_resource u on resource_id=subjects.id
join v_users users on u.user_id=users.id
where subjects.id=${subjectId} and published='yes'
group by subjects.id, favorites.subject_id, users.id, username, experience
