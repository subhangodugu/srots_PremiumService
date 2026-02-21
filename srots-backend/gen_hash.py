import bcrypt

password = b"Test@123"
# Generate a salt and hash the password
hashed = bcrypt.hashpw(password, bcrypt.gensalt())
print(hashed.decode())
