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
		}
	)
