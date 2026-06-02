import { Elysia, t } from 'elysia'
import { MovieService } from './service'
import { MovieModel } from './model'
import { isAdmin } from '@/server/middlewares/auth'

export const movie = new Elysia({ prefix: '/movie' })
	.get(
		'/',
		async ({ query }) => {
			return await MovieService.list(query)
		},
		{
			query: t.Object({
				status: t.Optional(t.Union([t.Literal('NOW_SHOWING'), t.Literal('COMING_SOON')])),
				search: t.Optional(t.String()),
			}),
			response: {
				200: MovieModel.listResponse,
			},
			detail: {
				tags: ['Movie'],
				summary: 'Get all movies',
				description: 'Get all movies'
			}
		}
	)
	.get(
		'/slug/:slug',
		async ({ params: { slug } }) => {
			return await MovieService.findBySlug(slug)
		},
		{
			params: t.Object({
				slug: t.String(),
			}),
			response: {
				200: MovieModel.movieResponse,
				404: MovieModel.errorResponse,
			},
			detail: {
				tags: ['Movie'],
				summary: 'Get movie by slug',
				description: 'Get movie by slug'
			}
		}
	)
	.get(
		'/:id/shows',
		async ({ params: { id } }) => {
			return await MovieService.getShows(id)
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			response: {
				200: MovieModel.showsListResponse,
			},
			detail: {
				tags: ['Movie'],
				summary: 'Get shows for a movie',
				description: 'Get shows for a movie'
			}
		}
	)
	// Admin protected routes
	.use(isAdmin)
	.post(
		'/',
		async ({ body }) => {
			return await MovieService.createMovie(body)
		},
		{
			body: MovieModel.createMovieBody,
			response: {
				200: MovieModel.movieResponse,
				400: MovieModel.errorResponse,
			},
			detail: {
				tags: ['Movie'],
				summary: 'Create a movie',
				description: 'Create a movie'
			}
		}
	)
	.post(
		'/shows',
		async ({ body }) => {
			return await MovieService.createShow(body)
		},
		{
			body: MovieModel.createShowBody,
			response: {
				200: MovieModel.showResponse,
				400: MovieModel.errorResponse,
			},
			detail: {
				tags: ['Movie'],
				summary: 'Create a show',
				description: 'Create a show'
			}
		}
	)
	.get(
		'/admin-shows',
		async ({ query }) => {
			return await MovieService.getAdminShows({
				search: query.search,
				page: query.page,
				limit: query.limit,
			})
		},
		{
			query: t.Object({
				search: t.Optional(t.String()),
				page: t.Optional(t.Number()),
				limit: t.Optional(t.Number()),
			}),
			response: {
				200: MovieModel.adminShowsResponse,
			},
			detail: {
				tags: ['Movie', 'Admin'],
				summary: 'Get all shows (paginated)',
				description: 'Get all shows with pagination and search'
			}
		}
	)
	.get(
		'/shows/:id',
		async ({ params: { id } }) => {
			return await MovieService.getShowById(id)
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			response: {
				200: MovieModel.showResponse,
				404: MovieModel.errorResponse,
			},
			detail: {
				tags: ['Movie', 'Admin'],
				summary: 'Get show by id',
				description: 'Get show by id'
			}
		}
	)
	.put(
		'/shows/:id',
		async ({ params: { id }, body }) => {
			return await MovieService.updateShow(id, body)
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			body: MovieModel.updateShowBody,
			response: {
				200: MovieModel.successResponse,
				404: MovieModel.errorResponse,
			},
			detail: {
				tags: ['Movie', 'Admin'],
				summary: 'Update a show',
				description: 'Update a show'
			}
		}
	)
	.delete(
		'/shows/:id',
		async ({ params: { id } }) => {
			return await MovieService.deleteShow(id)
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			response: {
				200: MovieModel.successResponse,
				404: MovieModel.errorResponse,
			},
			detail: {
				tags: ['Movie', 'Admin'],
				summary: 'Delete a show',
				description: 'Delete a show'
			}
		}
	)
