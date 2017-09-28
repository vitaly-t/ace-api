select comments.*,
  users.username,
  users.experience,
  coalesce(votes,0) as votes,
  votes.positive is not null as has_voted
from comments 
join v_users users on user_id=users.id
LEFT JOIN (select resource_id, sum(case when positive=true then 1 else -1 end) as votes from votes group by resource_id) v on v.resource_id=comments.id
left join votes on votes.resource_id=comments.id and votes.user_id=${userId}
where comments.resource_id=${resourceId}
order by comments.id desc;
