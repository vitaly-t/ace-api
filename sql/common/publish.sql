INSERT INTO NOTIFICATIONS (activity, publisher, user_id) 
SELECT ${activity}, pub.id, ${userId}
from
  (select resources.id from resources where ${publisherType~}=${publisher}) pub
RETURNING *;
