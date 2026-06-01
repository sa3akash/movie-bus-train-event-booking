import { t, type UnwrapSchema } from 'elysia'

export const AdminModel = {
	dashboardStatsResponse: t.Object({
		totalMovies: t.Integer(),
		totalBookings: t.Integer(),
		totalRevenue: t.String(),
		totalUsers: t.Integer(),
		activeShows: t.Integer(),
		recentBookings: t.Array(
			t.Object({
				id: t.String(),
				bookingNumber: t.String(),
				movieTitle: t.String(),
				userName: t.String(),
				totalAmount: t.String(),
				status: t.String(),
				createdAt: t.Any(),
			})
		),
	}),
	listAllBookingsResponse: t.Array(
		t.Object({
			id: t.String(),
			bookingNumber: t.String(),
			userId: t.String(),
			userName: t.String(),
			showId: t.String(),
			movieTitle: t.String(),
			totalAmount: t.String(),
			status: t.String(),
			checkedIn: t.Boolean(),
			createdAt: t.Any(),
		})
	),
	assignRoleBody: t.Object({
		roleName: t.Union([t.Literal('admin'), t.Literal('staff'), t.Literal('customer')]),
	}),
	assignRoleResponse: t.Object({
		message: t.String(),
	}),
	errorResponse: t.Object({
		message: t.String(),
	}),
} as const

export type AdminModel = {
	[k in keyof typeof AdminModel]: UnwrapSchema<typeof AdminModel[k]>
}
