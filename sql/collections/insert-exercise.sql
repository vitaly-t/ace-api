-- collectionId
-- content
-- type


insert into exercises (content, collection_id, updated_by) values
(${content}, ${collectionId}, ${userId}) returning *;
