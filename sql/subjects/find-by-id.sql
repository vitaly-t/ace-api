-- userId
-- subjectId
-- forceShow: Show subject even though it is not published

select *
from subjects
where id=${subjectId} and published='yes'
