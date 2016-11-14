# Resources

[Subject](#subject)

[Exercise](#exercise)

# <a name="subject"></a>Subject

## Fetch all subjects

Get list of all subjects. Every subject has a field 'favorite' that communicates that a subject has been favorited by the client

```
GET /subjects
```

#### Headers:
* Client-Id: (Optional) To authenticate user

####Success response:
```json
200 OK
[
  {
    "id": 1,
    "name": "Learn about Barack Obama",
    "code": "TDT4242",
    "description": "Just Barack Obama",
    "color": "3ea12c",
    "published": "yes",
    "favorite": false
  }
]
```


## Fetch subject

```
GET /subjects/{subjectId}
```

#### Headers:
* Client-Id: (Optional) To authenticate user

####Success response:
```json
200 OK
{
  "id": 1,
  "name": "Learn about Barack Obama",
  "code": "TDT4242",
  "description": "Just Barack Obama",
  "color": "3ea12c",
  "published": "yes",
  "collections": []
}
```


## Add subject to favorites

```
PUT /subjects/{subjectId}
```

####Required headers:
* Client-Id: (Required) To authenticate user

####Data

```json
{
  "favorite": true/false
}
```

####Success response:
```json
204 No content
```


# <a name="exercise"></a>Exercise

## Answer exercise

```
PUT /exercises/{exerciseId}
```

####Required headers:
* Client-Id: (Required) To authenticate user

####Data

```json
{
  "answer_status": true
}
```

####Success response:
```json
204 No content
```
