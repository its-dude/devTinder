
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

# connectionRequestRouter
POST /request/send/:status/:userid
POST /request/review/:status/:requestId

status : pending accepted ignored rejected