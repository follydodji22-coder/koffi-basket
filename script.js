const firebaseConfig = {
  apiKey: "AIzaSyDT6IKXPu8g_hUZn74IIXIFFsb9NADNQtw",
  authDomain: "koffi-basket-2026.firebaseapp.com",
  projectId: "koffi-basket-2026",
  storageBucket: "koffi-basket-2026.firebasestorage.app",
  messagingSenderId: "1001801483627",
  appId: "1:1001801483627:web:7967fff930e50022b5382e"
};

// Initialiser Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

const ADMIN_PASSWORD = "Koffi2026"; // Change ce mot de passe

// Attendre que la page charge
document.addEventListener('DOMContentLoaded', function() {

  // FONCTION POUR CHANGER DE PAGE
  window.showPage = function(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    if(pageId === 'admin') chargerJoueurs(); // charge les vrais joueurs
  }

  // PRIX DYNAMIQUE AVEC CODE PROMO
  const codePromo = document.getElementById('codePromo');
  if(codePromo){
    codePromo.addEventListener('input', () => {
      const prix = codePromo.value.toUpperCase() === 'KOFFI25'? 75 : 100;
      document.getElementById('prix').textContent = prix + 'f';
    });
  }

  // 2. INSCRIPTION VERS FIREBASE
  const formJoueur = document.getElementById('formJoueur');
  if(formJoueur){
    formJoueur.addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target;
      const photoFile = form.photo.files[0];
      if(!photoFile){ alert("Ajoute une photo stp"); return; }

      alert("Envoi en cours... ne quitte pas la page");

      try {
        // Upload photo
        const photoRef = storage.ref('joueurs/' + Date.now() + '-' + photoFile.name);
        const snapshot = await photoRef.put(photoFile);
        const photoURL = await snapshot.ref.getDownloadURL();

        const prix = form.code_promo.value.toUpperCase() === 'KOFFI25'? 75 : 100;

        // Ajout dans Firestore
        await db.collection("joueurs").add({
          nom: form.nom.value,
          nationalite: form.nationalite.value,
          taille: form.taille.value,
          poids: form.poids.value,
          poste: form.poste.value,
          email: form.email.value,
          whatsapp: form.whatsapp.value,
          photo: photoURL,
          prix_paye: prix,
          statut: "attente",
          date: new Date()
        });

        alert(`Inscription reçue! Envoie ${prix}f au 0162196973 avec ton nom`);
        form.reset();
        document.getElementById('prix').textContent = '100f';
        showPage('accueil');

      } catch(error) {
        alert("Erreur: " + error.message);
        console.log(error);
      }
    });
  }

  // 3. LOGIN ADMIN
  const formLogin = document.getElementById('formLogin');
  if(formLogin){
    formLogin.addEventListener('submit', (e) => {
      e.preventDefault();
      if(document.getElementById('adminPass').value === ADMIN_PASSWORD) {
        document.getElementById('errorLogin').style.display = 'none';
        showPage('admin');
      } else {
        document.getElementById('errorLogin').style.display = 'block';
      }
    });
  }
});

// 4. CHARGER LES VRAIS JOUEURS DEPUIS FIREBASE
async function chargerJoueurs() {
  const snapshot = await db.collection("joueurs").orderBy("date", "desc").get();
  const tbody = document.getElementById('listeJoueurs');
  tbody.innerHTML = "";
  let total = 0, attente = 0;

  snapshot.forEach(doc => {
    const j = doc.data();
    total++;
    if(j.statut === 'attente') attente++;
    tbody.innerHTML += `
      <tr>
        <td><img src="${j.photo}" class="avatar"></td>
        <td>${j.nom}</td>
        <td>${j.poste}</td>
        <td>${j.taille}cm</td>
        <td>${j.whatsapp}</td>
        <td><span class="badge ${j.statut}">${j.statut}</span></td>
        <td>
          <button onclick="valider('${doc.id}')" class="btn-mini">Valider</button>
          <button onclick="supprimer('${doc.id}')" class="btn-mini danger">Supprimer</button>
          <a href="https://wa.me/229${j.whatsapp}" target="_blank" class="btn-mini whatsapp">WhatsApp</a>
        </td>
      </tr>`;
  });

  // Affiche les vrais stats
  document.getElementById('statsReelles').innerHTML = `
    <div class="stat-card"><h3>Joueurs inscrits</h3><p>${total}</p></div>
    <div class="stat-card"><h3>En attente paiement</h3><p>${attente}</p></div>
  `;
}

// 5. VALIDER UN JOUEUR
window.valider = async function(id) {
  await db.collection("joueurs").doc(id).update({statut: "valide"});
  chargerJoueurs();
}

// 6. SUPPRIMER UN JOUEUR
window.supprimer = async function(id) {
  if(confirm("Tu es sûr de vouloir supprimer ce joueur?")) {
    await db.collection("joueurs").doc(id).delete();
    chargerJoueurs();
  }
}

// 7. DECONNEXION
window.logout = function() { showPage('accueil'); }
