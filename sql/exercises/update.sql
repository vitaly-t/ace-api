-- exerciseId
-- content
-- type


update exercises
    set content = ${content},
        updated_by = ${userId},
        is_feasible = ${isFeasible}
where id = ${id};
