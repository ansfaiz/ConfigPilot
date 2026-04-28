
const db = require('../config/db');

async function getRecords(req, res) {
  const { module: mod } = req.query;
  try {
    let query = 'SELECT * FROM records WHERE user_id=$1';
    const params = [req.user.id];
    if (mod) {
      query += ' AND module=$2';
      params.push(mod);
    }
    query += ' ORDER BY created_at DESC';
    const result = await db.query(query, params);
    res.json({ records: result.rows });
  } catch (err) {
    console.error('getRecords:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

async function createRecord(req, res) {
  const { module: mod, data } = req.body;
  if (!mod || !data) {
    return res.status(400).json({ error: 'module and data are required' });
  }
  try {
    const result = await db.query(
      'INSERT INTO records (user_id, module, data) VALUES ($1,$2,$3) RETURNING *',
      [req.user.id, mod, JSON.stringify(data)]
    );
    res.status(201).json({ record: result.rows[0] });
  } catch (err) {
    console.error('createRecord:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

async function updateRecord(req, res) {
  const { id } = req.params;
  const { data } = req.body;
  if (!data) return res.status(400).json({ error: 'data is required' });
  try {
    const result = await db.query(
      'UPDATE records SET data=$1 WHERE id=$2 AND user_id=$3 RETURNING *',
      [JSON.stringify(data), id, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Record not found' });
    res.json({ record: result.rows[0] });
  } catch (err) {
    console.error('updateRecord:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

async function deleteRecord(req, res) {
  const { id } = req.params;
  try {
    const result = await db.query(
      'DELETE FROM records WHERE id=$1 AND user_id=$2 RETURNING id',
      [id, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Record not found' });
    res.json({ deleted: id });
  } catch (err) {
    console.error('deleteRecord:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { getRecords, createRecord, updateRecord, deleteRecord };
