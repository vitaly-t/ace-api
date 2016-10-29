select *, (
    select json_agg(row_to_json(c))
    from (
        select *, (
            select json_agg(row_to_json(e)) exercises
            from (
                select exercises.*, answers.status as answer_status
                    from exercises
                    left join answers on exercises.id = exercise_id and answers.client_id = ${clientId}
                    where collection_id=c.id
                    order by position, id
            ) e
        )
        from collections c
        where subject_id=subjects.id) c
) collections
from subjects
where id=${subjectId} and (published='yes' or ${forceShow})