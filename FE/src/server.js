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
  isUserAdmin: true
},
{
  username: "cau",
  fullname: "Ahoj nazdar",
  email: "wwwwww@def.com",
  role: "Boss",
  registered: Date.now(),
  isUserAdmin: false
},
{
  username: "cawko",
  fullname: "Ako sa mas nazdar",
  email: "gdsdffsd@def.com",
  role: "Manager",
  registered: Date.now(),
  isUserAdmin: false
}];

let EVENTS = [];

app.get('/allUsers', async (req, res) => {
  res.status(200).send(USERS);
});

app.get('/allUserNames', async (req, res) => {
  res.status(200).send(USERS.map(user => ({username: user.username, fullname: user.fullname })));
});

app.get('/allEvents', async (req, res) => {
  res.status(200).send(EVENTS);
});

app.post('/login', async (req, res) => {
  console.log(req.body);

  const { username, password } = req.body;

  const user = USERS.find(u => u.username === username);

  if (user === undefined) {
    return res.status(400).send("Invalid user name.");
  }
  else {
    if (password === "123") {
      return res.status(200).send({ username, role: user.role });
    }
    else {
      return res.status(400).send("Invalid password.");
    }
  }
});

app.post('/addUser', async (req, res) => {
  const { username, fullname, email, role } = req.body.user;
  const registered = Date.now();

  USERS.push({ username, fullname, email, role, registered });

  res.sendStatus(200);
});

app.post('/removeUser', async (req, res) => {
  const userToDelete = req.body.user;

  let indexToDelete = USERS.findIndex(user => user.username === userToDelete);

  if (indexToDelete !== -1) {
    USERS.splice(indexToDelete, 1);
  }
  
  console.log("Deleted", userToDelete);
  res.sendStatus(200);
})

app.post('/createEvent', async (req, res) => {
  const { title, description, from, to } = req.body;

  EVENTS.push({ title, description, from, to })

  res.sendStatus(200);
})

app.use('/', express.static('./build'));
app.use('/*', express.static('./build'));

app.listen(port, () => console.log(`Listening on port ${port}`));
