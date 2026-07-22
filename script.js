const firebaseConfig = { apiKey: "AIzaSyDT6IKXPu8g_hUZn74IIXIFFsb9NADNQtw", authDomain: "koffi-basket-2026.firebaseapp.com", projectId: "koffi-basket-2026", storageBucket: "koffi-basket-2026.firebasestorage.app", messagingSenderId: "1001801483627", appId: "1:1001801483627:web:7967fff930e50022b5382e" };
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
let joueurConnecte = null;

function showPage(id){
  try{
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    if(id==='admin'){
      document.getElementById('listeJoueurs').innerHTML = "<tr><td>Chargement...</td></tr>";
      chargerJoueurs();
      chargerEquipes();
    }
    if(id==='actualites') chargerAnnonces();
  }catch(e){ console.log("Erreur showPage: ",e) }
}

// TOUT LE CODE QUI TOUCHE AU HTML VA ICI
window.onload = function(){

  // PRIX DYNAMIQUE
  if(document.getElementById('codePromo')){
    document.getElementById('codePromo').oninput = (e) => {
      document.getElementById('prix').textContent = e.target.value.toUpperCase()==='KOFFI25'? '75f' : '100f';
    }
  }

  // INSCRIPTION
  if(document.getElementById('formJoueur')){
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
      await db.collection("joueurs").add({ nom:f.nom.value, nationalite:f.nationalite.value, taille:f.taille.value, poids:f.poids.value, poste:f.poste.value, email:f.email.value, whatsapp:f.whatsapp.value, mot_de_passe: f.mot_de_passe.value, photo: photoUrl, prix_paye:prix, statut:"attente", date:new Date() });
      alert(`Inscription ok! Envoie ${prix}f au 0162196973.`); f.reset(); showPage('accueil');
    }
  }

  // PUBLICATION
  if(document.getElementById('formPublication')){
    document.getElementById('formPublication').onsubmit = async (e) => {
      e.preventDefault();
      const file = document.getElementById('imagePub').files[0];
      let imageUrl = "";
      if(file){
        const formData = new FormData();
        formData.append("image", file);
        const res = await fetch("https://api.imgbb.com/1/upload?key=TA_CLE_IMGBB_ICI", { method: "POST", body: formData });
        const data = await res.json();
        imageUrl = data.data.url;
      }
      await db.collection("annonces").add({ categorie: document.getElementById('categoriePub').value, titre: document.getElementById('titrePub').value, message: document.getElementById('messagePub').value, image: imageUrl, date: new Date() });
      alert("Publié"); document.getElementById('formPublication').reset(); showPage('admin');
    }
  }
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
      if(document.getElementById('photoProfil')){ document.getElementById('photoProfil').src = joueurConnecte.photo || 'https://i.imgur.com/default.png'; }
      showPage('espace-joueur');
      chargerNotifications();
      setInterval(chargerNotifications, 5000);
    }
    if(joueurConnecte.statut === "refuse"){ alert("Inscription refusée"); }
  } else { alert("Mauvais email ou mot de passe"); }
}

// CONNEXION ADMIN
window.loginAdmin = function(){
  var pass = document.getElementById('adminPass').value;
  if(pass == "admin123"){
    showPage('admin');
  } else {
    alert("Mauvais mot de passe admin");
  }
}

window.logout = function(){ showPage('accueil'); }
window.logoutJoueur = function(){ joueurConnecte = null; showPage('accueil'); }

async function chargerJoueurs(){
  try{
    const snap = await db.collection("joueurs").get();
    let html = "";
    snap.forEach(d=>{ const j = d.data(); if(j.statut == "attente"){ html+=`<tr><td>${j.nom}</td><td>${j.email}</td><td>${j.prix_paye}f</td> <td><button onclick="approuver('${d.id}')">Approuver</button> <button onclick="refuser('${d.id}')">Refuser</button></td></tr>`; } });
    document.getElementById('listeJoueurs').innerHTML = html || "<tr><td colspan=4>Aucun joueur en attente</td></tr>";
  }catch(e){ document.getElementById('listeJoueurs').innerHTML = "<tr><td>Erreur</td></tr>"; }
}

window.approuver = async (id) => {
  const joueur = await db.collection("joueurs").doc(id).get();
  await db.collection("joueurs").doc(id).update({statut:"approuve"});
  await db.collection("notifications").add({ pour: joueur.data().email, message: "Félicitations! Ton inscription KOFFI BASKET a été approuvée ✅", lu: false, date: new Date() });
  alert("Joueur approuvé"); chargerJoueurs();
}
window.refuser = async (id) => { await db.collection("joueurs").doc(id).update({statut:"refuse"}); alert("Refusé"); chargerJoueurs(); }

async function chargerEquipes(){
  try{
    const snap = await db.collection("equipes").get();
    let html = "";
    snap.forEach(d=>{ const eq = d.data(); if(eq.statut == "attente"){ html += `<div style="background:#222; padding:10px; margin:10px 0;"> <b>${eq.nom}</b> <br> Capitaine: ${eq.capitaine} <br> Membres: ${eq.membres.join(', ')} <br> <button onclick="approuverEquipe('${d.id}')">Approuver</button> </div>`; } });
    document.getElementById('listeEquipes').innerHTML = html || "<p>Aucune équipe en attente</p>";
  }catch(e){ document.getElementById('listeEquipes').innerHTML = "<p>Erreur</p>"; }
}
window.approuverEquipe = async (id) => { await db.collection("equipes").doc(id).update({statut:"approuve"}); alert("Equipe approuvée"); chargerEquipes(); }

window.soumettreEquipe = async () => {
  const nom = document.getElementById('nomEquipe').value;
  const membres = [...document.querySelectorAll('.membre')].map(i=>i.value).filter(v=>v);
  await db.collection("equipes").add({ nom, capitaine: joueurConnecte.email, membres, statut:"attente" });
  alert("Equipe envoyée à l'admin"); showPage('espace-joueur');
}

async function chargerAnnonces(){
  const snap = await db.collection("annonces").get();
  let html = "";
  snap.forEach(d=>{ const a = d.data(); html+=`<div style="background:#222; padding:15px; margin:10px 0; border-radius:10px;"> <b>[${a.categorie}] ${a.titre}</b> ${a.image? `<img src="${a.image}" style="width:100%; border-radius:8px; margin:10px 0;">` : ''} <p>${a.message}</p> </div>`; });
  document.getElementById('listeAnnonces').innerHTML = html || "Aucune annonce";
}

async function chargerNotifications(){
  if(!joueurConnecte) return;
  const snap = await db.collection("notifications").where("pour","==",joueurConnecte.email).where("lu","==",false).get();
  if(snap.size > 0 && document.getElementById('notifBox')){
    document.getElementById('notifBox').style.display = 'block';
    document.getElementById('nbNotif').textContent = snap.size;
  }
}
window.voirNotifications = async () => {
  const snap = await db.collection("notifications").where("pour","==",joueurConnecte.email).where("lu","==",false).get();
  let texte = "";
  snap.forEach(d => { texte += "🔔 " + d.data().message + "\n\n"; d.ref.update({lu:true}); });
  alert(texte);
  document.getElementById('notifBox').style.display = 'none';
        }
