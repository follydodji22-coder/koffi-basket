const firebaseConfig = {... ta config... };
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let joueurConnecte = null;

function showPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if(id==='admin'){ chargerJoueurs(); chargerEquipes(); }
  if(id==='actualites') chargerAnnonces();
}

// INSCRIPTION
document.getElementById('formJoueur').onsubmit = async (e) => {
  e.preventDefault(); const f = e.target;
  const prix = f.code_promo.value.toUpperCase()==='KOFFI25'?75:100;
  await db.collection("joueurs").add({
    nom:f.nom.value, email:f.email.value, whatsapp:f.whatsapp.value,
    mot_de_passe: f.mot_de_passe.value, prix_paye:prix, statut:"attente", date:new Date()
  });
  alert(`Inscription ok! Envoie ${prix}f au 0162196973.`); f.reset(); showPage('accueil');
}

// CONNEXION
window.loginJoueur = async () => {
  const email = document.getElementById('loginEmail').value;
  const pass = document.getElementById('loginPass').value;
  const snap = await db.collection("joueurs").where("email","==",email).where("mot_de_passe","==",pass).get();
  if(snap.size > 0){
    joueurConnecte = snap.docs[0].data();
    if(joueurConnecte.statut === "attente"){ alert("En attente de validation"); showPage('accueil'); return; }
    if(joueurConnecte.statut === "approuve"){ document.getElementById('bienvenueJoueur').textContent = "Bienvenue " + joueurConnecte.nom; showPage('espace-joueur'); }
  } else { alert("Mauvais email ou mot de passe"); }
    }
