select 'exercises_answered_last_${nHours}_hours' as measure, count(*)
from answers
where created >= now() - interval ' ${nHours} hours'

union

select 'subjects_favorited_last_${nHours}_hours' as measure, count(*)
from favorites
where created >= now() - interval ' ${nHours} hours'

union

select 'unique_users_all_time' as measure, count(distinct client_id)
from favorites;