import crypto from 'crypto';

const ITERATIONS = 100000;
const KEY_LEN = 64;
const DIGEST = 'sha512';
const ALGORITHM = 'pbkdf2';

const pbkdf2 = (password: Buffer, salt: Buffer, iterations: number, keylen: number, digest: string): Promise<Buffer> => {
	return new Promise((resolve, reject) => {
		crypto.pbkdf2(password, salt, iterations, keylen, digest, (err, derivedKey) => {
			if (err) reject(err);
			else resolve(derivedKey);
		});
	});
};

export const hashPassword = async (password: string): Promise<string> => {
	const secret = process.env.SECRET_PASS || 'default_secret_key_fallback_2026';
	const salt = crypto.randomBytes(16);
	const peppered = crypto.createHmac('sha512', secret).update(password).digest();
	
	const derivedKey = await pbkdf2(peppered, salt, ITERATIONS, KEY_LEN, DIGEST);
	
	const saltHex = salt.toString('hex');
	const hashHex = derivedKey.toString('hex');
	
	return `${ALGORITHM}$${ITERATIONS}$${saltHex}$${hashHex}`;
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
	try {
		const parts = hash.split('$');
		if (parts.length !== 4) {
			return false;
		}
		
		const [algo, iterationsStr, saltHex, hashHex] = parts;
		if (algo !== ALGORITHM) {
			return false;
		}
		
		const iterations = parseInt(iterationsStr, 10);
		if (isNaN(iterations) || iterations <= 0) {
			return false;
		}
		
		const secret = process.env.SECRET_PASS || 'default_secret_key_fallback_2026';
		const salt = Buffer.from(saltHex, 'hex');
		const originalHash = Buffer.from(hashHex, 'hex');
		
		const peppered = crypto.createHmac('sha512', secret).update(password).digest();
		const derivedKey = await pbkdf2(peppered, salt, iterations, KEY_LEN, DIGEST);
		
		if (derivedKey.length !== originalHash.length) {
			return false;
		}
		
		return crypto.timingSafeEqual(derivedKey, originalHash);
	} catch {
		return false;
	}
};

