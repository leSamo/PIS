const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process?.env?.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//app.use(cors());

let USERS = [{
  username: "ahoj",
  fullname: "David čoko",
  email: "abc@def.com",
  role: "Assistant",
  registered: Date.now(),
  lastActive: Date.now()
},
{
  username: "cau",
  fullname: "Ahoj nazdar",
  email: "wwwwww@def.com",
  role: "Boss",
  registered: Date.now(),
  lastActivity: Date.now()
},
{
  username: "cawko",
  fullname: "Ako sa mas nazdar",
  email: "gdsdffsd@def.com",
  role: "Manager",
  registered: Date.now(),
  lastActivity: Date.now()
},
];

app.get('/allUsers', async (req, res) => {
  return res.status(200).send(USERS);
})

app.post('/removeUser', async (req, res) => {
  console.log("body", req.body);
  const userToDelete = req.body.user;

  let indexToDelete = USERS.findIndex(user => user.username === userToDelete);

  if (indexToDelete !== -1) {
    USERS.splice(indexToDelete, 1);
  }
  
  console.log("Deleted", userToDelete);
  res.sendStatus(200);
})

app.use('/', express.static('./build'));
app.use('/*', express.static('./build'));

app.listen(port, () => console.log(`Listening on port ${port}`));
