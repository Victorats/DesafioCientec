const db = require('../db');

class CitizenRepository {
  addCitizen(citizen) {
    const { nome, cpf } = citizen;
    const sql = `INSERT INTO citizens (nome, cpf) VALUES (?, ?)`;
    return new Promise((resolve, reject) => {
      db.run(sql, [nome, cpf], function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID, nome, cpf });
      });
    });
  }

  findCitizenByCPF(cpf) {
    const sql = `SELECT * FROM citizens WHERE cpf = ?`;
    return new Promise((resolve, reject) => {
      db.get(sql, [cpf], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  }

  findCitizenByName(nome) {
    const sql = `SELECT * FROM citizens WHERE LOWER(nome) LIKE LOWER(?)`;
    return new Promise((resolve, reject) => {
      db.all(sql, [`%${nome}%`], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }
}

module.exports = new CitizenRepository();
