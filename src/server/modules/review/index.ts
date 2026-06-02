import { Elysia, t } from 'elysia'
import { ReviewService } from './service'
import { ReviewModel } from './model'
import { isAuthenticated } from '@/server/middlewares/auth'

export const review = new Elysia({ prefix: '/review' })
	.get(
		'/movie/:movieId',
		async ({ params: { movieId } }) => {
			return await ReviewService.listReviewsByMovie(movieId)
		},
		{
			params: t.Object({
				movieId: t.String(),
			}),
			response: {
				200: ReviewModel.listReviewsResponse,
			},
			detail: {
				tags: ['Review'],
				summary: 'Get reviews for a movie',
				description: 'Get reviews for a movie'
			}
		}
	)
	.use(isAuthenticated)
	.post(
		'/',
		async ({ user, body }) => {
			return await ReviewService.createReview(user!.id, body)
		},
		{
			body: ReviewModel.createReviewBody,
			response: {
				200: ReviewModel.reviewResponse,
				400: ReviewModel.errorResponse,
				404: ReviewModel.errorResponse,
			},
			detail: {
				tags: ['Review'],
				summary: 'Create a review',
				description: 'Create a review'
			}
		}
	)
