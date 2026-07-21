document.addEventListener('DOMContentLoaded', function() {

  window.showPage = function(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    alert("Page changée vers: " + pageId); // TEST
  }

  const formJoueur = document.getElementById('formJoueur');
  if(formJoueur){
    formJoueur.addEventListener('submit', (e) => {
      e.preventDefault();
      alert("Formulaire envoyé! Ca marche"); // TEST
    });
  }

  const formLogin = document.getElementById('formLogin');
  if(formLogin){
    formLogin.addEventListener('submit', (e) => {
      e.preventDefault();
      if(document.getElementById('adminPass').value === "Koffi2026") {
        showPage('admin');
      } else {
        alert("Mauvais mdp"); // TEST
      }
    });
  }
});

function valider(id){ alert("Valider " + id) }
function supprimer(id){ alert("Supprimer " + id) }
function logout(){ showPage('accueil'); }
