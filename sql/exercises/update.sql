-- exerciseId
-- content
-- type


update exercises
    set content = ${content},
        upvotes = 5,
        updated_by = ${userId},
        is_feasible = ${isFeasible}
where id = ${id};
