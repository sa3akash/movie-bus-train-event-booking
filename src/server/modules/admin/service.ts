import { db } from '@/server/db'
import { bookings, movies, shows, usersTable, roles, userRoles } from '@/server/db/schemas'
import { eq, and, desc, count, sum } from 'drizzle-orm'
import { status } from 'elysia'
import type { AdminModel } from './model'

export abstract class AdminService {
	static async getDashboardStats() {
		const [moviesCount] = await db.select({ count: count() }).from(movies)
		const [bookingsCount] = await db.select({ count: count() }).from(bookings)
		const [usersCount] = await db.select({ count: count() }).from(usersTable)
		const [showsCount] = await db.select({ count: count() }).from(shows)

		const [revenueSum] = await db
			.select({ revenue: sum(bookings.totalAmount) })
			.from(bookings)
			.where(eq(bookings.status, 'CONFIRMED'))

		const recent = await db
			.select({
				id: bookings.id,
				bookingNumber: bookings.bookingNumber,
				movieTitle: movies.title,
				userName: usersTable.name,
				totalAmount: bookings.totalAmount,
				status: bookings.status,
				createdAt: bookings.createdAt,
			})
			.from(bookings)
			.innerJoin(usersTable, eq(bookings.userId, usersTable.id))
			.innerJoin(shows, eq(bookings.showId, shows.id))
			.innerJoin(movies, eq(shows.movieId, movies.id))
			.orderBy(desc(bookings.createdAt))
			.limit(5)

		return {
			totalMovies: moviesCount?.count || 0,
			totalBookings: bookingsCount?.count || 0,
			totalRevenue: revenueSum?.revenue || '0.00',
			totalUsers: usersCount?.count || 0,
			activeShows: showsCount?.count || 0,
			recentBookings: recent.map(r => ({
				...r,
				createdAt: r.createdAt,
			})),
		}
	}

	static async listAllBookings(statusFilter?: string) {
		let query = db
			.select({
				id: bookings.id,
				bookingNumber: bookings.bookingNumber,
				userId: bookings.userId,
				userName: usersTable.name,
				showId: bookings.showId,
				movieTitle: movies.title,
				totalAmount: bookings.totalAmount,
				status: bookings.status,
				checkedIn: bookings.checkedIn,
				createdAt: bookings.createdAt,
			})
			.from(bookings)
			.innerJoin(usersTable, eq(bookings.userId, usersTable.id))
			.innerJoin(shows, eq(bookings.showId, shows.id))
			.innerJoin(movies, eq(shows.movieId, movies.id))

		if (statusFilter) {
			// @ts-ignore
			query = query.where(eq(bookings.status, statusFilter))
		}

		const results = await query.orderBy(desc(bookings.createdAt))
		return results.map(r => ({
			...r,
			checkedIn: r.checkedIn ?? false,
			createdAt: r.createdAt,
		}))
	}

	static async assignUserRole(userId: string, roleName: string) {
		const [user] = await db
			.select()
			.from(usersTable)
			.where(eq(usersTable.id, userId))
			.limit(1)

		if (!user) {
			throw status(404, { message: 'User not found' })
		}

		let [role] = await db
			.select()
			.from(roles)
			.where(eq(roles.name, roleName))
			.limit(1)

		if (!role) {
			const [newRole] = await db
				.insert(roles)
				.values({
					name: roleName,
					description: `${roleName} role`,
					isSystem: false,
				})
				.returning()
			role = newRole
		}

		const existingUserRole = await db
			.select()
			.from(userRoles)
			.where(
				and(
					eq(userRoles.userId, userId),
					eq(userRoles.roleId, role.id)
				)
			)
			.limit(1)

		if (existingUserRole.length === 0) {
			await db
				.insert(userRoles)
				.values({
					userId,
					roleId: role.id,
				})
		}

		return {
			message: `Role '${roleName}' assigned successfully`,
		}
	}
}
