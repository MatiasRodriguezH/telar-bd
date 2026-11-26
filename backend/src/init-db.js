import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { withConnection } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATABASE_DIR = path.resolve(__dirname, '../../database');

// Orden obligatorio en que deben ejecutarse los 8 archivos SQL
const SQL_FILES = [
  '01_TABLAS.sql',
  '02_SECUENCIAS.sql',
  '03_FUNCIONES.sql',
  '04_TRIGGERS.sql',
  '05_CRUDS.sql',
  '06_GESTORES.sql',
  '07_REPORTES.sql',
  '08_PRUEBAS.sql',
];

// Separa un archivo SQL en bloques ejecutables (por '/' para PL/SQL o por ';' para DDL simple)
function splitSqlStatements(content, isPlsql) {
  // Quitamos comentarios de bloque /* ... */ y comandos solo de SQL*Plus como SET SERVEROUTPUT
  const cleaned = content
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter((line) => !/^\s*SET\s+SERVEROUTPUT/i.test(line))
    .join('\n');

  if (isPlsql) {
    // Los archivos PL/SQL (funciones, triggers, procedimientos y bloque anónimo) terminan cada bloque con '/'
    return cleaned
      .split(/\n\s*\/\s*(?:\n|$)/)
      .map((block) => block.trim())
      .filter((block) => block.length > 0 && !/^--.*$/.test(block));
  }

  // Para tablas y secuencias separamos por punto y coma ';'
  return cleaned
    .split(';')
    .map((stmt) => stmt.trim())
    .filter((stmt) => {
      const sinComentarios = stmt
        .split('\n')
        .filter((l) => !l.trim().startsWith('--'))
        .join('\n')
        .trim();
      return sinComentarios.length > 0;
    });
}

// Ejecuta todos los archivos SQL uno por uno sobre Oracle
async function runSetup() {
  console.log('Iniciando instalación de la base de datos en Oracle...');

  await withConnection(async (connection) => {
    for (const fileName of SQL_FILES) {
      const filePath = path.join(DATABASE_DIR, fileName);
      const rawSql = fs.readFileSync(filePath, 'utf8');

      // 01 y 02 son DDL simple separados por ';'; del 03 al 08 contienen bloques PL/SQL terminados en '/'
      const isPlsql = !fileName.startsWith('01_') && !fileName.startsWith('02_');
      const statements = splitSqlStatements(rawSql, isPlsql);

      console.log(`-> Ejecutando ${fileName} (${statements.length} bloques)...`);

      for (const stmt of statements) {
        // Ignoramos los SELECT finales de verificación en 08_PRUEBAS.sql
        if (fileName === '08_PRUEBAS.sql' && /^\s*(--.*\n)*\s*SELECT\b/i.test(stmt)) {
          continue;
        }

        try {
          await connection.execute(stmt);
        } catch (err) {
          // En los DROP iniciales es normal que la tabla o secuencia no exista aún (ORA-00942 / ORA-02289)
          const isDropNotFound =
            /^\s*(--.*\n)*\s*DROP\s+/i.test(stmt) &&
            (err.message.includes('ORA-00942') || err.message.includes('ORA-02289'));

          if (!isDropNotFound) {
            console.error(`Error ejecutando bloque en ${fileName}:\n${stmt.slice(0, 200)}`);
            throw err;
          }
        }
      }
    }
  });

  console.log('Listo: los 8 scripts SQL fueron instalados correctamente en Oracle.');
}

runSetup()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Falló la instalación en Oracle:', err.message);
    process.exit(1);
  });
