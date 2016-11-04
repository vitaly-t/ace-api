select count(*)
from favorites
where created >= (now() - interval '12 hours')