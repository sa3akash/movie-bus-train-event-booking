import { Elysia, t } from 'elysia'
import { MovieService } from './service'
import { MovieModel } from './model'
import { isAdmin } from '@/server/middlewares/auth'

export const movie = new Elysia({ prefix: '/movie' })
	// ── Public routes ────────────────────────────────────────────────────────
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
		'/genres',
		async () => {
			return await MovieService.listGenres()
		},
		{
			response: {
				200: MovieModel.genreListResponse,
			},
			detail: {
				tags: ['Movie'],
				summary: 'List all genres',
				description: 'List all movie genres'
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
	// ── Admin protected routes ───────────────────────────────────────────────
	.use(isAdmin)
	// Movie CRUD
	.get(
		'/admin-list',
		async ({ query }) => {
			return await MovieService.listAdminMovies({
				search: query.search,
				status: query.status,
				page: query.page,
				limit: query.limit,
			})
		},
		{
			query: t.Object({
				search: t.Optional(t.String()),
				status: t.Optional(t.String()),
				page: t.Optional(t.Number()),
				limit: t.Optional(t.Number()),
			}),
			response: {
				200: MovieModel.adminMovieListResponse,
			},
			detail: {
				tags: ['Movie', 'Admin'],
				summary: 'List movies (admin, paginated)',
				description: 'Get all movies with pagination and search (admin only)'
			}
		}
	)
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
	.put(
		'/:id',
		async ({ params: { id }, body }) => {
			return await MovieService.updateMovie(id, body)
		},
		{
			params: t.Object({ id: t.String() }),
			body: MovieModel.updateMovieBody,
			response: {
				200: MovieModel.successResponse,
				400: MovieModel.errorResponse,
				404: MovieModel.errorResponse,
			},
			detail: {
				tags: ['Movie', 'Admin'],
				summary: 'Update a movie',
				description: 'Update movie details'
			}
		}
	)
	.delete(
		'/:id',
		async ({ params: { id } }) => {
			return await MovieService.deleteMovie(id)
		},
		{
			params: t.Object({ id: t.String() }),
			response: {
				200: MovieModel.successResponse,
				404: MovieModel.errorResponse,
			},
			detail: {
				tags: ['Movie', 'Admin'],
				summary: 'Delete a movie',
				description: 'Soft-delete a movie'
			}
		}
	)
	// Genre CRUD
	.post(
		'/genres',
		async ({ body }) => {
			return await MovieService.createGenre(body)
		},
		{
			body: MovieModel.createGenreBody,
			response: {
				200: MovieModel.genreResponse,
				400: MovieModel.errorResponse,
			},
			detail: {
				tags: ['Movie', 'Admin'],
				summary: 'Create a genre',
				description: 'Create a new movie genre'
			}
		}
	)
	.put(
		'/genres/:id',
		async ({ params: { id }, body }) => {
			return await MovieService.updateGenre(id, body)
		},
		{
			params: t.Object({ id: t.String() }),
			body: MovieModel.updateGenreBody,
			response: {
				200: MovieModel.successResponse,
				404: MovieModel.errorResponse,
			},
			detail: {
				tags: ['Movie', 'Admin'],
				summary: 'Update a genre',
				description: 'Update genre name/slug'
			}
		}
	)
	.delete(
		'/genres/:id',
		async ({ params: { id } }) => {
			return await MovieService.deleteGenre(id)
		},
		{
			params: t.Object({ id: t.String() }),
			response: {
				200: MovieModel.successResponse,
				404: MovieModel.errorResponse,
			},
			detail: {
				tags: ['Movie', 'Admin'],
				summary: 'Delete a genre',
				description: 'Delete a genre'
			}
		}
	)
	// Shows CRUD
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
			params: t.Object({ id: t.String() }),
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
			params: t.Object({ id: t.String() }),
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
			params: t.Object({ id: t.String() }),
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
	// Admin Reviews
	.get(
		'/admin-reviews',
		async ({ query }) => {
			return await MovieService.listAdminReviews({
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
				200: MovieModel.adminReviewListResponse,
			},
			detail: {
				tags: ['Movie', 'Admin'],
				summary: 'List all reviews (admin)',
				description: 'Get all reviews across all movies with pagination'
			}
		}
	)
	.put(
		'/reviews/:id/approval',
		async ({ params: { id }, body }) => {
			return await MovieService.updateReviewApproval(id, body.isApproved)
		},
		{
			params: t.Object({ id: t.String() }),
			body: MovieModel.updateReviewApprovalBody,
			response: {
				200: MovieModel.successResponse,
				404: MovieModel.errorResponse,
			},
			detail: {
				tags: ['Movie', 'Admin'],
				summary: 'Approve or reject a review',
				description: 'Update review approval status'
			}
		}
	)
	.delete(
		'/reviews/:id',
		async ({ params: { id } }) => {
			return await MovieService.deleteReview(id)
		},
		{
			params: t.Object({ id: t.String() }),
			response: {
				200: MovieModel.successResponse,
				404: MovieModel.errorResponse,
			},
			detail: {
				tags: ['Movie', 'Admin'],
				summary: 'Delete a review',
				description: 'Delete a review permanently'
			}
		}
	)
	// Analytics
	.get(
		'/analytics',
		async () => {
			return await MovieService.getAnalytics()
		},
		{
			response: {
				200: MovieModel.analyticsResponse,
			},
			detail: {
				tags: ['Movie', 'Admin'],
				summary: 'Movie analytics',
				description: 'Get movie analytics stats'
			}
		}
	)
