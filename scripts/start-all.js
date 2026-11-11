const { spawn } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

console.log('🚀 Démarrage de l\'ensemble de l\'architecture FlexOffice...');
console.log('   - Auth Service:    http://localhost:5001');
console.log('   - Booking Service: http://localhost:5002');
console.log('   - Frontend React:  http://localhost:3000\n');

function runService(name, dir, script = 'start') {
  const child = spawn(npmCmd, ['run', script], {
    cwd: path.join(root, dir),
    shell: true,
    stdio: 'pipe'
  });

  child.stdout.on('data', (d) => {
    process.stdout.write(`[${name}] ${d}`);
  });

  child.stderr.on('data', (d) => {
    process.stderr.write(`[${name} ERROR] ${d}`);
  });

  child.on('close', (code) => {
    console.log(`[${name}] Processus terminé avec le code ${code}`);
  });

  return child;
}

const p1 = runService('AUTH-5001', 'services/auth-service', 'start');
const p2 = runService('BOOKING-5002', 'services/booking-service', 'start');
const p3 = runService('FRONTEND-3000', 'frontend', 'dev');

function cleanup() {
  console.log('\n🛑 Arrêt des microservices...');
  try { p1.kill(); } catch {}
  try { p2.kill(); } catch {}
  try { p3.kill(); } catch {}
  process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
