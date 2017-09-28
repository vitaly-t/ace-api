select 
  n.*,
  activities.symbol,
  case when user_has_seen_notification.user_id is null and n.user_id <> ${userId} then false else true end as has_seen
from notifications n
  join subscriptions s on n.publisher = s.publisher
  join activities on activity=activities.name
  left join user_has_seen_notification on n.id=notification_id and user_has_seen_notification.user_id=${userId}
where s.subscriber=${subscriber} and n.created >= s.created and (n.user_id is null or n.user_id <> ${excludeUserId})
order by n.created desc;
