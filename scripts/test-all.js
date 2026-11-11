const { spawnSync } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');
const services = [
  { name: 'Auth Service', dir: 'services/auth-service' },
  { name: 'Booking Service', dir: 'services/booking-service' }
];

console.log('🧪 Exécution de la suite de tests automatisés CI/CD...\n');
let hasFailures = false;

for (const s of services) {
  console.log(`========================================`);
  console.log(`▶️ Tests : ${s.name}`);
  console.log(`========================================`);
  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const res = spawnSync(npmCmd, ['test'], {
    cwd: path.join(root, s.dir),
    stdio: 'inherit',
    shell: true
  });
  if (res.status !== 0) {
    hasFailures = true;
    console.error(`❌ Échec des tests pour ${s.name}\n`);
  } else {
    console.log(`✅ Tests réussis pour ${s.name}\n`);
  }
}

if (hasFailures) {
  console.error('💥 Certains tests ont échoué.');
  process.exit(1);
} else {
  console.log('🎉 TOUS LES TESTS AUTOMATIQUES ONT RÉUSSI AVEC SUCCÈS !');
}
