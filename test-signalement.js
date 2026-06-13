const BASE = 'http://localhost/veille/backend/public/api';

async function api(method, path, body, token) {
    const opts = {
        method,
        headers: { 'Accept': 'application/json' }
    };
    if (token) opts.headers['Authorization'] = `Bearer ${token}`;
    if (body instanceof FormData) {
        opts.body = body;
    } else if (body) {
        opts.headers['Content-Type'] = 'application/json';
        opts.body = JSON.stringify(body);
    }
    const res = await fetch(`${BASE}${path}`, opts);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`[${res.status}] ${JSON.stringify(data)}`);
    return { status: res.status, data };
}

async function runTest() {
    console.log('=== TEST FLUX COMPLET DE SIGNALEMENT ===\n');

    // 1. Sanity check
    const health = await api('GET', '/maintenance-status');
    console.log(`✅ Backend OK — app: ${health.data.app_name}`);

    // 2. Soumettre un signalement anonyme (comme sur mobile)
    console.log('\n1. Création du signalement (comme sur mobile)...');
    const form = new FormData();
    form.append('type', 'accident');
    form.append('title', 'Test Accident - Script Auto');
    form.append('description', 'Description longue pour le test du flux de signalement mobile et web (min 20 chars).');
    form.append('address', 'Avenue de la Nation, Ouagadougou');
    form.append('latitude', '12.3686');
    form.append('longitude', '-1.5275');
    form.append('urgency', 'modere');
    form.append('is_anonymous', 'true');
    form.append('legal_accepted', 'true');

    const created = await api('POST', '/alerts', form);
    const alertId = created.data.alert.id;
    const alertRef = created.data.reference;
    console.log(`   → ID: ${alertId}, Réf: ${alertRef}, Statut: "${created.data.alert.status}"`);
    if (created.data.alert.status === 'soumis' || created.data.alert.status === 'en_attente') {
        console.log('   ✅ Signalement créé avec le bon statut');
    }

    // 3. Vérification flux public AVANT validation (mobile & web ne doivent pas le voir)
    console.log('\n2. Vérification flux public AVANT validation...');
    const publicBefore = await api('GET', '/alerts');
    const list1 = publicBefore.data.data || publicBefore.data;
    const foundBefore = list1.find(a => a.id === alertId);
    if (!foundBefore) {
        console.log('   ✅ Invisible dans le flux public (sécurité OK)');
    } else {
        console.log(`   ❌ PROBLÈME : alerte visible avant validation ! (statut: ${foundBefore.status})`);
    }

    // 4. Connexion admin
    console.log('\n3. Connexion Super Admin...');
    const login = await api('POST', '/login', { identifier: 'admin@veillecitoyenne.bf', password: 'Admin@2026!' });
    const token = login.data.token;
    console.log(`   ✅ Connecté — rôle: ${login.data.user?.roles?.[0]?.name || 'super_admin'}`);

    // 5. Validation de l'alerte (comme dans le tableau de bord web)
    console.log('\n4. Validation via le tableau de bord...');
    await api('POST', `/alerts/${alertId}/validate`, { note: 'Alerte vérifiée et validée par le script de test.' }, token);
    console.log('   ✅ Alerte validée avec succès');

    // 6. Vérification flux public APRÈS validation
    console.log('\n5. Vérification flux public APRÈS validation...');
    const publicAfter = await api('GET', '/alerts');
    const list2 = publicAfter.data.data || publicAfter.data;
    const foundAfter = list2.find(a => a.id === alertId);
    if (foundAfter) {
        console.log(`   ✅ Alerte visible sur Mobile & Web ! (statut: "${foundAfter.status}")`);
    } else {
        console.log('   ❌ Alerte toujours invisible après validation');
    }

    // 7. Résumé
    console.log('\n=== RÉSULTAT ===');
    if (!foundBefore && foundAfter) {
        console.log('🎉 FLUX COMPLET VALIDÉ : Signalement → Invisible → Validation → Visible (Web & Mobile)');
    } else {
        console.log('⚠️  Des vérifications supplémentaires sont nécessaires.');
    }
}

runTest().catch(e => console.error('Erreur fatale:', e.message));
