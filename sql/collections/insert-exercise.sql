-- collectionId
-- content
-- type


insert into exercises (type, content, collection_id, crowd_sourced, updated_by) values
(${type}, ${content}, ${collectionId}, true, ${userId}) returning *;