-- exerciseId
-- vote

update exercises
set upvotes = upvotes + ${vote}
where id = ${exerciseId};