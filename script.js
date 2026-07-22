const firebaseConfig = {
  apiKey: "AIzaSyDT6IKXPu8g_hUZn74IIXIFFsb9NADNQtw",
  authDomain: "koffi-basket-2026.firebaseapp.com",
  projectId: "koffi-basket-2026",
  storageBucket: "koffi-basket-2026.firebasestorage.app",
  messagingSenderId: "1001801483627",
  appId: "1:1001801483627:web:7967fff930e50022b5382e"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
let joueurConnecte = null;

function showPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if(id==='admin'){ chargerJoueurs().catch(e=>console.log(e)); chargerEquipes().catch(e=>console.log(e)); }
  if(id==='actualites') chargerAnnonces().catch(e=>console.log(e));
}

// PRIX DYNAMIQUE
document.getElementById('codePromo').oninput = (e) => {
  document.getElementById('prix').textContent = e.target.value.toUpperCase()==='KOFFI25'? '75f' : '100f';
}

// INSCRIPTION
document.getElementById('formJoueur').onsubmit = async (e) => {
  e.preventDefault(); const f = e.target;
  const prix = f.code_promo.value.toUpperCase()==='KOFFI25'?75:100;
  let photoUrl = "";
  const photoFile = document.getElementById('photoJoueur').files[0];
  if(photoFile){
    const formData = new FormData();
    formData.append("image", photoFile);
    const res = await fetch("https://api.imgbb.com/1/upload?key=TA_CLE_IMGBB_ICI", { method: "POST", body: formData });
    const data = await res.json();
    photoUrl = data.data.url;
  }
  await db.collection("joueurs").add({
    nom:f.nom.value, nationalite:f.nationalite.value, taille:f.taille.value, poids:f.poids.value, poste:f.poste.value,
    email:f.email.value, whatsapp:f.whatsapp.value, mot_de_passe: f.mot_de_passe.value, photo: photoUrl,
    prix_paye:prix, statut:"attente", date:new Date()
  });
  alert(`Inscription ok! Envoie ${prix}f au 0162196973.`); f.reset(); showPage('accueil');
}

// CONNEXION JOUEUR
window.loginJoueur = async () => {
  const email = document.getElementById('loginEmail').value;
  const pass = document.getElementById('loginPass').value;
  const snap = await db.collection("joueurs").where("email","==",email).where("mot_de_passe","==",pass).get();
  if(snap.size > 0){
    joueurConnecte = snap.docs[0].data();
    if(joueurConnecte.statut === "attente"){ alert("En attente de validation"); showPage('accueil'); return; }
    if(joueurConnecte.statut === "approuve"){
      document.getElementById('bienvenueJoueur').textContent = "Bienvenue " + joueurConnecte.nom;
      if(document.getElementById('photoProfil')){ // <-- SECURITE
        document.getElementById('photoProfil').src = joueurConnecte.photo || 'https://i.imgur.com/default.png';
      }
      showPage('espace-joueur');
      chargerNotifications();
      setInterval(chargerNotifications, 5000);
    }
    if(joueurConnecte.statut === "refuse"){ alert("Inscription refusée"); }
  } else { alert("Mauvais email ou mot de passe"); }
}

// CONNEXION ADMIN
window.loginAdmin = () => {
  const pass = document.getElementById('adminPass').value;
  if(pass === "admin123"){
    showPage('admin');
  } else {
    alert("Mauvais mot de passe admin");
  }
}
window.logout = () => showPage('accueil');
window.logoutJoueur = () => { joueurConnecte = null; showPage('accueil'); }

// ADMIN : CHARGER JOUEURS
async function chargerJoueurs(){
  const snap = await db.collection("joueurs").where("statut","==","attente").get();
  let html = "";
  snap.forEach(d=>{
    const j = d.data();
    html+=`<tr><td>${j.nom}</td><td>${j.email}</td><td>${j.prix_paye}f</td>
    <td><button onclick="approuver('${d.id}')">Approuver</button> <button onclick="refuser('${d.id}')">Refuser</button></td></tr>`;
  });
  document.getElementById('listeJoueurs').innerHTML = html || "<tr><td colspan=4>Aucun joueur</td></tr>";
}
window.approuver = async (id) => {
  const joueur = await db.collection("joueurs").doc(id).get();
  await db.collection("joueurs").doc(id).update({statut:"approuve"});
  await db.collection("notifications").add({ pour: joueur.data().email, message: "Félicitations! Ton inscription KOFFI BASKET a été approuvée ✅", lu: false, date: new Date() });
  alert("Joueur approuvé"); chargerJoueurs();
}
window.refuser = async (id) => { await db.collection("joueurs").doc(id).update({statut:"refuse"}); alert("Refusé"); chargerJoueurs(); }

// ADMIN : CHARGER EQUIPES
async function chargerEquipes(){
  const snap = await db.collection("equipes").where("statut","==","attente").get();
  let html = "";
  snap.forEach(d=>{
    const eq = d.data();
    html += `<div style="background:#222; padding:10px; margin:10px 0;">
      <b>${eq.nom}</b> <br> Capitaine: ${eq.capitaine} <br> Membres: ${eq.membres.join(', ')} <br>
