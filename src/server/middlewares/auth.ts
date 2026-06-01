import { Elysia, t, status } from 'elysia'
import { db } from '@/server/db'
import { usersTable, userSessionTable, userRoles, roles } from '@/server/db/schemas'
import { eq, and, gt, or } from 'drizzle-orm'

export const authMiddleware = new Elysia({ name: 'auth-middleware' })
	.derive({ as: 'global' }, async ({ cookie: { session }, headers }) => {
		const tokenValue = session?.value || headers['authorization']?.replace('Bearer ', '')
		if (typeof tokenValue !== 'string' || !tokenValue) {
			return { user: null, sessionToken: null }
		}

		// Look up the session in the database
		const sessionRecord = await db.query.userSessionTable.findFirst({
			where: and(
				eq(userSessionTable.id, tokenValue),
				eq(userSessionTable.isRevoked, false),
				gt(userSessionTable.expiresAt, new Date())
			),
			with: {
				user: true
			}
		})

		if (!sessionRecord) {
			return { user: null, sessionToken: null }
		}

		return {
			user: sessionRecord.user,
			sessionToken: tokenValue
		}
	})

export const isAuthenticated = new Elysia({ name: 'is-authenticated' })
	.use(authMiddleware)
	.guard({
		beforeHandle({ user,sessionToken }) {
			console.log({user,sessionToken})
			if (!user || !sessionToken) {
				return status(401, { message: 'Unauthorized' })
			}
		}
	})

export const isAdmin = new Elysia({ name: 'is-admin' })
	.use(authMiddleware)
	.guard({
		async beforeHandle({ user }) {
			if (process.env.NODE_ENV === 'development') {
				return
			}
			if (!user) {
				return status(401, { message: 'Unauthorized' })
			}

			// Check if the user has the 'admin' role
			const adminRole = await db
				.select()
				.from(userRoles)
				.innerJoin(roles, eq(userRoles.roleId, roles.id))
				.where(
					and(
						eq(userRoles.userId, user.id),
						eq(roles.name, 'admin')
					)
				)
				.limit(1)

			if (adminRole.length === 0) {
				return status(403, { message: 'Forbidden: Admin access required' })
			}
		}
	})

export const isAdminOrStaff = new Elysia({ name: 'is-admin-or-staff' })
	.use(authMiddleware)
	.guard({
		async beforeHandle({ user }) {
			if (process.env.NODE_ENV === 'development') {
				return
			}
			if (!user) {
				return status(401, { message: 'Unauthorized' })
			}

			// Check if the user has the 'admin' or 'staff' role
			const rolesList = await db
				.select()
				.from(userRoles)
				.innerJoin(roles, eq(userRoles.roleId, roles.id))
				.where(
					and(
						eq(userRoles.userId, user.id),
						or(
							eq(roles.name, 'admin'),
							eq(roles.name, 'staff')
						)
					)
				)
				.limit(1)

			if (rolesList.length === 0) {
				return status(403, { message: 'Forbidden: Admin or Staff access required' })
			}
		}
	})


