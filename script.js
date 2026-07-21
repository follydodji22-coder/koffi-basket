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
const ADMIN_PASSWORD = "Koffi2026"; 

// VARIABLES GLOBALES
let chargerJoueurs; // on déclare ici pour que les boutons y aient accès

// ATTENDRE QUE LA PAGE CHARGE
document.addEventListener('DOMContentLoaded', function() { 
  
  // CHANGER DE PAGE
  window.showPage = function(pageId) { 
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active')); 
    document.getElementById(pageId).classList.add('active'); 
    if(pageId === 'admin') chargerJoueurs(); 
  } 

  // PRIX DYNAMIQUE
  const codePromo = document.getElementById('codePromo'); 
  if(codePromo){ 
    codePromo.addEventListener('input', () => { 
      const prix = codePromo.value.toUpperCase() === 'KOFFI25'? 75 : 100; 
      document.getElementById('prix').textContent = prix + 'f'; 
    }); 
  } 

  // INSCRIPTION SANS PHOTO
  const formJoueur = document.getElementById('formJoueur'); 
  if(formJoueur){ 
    formJoueur.addEventListener('submit', async (e) => { 
      e.preventDefault(); 
      const form = e.target; 
      const prix = form.code_promo.value.toUpperCase() === 'KOFFI25'? 75 : 100;

      try {
        await db.collection("joueurs").add({
          nom: form.nom.value, nationalite: form.nationalite.value, taille: form.taille.value,
          poids: form.poids.value, poste: form.poste.value, email: form.email.value,
          whatsapp: form.whatsapp.value, 
          photo: "https://i.imgur.com/8Km9tLL.png",
          prix_paye: prix, statut: "attente", date: new Date()
        });

        alert(`Inscription reçue! ✅ \n\nEnvoie ${prix}f au 0162196973 avec ton nom`);
        form.reset();
        document.getElementById('prix').textContent = '100f';
        showPage('accueil');

      } catch(error) { 
        alert("Erreur: " + error.message); 
      } 
    }); 
  }

  // LOGIN ADMIN
  window.loginAdmin = function() {
    const pwd = document.getElementById('adminPass').value;
    if(pwd === ADMIN_PASSWORD) { 
      showPage('admin'); 
    } else { 
      alert('Mauvais mot de passe'); 
    }
  }

  // LOGOUT
  window.logout = function() {
    showPage('accueil');
  }

}); // FIN DU DOMContentLoaded

// ========== FONCTIONS GLOBALES POUR LES BOUTONS ==========

// CHARGER JOUEURS
chargerJoueurs = async function() {
  const snapshot = await db.collection("joueurs").orderBy("date", "desc").get();
  const tbody = document.getElementById('listeJoueurs');
  const stats = document.getElementById('statsReelles');
  if(!tbody) return;
  tbody.innerHTML = "";
  let total = 0, valides = 0;
  snapshot.forEach(doc => {
    const j = doc.data();
    total++;
    if(j.statut === "valide") valides++;
    tbody.innerHTML += `
      <tr>
        <td><img src="${j.photo}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;"></td>
        <td>${j.nom}</td>
        <td>${j.poste}</td>
        <td>${j.taille}cm</td>
        <td>${j.whatsapp}</td>
        <td><span style="color:${j.statut==='valide'?'var(--vert)':'orange'}">${j.statut}</span></td>
        <td>
          ${j.statut === "attente"? `<button class="btn-mini success" onclick="validerJoueur('${doc.id}')">Valider</button>` : ''}
          <button class="btn-mini danger" onclick="supprimerJoueur('${doc.id}')">Suppr</button>
        </td>
      </tr>`;
  });
  if(stats) stats.innerHTML = `<div class="stat-card"><h3>${total}</h3><p>Inscrits</p></div><div class="stat-card"><h3>${valides}</h3><p>Validés</p></div>`;
}

// VALIDER JOUEUR
window.validerJoueur = async function(id){
  await db.collection("joueurs").doc(id).update({statut: "valide"});
  chargerJoueurs();
}

// SUPPRIMER JOUEUR
window.supprimerJoueur = async function(id){
  if(confirm("Supprimer ce joueur ?")) {
    await db.collection("joueurs").doc(id).delete();
    chargerJoueurs();
  }
    }  if(formJoueur){ 
    formJoueur.addEventListener('submit', async (e) => { 
      e.preventDefault(); 
      const form = e.target; 

      const prix = form.code_promo.value.toUpperCase() === 'KOFFI25'? 75 : 100;

      try {
        await db.collection("joueurs").add({
          nom: form.nom.value, 
          nationalite: form.nationalite.value, 
          taille: form.taille.value,
          poids: form.poids.value, 
          poste: form.poste.value, 
          email: form.email.value,
          whatsapp: form.whatsapp.value, 
          photo: "https://i.imgur.com/8Km9tLL.png", // Photo par défaut
          prix_paye: prix,
          statut: "attente", 
          date: new Date()
        });

        alert(`Inscription reçue! ✅ \n\nEnvoie ${prix}f au 0162196973 avec ton nom`);
        form.reset();
        document.getElementById('prix').textContent = '100f';
        showPage('accueil');

      } catch(error) { 
        alert("Erreur: " + error.message); 
        console.log(error);
      } 
    }); 
  }

  // CHARGER JOUEURS POUR ADMIN
  async function chargerJoueurs() {
    const snapshot = await db.collection("joueurs").orderBy("date", "desc").get();
    const tbody = document.getElementById('listeJoueurs');
    const stats = document.getElementById('statsReelles');
    tbody.innerHTML = "";
    let total = 0, valides = 0;
    snapshot.forEach(doc => {
      const j = doc.data();
      total++;
      if(j.statut === "valide") valides++;
      tbody.innerHTML += `
        <tr>
          <td><img src="${j.photo}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;"></td>
          <td>${j.nom}</td>
          <td>${j.poste}</td>
          <td>${j.taille}cm</td>
          <td>${j.whatsapp}</td>
          <td>${j.statut}</td>
          <td>
            ${j.statut === "attente"? `<button class="btn-mini success" onclick="validerJoueur('${doc.id}')">Valider</button>` : ''}
            <button class="btn-mini danger" onclick="supprimerJoueur('${doc.id}')">Suppr</button>
          </td>
        </tr>`;
    });
    stats.innerHTML = `<div class="stat-card"><h3>${total}</h3><p>Joueurs inscrits</p></div><div class="stat-card"><h3>${valides}</h3><p>Validés</p></div>`;
  }

  // VALIDER JOUEUR
  window.validerJoueur = async function(id){
    await db.collection("joueurs").doc(id).update({statut: "valide"});
    chargerJoueurs();
  }

  // SUPPRIMER JOUEUR
  window.supprimerJoueur = async function(id){
    if(confirm("Supprimer ce joueur ?")) {
      await db.collection("joueurs").doc(id).delete();
      chargerJoueurs();
    }
  }

  // LOGIN ADMIN
  window.loginAdmin = function() {
    const pwd = document.getElementById('adminPass').value;
    if(pwd === ADMIN_PASSWORD) { 
      showPage('admin'); 
    } else { 
      alert('Mauvais mot de passe'); 
    }
  }

  // LOGOUT
  window.logout = function() {
    showPage('accueil');
  }

});
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
// CHARGER LES ARTICLES
async function chargerArticles() {
  const snapshot = await db.collection("articles").orderBy("date", "desc").get();
  const container = document.getElementById('listeArticles');
  if(!container) return;
  container.innerHTML = "";
  snapshot.forEach(doc => {
    const a = doc.data();
    const date = a.date.toDate().toLocaleDateString('fr-FR');
    container.innerHTML += `
      <div class="article-card">
        <span class="badge-cat">${a.categorie}</span>
        <h3>${a.titre}</h3>
        <p>${a.contenu}</p>
        <div class="date">Publié le ${date}</div>
      </div>`;
  });
}

// PUBLICATION ARTICLE
document.addEventListener('DOMContentLoaded', function() {
  const formArticle = document.getElementById('formArticle');
  if(formArticle){
    formArticle.addEventListener('submit', async (e) => {
      e.preventDefault();
      await db.collection("articles").add({
        titre: document.getElementById('titreArticle').value,
        categorie: document.getElementById('categorieArticle').value,
        contenu: document.getElementById('contenuArticle').value,
        date: new Date()
      });
      alert("Article publié !");
      formArticle.reset();
      chargerArticles();
    });
  }
  chargerArticles(); // charge au démarrage
});
