INSERT INTO COMMENTS (message, user_id, resource_id) 
SELECT ${message}, ${userId}, res.id
from
  (select resources.id from resources where ${resourceType~}=${resource}) res
RETURNING *
