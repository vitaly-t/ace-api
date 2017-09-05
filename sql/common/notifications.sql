select 
  notifications.id,
  notifications.activity, 
  reinforcement, 
  json_build_object('id', exercises.id, 'content', exercises.content) as exercise,
  json_build_object('id', collections.id, 'name', collections.name) as collection,
  json_build_object('id', subjects.id, 'name', subjects.name, 'code', subjects.code) as subject,
  json_build_object('id', users.id, 'username', users.username, 'experience', users.experience) as user,
  notifications.created as time,
  notifications.created < ${lastChecked} as has_seen
from notifications
  join v_users users on notifications.user_id=users.id
  join activities on activity=activities.name
  join subscriptions on subscriptions.publisher=notifications.publisher
  join resources sub on subscriber=sub.id
  join resources pub on subscriptions.publisher=pub.id
  left join exercises on pub.id=exercises.id
  left join collections on pub.id=collections.id
  left join subjects on pub.id=subjects.id
where sub.id=${subscriber} and users.id <> ${userId}
order by notifications.created desc;
