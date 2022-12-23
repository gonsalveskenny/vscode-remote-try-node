const express = require('express');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const { process } = require('ipaddr.js');

const app = express();
const port = process.env.EXPRESSPORT;

app.use(express.json())

const connection = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  port: process.env.PORT,
  database: process.env.DATABASE
});

app.post('/login', (req, res) => {
  // Authenticate the user and generate a JWT
  const token = jwt.sign({ email: req.body.email }, 'secret_key', { expiresIn: '1h' });

  // Send the token back to the client
  res.send({ token });
});

function requireAuth(req, res, next) {
  // Get the token from the headers
  const token = req.headers['x-access-token'];

  // If no token was provided, return a 401 unauthorized response
  if (!token) {
    res.status(401).send('Unauthorized');
    return;
  }

  // Verify the token
  jwt.verify(token, 'secret_key', (error, decoded) => {
    if (error) {
      res.status(401).send('Unauthorized');
      return;
    }

    // If the token is valid, allow the request
    next();
  });
}

app.get('/protected', requireAuth, (req, res) => {
  // This route is protected and can only be accessed by authenticated users
  res.send('Protected resource');
});


app.get('/', (req, res) => {
  connection.query('SELECT * FROM notes', (error, results) => {
    if (error) {
      return res.send(error);
    }
    res.send({ message: 'API service running' });
  });
});

app.get('/notes', (req, res) => {
  connection.query('SELECT * FROM notes', (error, results) => {
    if (error) {
      return res.send(error);
    }
    res.send(results);
  });
});

app.post('/notes', (req, res) => {
  const { title, contents } = req.body;
  connection.query('INSERT INTO notes (title, contents) VALUES (?, ?)', [title, contents], (error, results) => {
    if (error) {
      return res.send(error);
    }
    res.send({ message: 'Note created successfully!' });
  });
});

app.get('/notes/:id', (req, res) => {
  const id = req.params.id;
  connection.query('SELECT * FROM notes WHERE id = ?', [id], (error, results) => {
    if (error) {
      return res.send(error);
    }
    res.send(results[0]);
  });
});

app.put('/notes/:id', (req, res) => {
  const id = req.params.id;
  const { title, contents } = req.body;
  connection.query(
    'UPDATE notes SET title = ?, contents = ? WHERE id = ?',
    [title, contents, id],
    (error, results) => {
      if (error) {
        return res.send(error);
      }
      res.send({ message: 'Note updated successfully!' });
    }
  );
});

app.delete('/notes/:id', (req, res) => {
  const id = req.params.id;
  connection.query('DELETE FROM notes WHERE id = ?', [id], (error, results) => {
    if (error) {
      return res.send(error);
    }
    res.send({ message: 'Note deleted successfully!' });
  });
});

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
