
authRouter
POST /signup
POST /login
POST /logout

GET   /profile/view
PATCH /profile/edit
PATCH /profile/password

GET /user/connections
GET /user/requests
GET /feed   

connectionRequestRouter
POST /request/send/ignored/:userid
POST /request/send/rejeceted/:userid

POST /request/review/accepted/:userid
POST /request/review/interested/:userid



status : pending accepted ignored rejected