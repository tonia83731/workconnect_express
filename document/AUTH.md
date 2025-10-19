


- BASE_URL=
- BASE_TEST_URL= http:localhost:8080

### 註冊會員
POST `{{BASE_URL}}/auth/register`
- Request
```
{
    "firstname": "Test",
    "lastname": "Admin",
    "email": "test.a@example.com",
    "password": "1234"
}
```
- Response
```
{
    "OK": true
}
```


---

### 登入會員
POST `{{BASE_URL}}/auth/login`
- Request
```
{
    "email": "test.a@example.com",
    "password": "1234"
}
```
- Response
```
{
    "success": true,
    "data": {
        "id": "68f345bcde1431e148bfbdb1",
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OGYzNDViY2RlMTQzMWUxNDhiZmJkYjEiLCJlbWFpbCI6InRlc3QuYUBleGFtcGxlLmNvbSIsInBsYXRmb3JtTW9kZSI6ImxpZ2h0IiwiaWF0IjoxNzYwNzczNjAzLCJleHAiOjE3NjA4MDk2MDN9.LU0d6lUiBJkPcKJHDgUogVuarl6Zo-cedfNqPmqoflQ"
    }
}
```

