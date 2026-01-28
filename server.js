//include the required packages
const express = require('express');
const mysql = require('mysql2/promise');
require('dotenv').config();
const port = 3000;

//database config info
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 100,
  queueLimit: 0,
};
//initialize Express app
const app = express();
//helps app to read JSON
app.use(express.json());


const DEMO_USER = { id: 1, username: "admin", password: "admin123" };

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

//start server
app.listen(port, () => {
  console.log('Server running on port', port);
});

//login authentication
app.post("/login", (rreq, res) => {
  const { username, password } = req.body;

  if (username !== DEMO_USER.username || password !== DEMO_USER.password) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign(
    { userId: DEMO_USER.id, username: DEMO_USER.username },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
  res.json({ token });
});

//Example Route: Get all cards
app.get('/allcards', async (req, res) => {
  try {
    let connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM defaultdb.cards');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error for allcards' });
  }
});

// Route: Add a new card (POST)
app.post('/addcard', async (req, res) => {
  const { card_name, card_pic } = req.body;

  // basic validation
  if (!card_name || !card_pic) {
    return res.status(400).json({ message: 'card_name and card_pic are required' });
  }

  try {
    let connection = await mysql.createConnection(dbConfig);

    // Insert into your table
    const sql = 'INSERT INTO defaultdb.cards (card_name, card_pic) VALUES (?, ?)';
    const [result] = await connection.execute(sql, [card_name, card_pic]);

    // return success + new id
    res.status(201).json({
      message: 'Card added successfully',
      id: result.insertId,
      card_name,
      card_pic
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error for addcard' });
  }
});

// Route: Delete a card by id (DELETE)
app.delete('/deletecard/:id', async (req, res) => {
  const { id } = req.params;

  try {
    let connection = await mysql.createConnection(dbConfig);

    const [result] = await connection.execute(
      'DELETE FROM defaultdb.cards WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: `No card found with id ${id}` });
    }

    res.status(200).json({ message: `Card ${id} deleted successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error for deletecard' });
  }
});

// Route: Update a card by id (PUT)
app.put('/updatecard/:id', async (req, res) => {
  const { id } = req.params;
  const { card_name, card_pic } = req.body;

  if (!card_name || !card_pic) {
    return res.status(400).json({ message: 'card_name and card_pic are required' });
  }

  try {
    let connection = await mysql.createConnection(dbConfig);

    const [result] = await connection.execute(
      'UPDATE defaultdb.cards SET card_name = ?, card_pic = ? WHERE id = ?',
      [card_name, card_pic, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: `No card found with id ${id}` });
    }

    res.status(200).json({
      message: `Card ${id} updated successfully`,
      id,
      card_name,
      card_pic
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error for updatecard' });
  }
});
