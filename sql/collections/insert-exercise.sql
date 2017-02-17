-- collectionId
-- content
-- type


insert into exercises (type, content, collection_id, updated_by) values
(${type}, ${content}, ${collectionId}, ${userId}) returning *;