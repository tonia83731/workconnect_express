

- BASE_URL=
- BASE_TEST_URL= http:localhost:8080


GET http://localhost:8080/workspace/:account

DELETE http://localhost:8080/workspace/admin/:account/:userId

PATCH http://localhost:8080/workspace/admin/:account/:userId/member-status

PATCH http://localhost:8080/workspace/admin/:account/title

PATCH http://localhost:8080/workspace/admin/:account/slack-url

DELETE http://localhost:8080/workspace/admin/:account