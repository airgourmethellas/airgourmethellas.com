// Auth testing file
import { exec } from 'child_process';
import crypto from 'crypto';
import { promisify } from 'util';
const scryptAsync = promisify(crypto.scrypt);

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

async function comparePasswords(supplied, stored) {
  if (!stored.includes('.')) {
    return supplied === stored;
  }
  
  const [hashed, salt] = stored.split('.');
  const hashedBuf = Buffer.from(hashed, 'hex');
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return crypto.timingSafeEqual(hashedBuf, suppliedBuf);
}

async function resetTestUser() {
  try {
    console.log("Creating a test user for authentication...");
    
    // We'll create a simple test user with known credentials
    const username = "test";
    const password = "password";
    const hashedPassword = await hashPassword(password);
    
    console.log(`Generated password hash: ${hashedPassword}`);
    
    // We'll use SQL directly to ensure it works regardless of storage implementation
    const sqlQuery = `
    INSERT INTO users (username, password, email, first_name, last_name, role, created)
    VALUES ('${username}', '${hashedPassword}', 'test@example.com', 'Test', 'User', 'admin', NOW())
    ON CONFLICT (username) 
    DO UPDATE SET password = '${hashedPassword}'
    RETURNING id;
    `;
    
    console.log("Executing SQL query...");
    
    // Run the query using the psql CLI
    exec(`echo "${sqlQuery}" | psql $DATABASE_URL`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error creating test user: ${error.message}`);
        return;
      }
      
      if (stderr) {
        console.error(`SQL error: ${stderr}`);
        return;
      }
      
      console.log(`Test user created or updated: ${stdout}`);
      console.log(`\n\nTest user credentials:`);
      console.log(`Username: ${username}`);
      console.log(`Password: ${password}`);
      console.log(`\nPlease use these credentials to test the authentication.`);
    });
  } catch (error) {
    console.error(`Error in reset script: ${error.message}`);
  }
}

resetTestUser();