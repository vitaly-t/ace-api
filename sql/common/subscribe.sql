INSERT INTO SUBSCRIPTIONS (subscriber, publisher) 
SELECT sub.id, pub.id 
from
  (select resources.id from resources where ${subscriberType~}=${subscriber}) sub, 
  (select resources.id from resources where ${publisherType~}=${publisher}) pub
ON CONFLICT DO NOTHING;
