INSERT INTO SUBSCRIPTIONS (subscriber, publisher) 
SELECT sub.id, pub.id 
from
  (select resources.id from resources where id=${subscriber}) sub, 
  (select resources.id from resources where id=${publisher}) pub
ON CONFLICT DO NOTHING;
