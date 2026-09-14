const net = require('net');
const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Verifica si un puerto específico está libre tanto en IPv4 como en IPv6
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const s1 = net.createServer();
    s1.once('error', () => resolve(false));
    s1.once('listening', () => {
      s1.close(() => {
        const s2 = net.createServer();
        s2.once('error', () => resolve(false));
        s2.once('listening', () => s2.close(() => resolve(true)));
        s2.listen(port, '0.0.0.0');
      });
    });
    s1.listen(port, '::');
  });
}

// Busca el primer puerto disponible a partir de startPort
async function findFreePort(startPort = 3000, maxAttempts = 50) {
  for (let port = startPort; port < startPort + maxAttempts; port++) {
    const available = await isPortAvailable(port);
    if (available) {
      return port;
    }
  }
  return startPort;
}

// Obtiene el PID del proceso que está escuchando en un puerto específico en Windows
function getPidOnPort(port) {
  if (process.platform !== 'win32') return null;
  try {
    const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
    const lines = output.trim().split('\n');
    for (const line of lines) {
      if (line.includes('LISTENING') || line.includes('LIST')) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && !isNaN(Number(pid))) {
          return pid;
        }
      }
    }
  } catch (e) {}
  return null;
}

// Limpia procesos previos de Next.js y archivos de lock
function cleanupPreviousNextDev(port) {
  const lockPath = path.join(process.cwd(), '.next', 'dev', 'lock');
  const logsPath = path.join(process.cwd(), '.next', 'dev', 'logs', 'next-development.log');

  // 1. Intentar obtener PID del log de Next
  let targetPid = null;
  if (fs.existsSync(logsPath)) {
    try {
      const logContent = fs.readFileSync(logsPath, 'utf8');
      const pidMatch = logContent.match(/PID:\s*(\d+)/i);
      if (pidMatch && pidMatch[1]) {
        targetPid = pidMatch[1];
      }
    } catch (e) {}
  }

  // 2. Si no, buscar el PID que escucha en el puerto
  if (!targetPid && port) {
    targetPid = getPidOnPort(port);
  }

  // 3. Terminar proceso si existe
  if (targetPid) {
    if (process.platform === 'win32') {
      try {
        execSync(`taskkill /PID ${targetPid} /F`, { stdio: 'ignore' });
        console.log(`🧹 Proceso anterior en puerto ${port || 3000} (PID ${targetPid}) finalizado.`);
      } catch (e) {}
    } else {
      try {
        process.kill(Number(targetPid), 'SIGKILL');
      } catch (e) {}
    }
  }

  // 4. Limpiar lock file
  if (fs.existsSync(lockPath)) {
    try {
      fs.unlinkSync(lockPath);
    } catch (e) {}
  }
}

async function main() {
  const args = process.argv.slice(2);

  // Verificar si el usuario pasó un puerto explícito (--port o -p)
  let requestedPort = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--port' || args[i] === '-p') {
      requestedPort = parseInt(args[i + 1], 10);
      break;
    }
  }

  if (!requestedPort && process.env.PORT) {
    requestedPort = parseInt(process.env.PORT, 10);
  }

  const basePort = requestedPort || 3000;
  let targetPort = basePort;

  // Verificar si basePort está ocupado
  const isBaseFree = await isPortAvailable(basePort);

  if (!isBaseFree) {
    console.log(`⚠️  El puerto ${basePort} está ocupado.`);
    
    // Intentar liberar si pertenece a un proceso previo de dev
    cleanupPreviousNextDev(basePort);
    
    // Esperar 400ms para que el socket se libere en el SO
    await new Promise((r) => setTimeout(r, 400));

    // Volver a chequear si se liberó
    const isNowFree = await isPortAvailable(basePort);
    if (isNowFree) {
      targetPort = basePort;
      console.log(`✅ Puerto ${basePort} liberado y listo.`);
    } else {
      // Si sigue ocupado por otra aplicación, buscar el siguiente puerto dinámico libre
      targetPort = await findFreePort(basePort + 1);
      console.log(`🔄 Asignando puerto dinámico disponible: ${targetPort}`);
    }
  }

  console.log(`\n🚀 Horario Inteligente UTP iniciándose en: http://localhost:${targetPort}\n`);

  const nextJsEntry = path.join(process.cwd(), 'node_modules', 'next', 'dist', 'bin', 'next');
  const nextArgs = [nextJsEntry, 'dev', '--port', String(targetPort)];

  // Agregar argumentos adicionales que el usuario haya pasado
  for (let i = 0; i < args.length; i++) {
    if (args[i] !== '--port' && args[i] !== '-p' && args[i - 1] !== '--port' && args[i - 1] !== '-p') {
      nextArgs.push(args[i]);
    }
  }

  const child = spawn(process.execPath, nextArgs, {
    stdio: 'inherit',
    env: { ...process.env, PORT: String(targetPort) },
    shell: false,
  });

  child.on('exit', (code) => {
    process.exit(code || 0);
  });
}

main().catch((err) => {
  console.error('Error al iniciar el servidor:', err);
  process.exit(1);
});
