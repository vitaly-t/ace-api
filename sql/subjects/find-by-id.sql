-- userId
-- subjectId
-- forceShow: Show subject even though it is not published

select subjects.*, (case when favorites.subject_id is null then false else true end) as favorite, json_agg(collections.*) as topics
from subjects
left join favorites on favorites.user_id=${userId} and favorites.subject_id=subjects.id
left join collections on collections.subject_id=subjects.id
where subjects.id=${subjectId} and published='yes'
group by subjects.id, favorites.subject_id
