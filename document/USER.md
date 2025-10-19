
- BASE_URL=
- BASE_TEST_URL= http:localhost:8080

**Header -> KEY: Authorization, VALUE: JWT -> KEY: Authorization, VALUE: JWT**

### 取得會員資料
headers: Bearer 
GET http://localhost:8080/user/:userId
```
{
    "OK": true,
    "user": {
        "_id": "68f345bcde1431e148bfbdb1",
        "firstname": "Test",
        "lastname": "Admin",
        "email": "test.a@example.com",
        "platformMode": "light",
        "createdAt": "2025-10-18T07:46:04.764Z",
        "updatedAt": "2025-10-18T07:46:04.764Z",
        "__v": 0
    }
}
```

PUT http://localhost:8080/user/:userId

POST http://localhost:8080/user/:userId/workspace/:account


PATCH http://localhost:8080/user/:userId/password

PATCH http://localhost:8080/user/:userId/platform-mode

DELETE http://localhost:8080/user/:userId

GET http://localhost:8080/user/:userId/workspace

POST http://localhost:8080/user/:userId/workspace