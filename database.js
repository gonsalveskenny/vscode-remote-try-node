const express = require('express');
const mysql = require('mysql2');

const app = express();
const port = 3000;

app.use(express.json())

const connection = mysql.createConnection({
  host: '52.226.222.222',
  user: 'root',
  password: 'password',
  database: 'notes_app'
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
