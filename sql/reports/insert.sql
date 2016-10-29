insert into reports (message, device, exercise_id, email)
values (${message}, ${device}, ${exerciseId}, ${email})
returning id
