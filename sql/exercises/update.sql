-- exerciseId
-- content
-- type


update exercises
    set content = ${content},
        updated_by = ${userId}
where id = ${id};
