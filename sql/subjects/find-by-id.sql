-- userId
-- subjectId
-- forceShow: Show subject even though it is not published

select *, (
    select coalesce (json_agg(row_to_json(c)), '[]')
    from (
        select *, (
            select coalesce (json_agg(row_to_json(e)), '[]') exercises
            from (
                select exercises.*, answers.status as answer_status
                    from exercises
                    left join answers on exercises.id = exercise_id and answers.user_id = ${userId}
                    where collection_id=c.id
                    order by position, id
            ) e
        )
        from collections c
        where subject_id=subjects.id
        order by position, id) c
) collections
from subjects
where id=${subjectId} and (published='yes' or ${forceShow})