select
    exercises.id,
    collection_id,
    subject_id,
    exercises.user_id,
    username,
    experience,
    json_agg(exercises.content)->0 as content,
    bool_or(case when votes.user_id=${userId} then true else false end) as has_voted
from v_exercises exercises
left join votes on exercises.id = votes.exercise_id
where collection_id=${collectionId} -- and not exercises.deleted and not is_disapproved
group by exercises.id, exercises.content ->> 'question', votes.positive, username, experience, collection_id, subject_id, exercises.user_id
order by random()
limit ${size}
