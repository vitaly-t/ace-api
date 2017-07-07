select
    exercises.*,
    v_exercise_is_approved.is_approved,
    bool_or(case when votes.user_id=${userId} then true else false end) as has_voted,
    json_build_object('username', users.username, 'experience', users.experience) as creator,
    count(distinct comments.id) as n_comments
from exercises
left join v_exercise_is_approved on exercises.id=v_exercise_is_approved.exercise_id
left join users_view users on exercises.updated_by=users.id
left join votes on exercises.id = votes.exercise_id
left join comments on comments.exercise_id=exercises.id
where collection_id=${collectionId} and not exercises.deleted and not v_exercise_is_approved.is_disapproved
group by exercises.id, v_exercise_is_approved.is_approved, votes.positive,users.username, users.experience
order by random()
limit ${size}
