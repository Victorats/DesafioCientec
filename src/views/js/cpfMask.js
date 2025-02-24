document.addEventListener("DOMContentLoaded", function() {
    const cpfInput = document.getElementById('cpf');
    const form = document.querySelector('form');
  
    
    cpfInput.addEventListener('input', function() {
      let value = cpfInput.value.replace(/\D/g, '');
      
      if (value.length > 11) {
        value = value.slice(0, 11);
      }
      
      //aplica a formatação: 000.000.000-00
      if (value.length > 9) {
        value = value.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, '$1.$2.$3-$4');
      } else if (value.length > 6) {
        value = value.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
      } else if (value.length > 3) {
        value = value.replace(/(\d{3})(\d+)/, '$1.$2');
      }
      
      cpfInput.value = value;
    });
  
    //antes de submeter, remove a formatação para enviar somente os números
    form.addEventListener('submit', function() {
      cpfInput.value = cpfInput.value.replace(/\D/g, '');
    });
  });
  