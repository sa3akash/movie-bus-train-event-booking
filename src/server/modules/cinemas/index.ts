import { Elysia, t } from 'elysia'
import { CinemaService } from './service'
import { CinemaModel } from './model'
import { isAdmin } from '@/server/middlewares/auth'

export const cinemas = new Elysia({ prefix: '/cinema' })
	.get(
		'/',
		async ({ query }) => {
			return await CinemaService.listTheaters(query)
		},
		{
			query: t.Object({
				city: t.Optional(t.String()),
				search: t.Optional(t.String()),
			}),
			response: {
				200: CinemaModel.listTheatersResponse,
			},
			detail: {
				tags: ['Cinemas'],
				summary: 'Get all theaters',
				description: 'Get all theaters'
			}
		}
	)
	.get(
		'/chains',
		async ({ query }) => {
			return await CinemaService.listChains(query)
		},
		{
			query: CinemaModel.paginationQuery,
			response: {
				200: CinemaModel.paginatedChainsResponse,
			},
			detail: {
				tags: ['Cinemas'],
				summary: 'Get all chains',
				description: 'Get all chains'
			}
		}
	)
	.get(
		'/admin-theaters',
		async ({ query }) => {
			return await CinemaService.listAdminTheaters(query)
		},
		{
			query: CinemaModel.theaterQuery,
			response: {
				200: CinemaModel.paginatedAdminTheatersResponse,
			},
			detail: {
				tags: ['Cinemas'],
				summary: 'Get all theaters',
				description: 'Get all theaters'
			}
		}
	)
	.get(
		'/screens',
		async ({ query }) => {
			return await CinemaService.listAllAdminScreens(query)
		},
		{
			query: CinemaModel.screenQuery,
			response: {
				200: CinemaModel.paginatedAllAdminScreensResponse,
			},
			detail: {
				tags: ['Cinemas'],
				summary: 'Get all screens',
				description: 'Get all screens'
			}
		}
	)
	.get(
		'/slug/:slug',
		async ({ params: { slug } }) => {
			return await CinemaService.findTheaterBySlug(slug)
		},
		{
			params: t.Object({
				slug: t.String(),
			}),
			response: {
				200: CinemaModel.theaterResponse,
				404: CinemaModel.errorResponse,
			},
			detail: {
				tags: ['Cinemas'],
				summary: 'Get theater by slug',
				description: 'Get theater by slug'
			}
		}
	)
	.get(
		'/:id/screens',
		async ({ params: { id } }) => {
			return await CinemaService.listScreens(id)
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			response: {
				200: CinemaModel.listScreensResponse,
			},
			detail: {
				tags: ['Cinemas'],
				summary: 'Get screens for a theater',
				description: 'Get screens for a theater'
			}
		}
	)
	.get(
		'/screens/:id',
		async ({ params: { id } }) => {
			return await CinemaService.findScreenById(id)
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			response: {
				200: CinemaModel.screenResponse,
				404: CinemaModel.errorResponse,
			},
			detail: {
				tags: ['Cinemas'],
				summary: 'Get screen by id',
				description: 'Get screen by id'
			}
		}
	)
	// Admin protected routes
	.use(isAdmin)
	.post(
		'/',
		async ({ body }) => {
			return await CinemaService.createTheater(body)
		},
		{
			body: CinemaModel.createTheaterBody,
			response: {
				200: CinemaModel.theaterResponse,
				400: CinemaModel.errorResponse,
			},
			detail: {
				tags: ['Cinemas'],
				summary: 'Create a theater',
				description: 'Create a theater'
			}
		}
	)
	.put(
		'/:id',
		async ({ params: { id }, body }) => {
			return await CinemaService.updateTheater(id, body)
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			body: CinemaModel.updateTheaterBody,
			response: {
				200: CinemaModel.theaterResponse,
				400: CinemaModel.errorResponse,
				404: CinemaModel.errorResponse,
			},
			detail: {
				tags: ['Cinemas'],
				summary: 'Update a theater',
				description: 'Update a theater'
			}
		}
	)
	.delete(
		'/:id',
		async ({ params: { id } }) => {
			return await CinemaService.deleteTheater(id)
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			response: {
				200: t.Object({ message: t.String() }),
				404: CinemaModel.errorResponse,
			},
			detail: {
				tags: ['Cinemas'],
				summary: 'Delete a theater',
				description: 'Delete a theater'
			}
		}
	)
	.post(
		'/chains',
		async ({ body }) => {
			return await CinemaService.createChain(body)
		},
		{
			body: CinemaModel.createChainBody,
			response: {
				200: CinemaModel.chainResponse,
				400: CinemaModel.errorResponse,
			},
			detail: {
				tags: ['Cinemas'],
				summary: 'Create a chain',
				description: 'Create a chain'
			}
		}
	)
	.put(
		'/chains/:id',
		async ({ params: { id }, body }) => {
			return await CinemaService.updateChain(id, body)
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			body: CinemaModel.updateChainBody,
			response: {
				200: CinemaModel.chainResponse,
				400: CinemaModel.errorResponse,
				404: CinemaModel.errorResponse,
			},
			detail: {
				tags: ['Cinemas'],
				summary: 'Update a chain',
				description: 'Update a chain'
			}
		}
	)
	.delete(
		'/chains/:id',
		async ({ params: { id } }) => {
			return await CinemaService.deleteChain(id)
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			response: {
				200: t.Object({ message: t.String() }),
				404: CinemaModel.errorResponse,
			},
			detail: {
				tags: ['Cinemas'],
				summary: 'Delete a chain',
				description: 'Delete a chain'
			}
		}
	)
	.post(
		'/screens',
		async ({ body }) => {
			return await CinemaService.createScreen(body)
		},
		{
			body: CinemaModel.createScreenBody,
			response: {
				200: CinemaModel.screenResponse,
				400: CinemaModel.errorResponse,
			},
			detail: {
				tags: ['Cinemas'],
				summary: 'Create a screen',
				description: 'Create a screen'
			}
		}
	)
	.put(
		'/screens/:id',
		async ({ params: { id }, body }) => {
			return await CinemaService.updateScreen(id, body)
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			body: CinemaModel.updateScreenBody,
			response: {
				200: CinemaModel.screenResponse,
				400: CinemaModel.errorResponse,
				404: CinemaModel.errorResponse,
			},
			detail: {
				tags: ['Cinemas'],
				summary: 'Update a screen',
				description: 'Update a screen'
			}
		}
	)
	.delete(
		'/screens/:id',
		async ({ params: { id } }) => {
			return await CinemaService.deleteScreen(id)
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			response: {
				200: t.Object({ message: t.String() }),
				404: CinemaModel.errorResponse,
			},
			detail: {
				tags: ['Cinemas'],
				summary: 'Delete a screen',
				description: 'Delete a screen'
			}
		}
	)
