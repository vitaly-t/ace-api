select 
  levels.*, 
  json_agg(activities.* order by activities.reinforcement desc) activities
from levels 
  join activities on level=levels.id 
group by levels.id;
