# Seeded User Credentials

For testing the authentication API:

**Email:** testuser@example.com  
**Password:** password123

The password hash was generated using bcrypt with 10 rounds:
```
bcrypt.hash('password123', 10)
```

Do NOT use these credentials in production!
