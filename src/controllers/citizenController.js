const Citizen = require('../models/citizen');
const CPFValidator = require('../utils/cpfValidator');
const citizenRepository = require('../repositories/citizenRepository');

class CitizenController {
  addCitizen(nome, cpf, callback) {
    
    if (!CPFValidator.isValid(cpf)) {
      return callback({ message: 'CPF inválido', success: false });
    }

    //verifica se ja exsite
    citizenRepository.findCitizenByCPF(cpf, (err, existingCitizen) => {
      if (err) {
        return callback({ message: 'Erro ao verificar cidadão existente', success: false });
      }
      if (existingCitizen) {
        return callback({ message: 'Cidadão já cadastrado', success: false });
      }

      //cria um novo e adiciona no bd
      const citizen = new Citizen(nome, cpf);

      
      citizenRepository.addCitizen(citizen, (err, insertedCitizen) => {
        if (err) {
          return callback({ message: 'Erro ao cadastrar cidadão', success: false });
        }
        return callback(null, { success: true, message: 'Cidadão cadastrado com sucesso', citizen: insertedCitizen });
      });
    });
  }

  findCitizenByCPF(cpf, callback) {
    citizenRepository.findCitizenByCPF(cpf, callback);
  }

  findCitizenByName(nome, callback) {
    citizenRepository.findCitizenByName(nome, callback);
  }
}

module.exports = new CitizenController();