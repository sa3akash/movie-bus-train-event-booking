import { db } from '@/server/db'
import { usersTable, userSessionTable, roles, userRoles } from '@/server/db/schemas'
import { eq } from 'drizzle-orm'
import { status } from 'elysia'
import type { AuthModel } from './model'
import { hashPassword, verifyPassword } from '@/server/utils/hash'

export abstract class AuthService {
	static async signUp(data: AuthModel['signUpBody']) {
		// Check if user already exists
		const existingUser = await db
		.select()
		.from(usersTable)
		.where(eq(usersTable.email, data.email))
		.limit(1)

		if (existingUser.length > 0) {
			throw status(400, { message: 'Email already registered' })
		}

		// Hash password
		const passwordHash = await hashPassword(data.password)

		// Create user
		const [newUser] = await db
			.insert(usersTable)
			.values({
				name: data.name,
				email: data.email,
				passwordHash,
			})
			.returning()

		// Assign default 'customer' role if it exists
		const customerRole = await db
			.select()
			.from(roles)
			.where(eq(roles.name, 'customer'))
			.limit(1)

		if (customerRole.length > 0) {
			await db.insert(userRoles).values({
				userId: newUser.id,
				roleId: customerRole[0].id,
			})
		}

		return {
			id: newUser.id,
			name: newUser.name,
			email: newUser.email,
			isEmailVerified: newUser.isEmailVerified,
		}
	}

	static async signIn(data: AuthModel['signInBody']) {
		const [user] = await db
			.select()
			.from(usersTable)
			.where(eq(usersTable.email, data.email))
			.limit(1)

		if (!user) {
			throw status(400, { message: 'Invalid email or password' })
		}

		// Verify password
		const isValidPassword = await verifyPassword(data.password, user.passwordHash)
		if (!isValidPassword) {
			throw status(400, { message: 'Invalid email or password' })
		}

		// Generate session token
		const sessionToken = crypto.randomUUID()
		const refreshTokenHash = crypto.randomUUID()

		// Store session in DB (lasts 7 days)
		await db.insert(userSessionTable).values({
			id: sessionToken,
			userId: user.id,
			refreshTokenHash,
			expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
		})

		return {
			token: sessionToken,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
			},
		}
	}

	static async signOut(sessionToken: string) {
		await db
			.update(userSessionTable)
			.set({ isRevoked: true })
			.where(eq(userSessionTable.id, sessionToken))
	}
}
