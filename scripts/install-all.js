const { spawnSync } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dirs = [
  'services/auth-service',
  'services/booking-service',
  'frontend'
];

console.log('📦 Installation des dépendances pour tous les microservices et le frontend...\n');

for (const dir of dirs) {
  const fullPath = path.join(root, dir);
  console.log(`➡️ Installation dans : ${dir}`);
  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const res = spawnSync(npmCmd, ['install'], {
    cwd: fullPath,
    stdio: 'inherit',
    shell: true
  });
  if (res.status !== 0) {
    console.error(`❌ Échec de l'installation dans ${dir}`);
    process.exit(1);
  }
}

console.log('\n✅ Toutes les dépendances sont installées avec succès !');
