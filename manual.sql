-- SELECT * FROM signatures;
-- SELECT * FROM users;
-- SELECT COUNT (*) FROM signatures
-- SELECT (first,last) FROM signatures;
-- DELETE FROM signatures;

SELECT signature FROM signatures WHERE id = 3;
-- SELECT * FROM users WHERE email=`timjim@mail.com`;
-- SELECT password, id FROM users WHERE email=`smithy@mail.com`;

-- SELECT users.first, users.last, users.email, user_profiles.age, user_profiles.city, user_profiles.url
--                 FROM users
--                 JOIN user_profiles ON users.id = user_profiles.user_id
--                 WHERE users.id = 11;
