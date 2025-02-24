const db = require('../db');

class CitizenRepository {
  addCitizen(citizen, callback) {
    const { nome, cpf } = citizen;
    const sql = `INSERT INTO citizens (nome, cpf) VALUES (?, ?)`;
    db.run(sql, [nome, cpf], function(err) {
      if (err) {
        callback(err);
      } else {
        callback(null, { id: this.lastID, nome, cpf });
      }
    });
  }

  findCitizenByCPF(cpf, callback) {
    const sql = `SELECT * FROM citizens WHERE cpf = ?`;
    db.get(sql, [cpf], (err, row) => {
      if (err) {
        callback(err);
      } else {
        callback(null, row);
      }
    });
  }

  findCitizenByName(nome, callback) {
    const sql = `SELECT * FROM citizens WHERE LOWER(nome) LIKE LOWER(?)`;
    db.all(sql, [`%${nome}%`], (err, rows) => {
      if (err) {
        callback(err);
      } else {
        callback(null, rows);
      }
    });
  }
}

module.exports = new CitizenRepository();
