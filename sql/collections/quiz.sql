select
    exercises.id,
    json_agg(exercises.content)->0 as content,
    bool_or(case when votes.user_id=${userId} then true else false end) as has_voted,
    json_agg(users.*) as creator
from v_exercises exercises
left join users_view users on exercises.updated_by=users.id
left join votes on exercises.id = votes.exercise_id
where collection_id=${collectionId} and not exercises.deleted and not exercises.is_disapproved
group by exercises.id, exercises.content ->> 'question', votes.positive,users.username, users.experience
order by random()
limit ${size}
