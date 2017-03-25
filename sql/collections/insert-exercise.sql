-- collectionId
-- content
-- type


insert into exercises (content, collection_id, updated_by, is_feasible) values
(${content}, ${collectionId}, ${userId}, ${isFeasible}) returning *;