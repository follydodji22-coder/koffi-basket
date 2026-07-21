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

function showPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if(id==='admin') chargerJoueurs();
}
window.showPage = showPage;

document.getElementById('codePromo').oninput = () => {
  document.getElementById('prix').textContent = (document.getElementById('codePromo').value.toUpperCase()==='KOFFI25'?75:100)+'f';
}

document.getElementById('formJoueur').onsubmit = async (e) => {
  e.preventDefault();
  const f = e.target;
  const prix = f.code_promo.value.toUpperCase()==='KOFFI25'?75:100;
  await db.collection("joueurs").add({
    nom:f.nom.value, nationalite:f.nationalite.value, taille:f.taille.value,
    poids:f.poids.value, poste:f.poste.value, email:f.email.value, whatsapp:f.whatsapp.value,
    photo:"https://i.imgur.com/8Km9tLL.png", prix_paye:prix, statut:"attente", date:new Date()
  });
  alert(`Inscription ok! Envoie ${prix}f au 0162196973`);
  f.reset(); showPage('accueil');
}

window.loginAdmin = () => {
  if(document.getElementById('adminPass').value==='Koffi2026'){ showPage('admin'); }
  else{ alert('Mauvais mot de passe'); }
}
window.logout = () => showPage('accueil');

async function chargerJoueurs(){
  const snap = await db.collection("joueurs").get();
  let html = "";
  snap.forEach(d=>{ const j=d.data(); html+=`<tr><td>${j.nom}</td><td>${j.statut}</td></tr>`; });
  document.getElementById('listeJoueurs').innerHTML = html;
  document.getElementById('statsReelles').innerHTML = `<p>Total: ${snap.size}</p>`;
}

window.publierAnnonce = async () => {
  const msg = prompt("Ton annonce:");
  if(msg){ await db.collection("annonces").add({message:msg, date:new Date()}); alert("Publié"); }
}