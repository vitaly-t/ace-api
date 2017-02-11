-- exerciseId
-- content
-- type


update exercises
    set type = ${type},
        content = ${content},
        upvotes = 5,
        updated_by = ${userId}
where id = ${exerciseId};
