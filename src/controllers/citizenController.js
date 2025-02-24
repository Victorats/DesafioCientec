const Citizen = require('../models/citizen');

class CitizenController {
  // Construtor que recebe as dependências
  constructor(citizenRepository, cpfValidator) {
    this.citizenRepository = citizenRepository;
    this.cpfValidator = cpfValidator;
  }

  async addCitizen(nome, cpf) {
    if (!this.cpfValidator.isValid(cpf)) {
      throw new Error('CPF inválido');
    }

    const existingCitizen = await this.citizenRepository.findCitizenByCPF(cpf);
    if (existingCitizen) {
      throw new Error('Cidadão já cadastrado');
    }

    const citizen = new Citizen(nome, cpf);
    const insertedCitizen = await this.citizenRepository.addCitizen(citizen);
    return {
      success: true,
      message: 'Cidadão cadastrado com sucesso',
      citizen: insertedCitizen
    };
  }

  async findCitizenByCPF(cpf) {
    return await this.citizenRepository.findCitizenByCPF(cpf);
  }

  async findCitizenByName(nome) {
    return await this.citizenRepository.findCitizenByName(nome);
  }
}

module.exports = CitizenController;
