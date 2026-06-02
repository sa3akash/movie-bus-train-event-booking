import { Elysia, t } from 'elysia'
import { AdminService } from './service'
import { AdminModel } from './model'
import { isAdmin } from '@/server/middlewares/auth'

export const admin = new Elysia({ prefix: '/admin' })
	.use(isAdmin)
	.get(
		'/dashboard',
		async () => {
			return await AdminService.getDashboardStats()
		},
		{
			response: {
				200: AdminModel.dashboardStatsResponse,
				400: AdminModel.errorResponse,
			},
			detail: {
				tags: ['Admin'],
				summary: 'Get dashboard stats',
				description: 'Get dashboard stats'
			}
		}
	)
	.get(
		'/bookings',
		async ({ query }) => {
			return await AdminService.listAllBookings(query.status)
		},
		{
			query: t.Object({
				status: t.Optional(t.String()),
			}),
			response: {
				200: AdminModel.listAllBookingsResponse,
				400: AdminModel.errorResponse,
			},
			detail: {
				tags: ['Admin'],
				summary: 'Get all bookings',
				description: 'Get all bookings'
			}
		}
	)
	.post(
		'/users/:userId/role',
		async ({ params: { userId }, body }) => {
			return await AdminService.assignUserRole(userId, body.roleName)
		},
		{
			params: t.Object({
				userId: t.String(),
			}),
			body: AdminModel.assignRoleBody,
			response: {
				200: AdminModel.assignRoleResponse,
				400: AdminModel.errorResponse,
				404: AdminModel.errorResponse,
			},
			detail: {
				tags: ['Admin'],
				summary: 'Assign role to user',
				description: 'Assign role to user'
			}
		}
	)
