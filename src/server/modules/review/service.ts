import { db } from '@/server/db'
import { reviews, movies, bookings, shows, usersTable } from '@/server/db/schemas'
import { eq, and, desc } from 'drizzle-orm'
import { status } from 'elysia'
import type { ReviewModel } from './model'

export abstract class ReviewService {
	static async createReview(userId: string, data: ReviewModel['createReviewBody']) {
		return await db.transaction(async (tx) => {
			const [movie] = await tx
				.select()
				.from(movies)
				.where(eq(movies.id, data.movieId))
				.limit(1)

			if (!movie) {
				throw status(404, { message: 'Movie not found' })
			}

			const existingReview = await tx
				.select()
				.from(reviews)
				.where(
					and(
						eq(reviews.userId, userId),
						eq(reviews.movieId, data.movieId)
					)
				)
				.limit(1)

			if (existingReview.length > 0) {
				throw status(400, { message: 'You have already reviewed this movie' })
			}

			// check verified purchase
			const confirmedBookings = await tx
				.select({ id: bookings.id })
				.from(bookings)
				.innerJoin(shows, eq(bookings.showId, shows.id))
				.where(
					and(
						eq(bookings.userId, userId),
						eq(shows.movieId, data.movieId),
						eq(bookings.status, 'CONFIRMED')
					)
				)
				.limit(1)

			const isVerifiedPurchase = confirmedBookings.length > 0

			// insert review
			const [newReview] = await tx
				.insert(reviews)
				.values({
					userId,
					movieId: data.movieId,
					rating: data.rating,
					title: data.title || null,
					comment: data.comment || null,
					isVerifiedPurchase,
					isApproved: true,
				})
				.returning()

			// recalculate average rating and total reviews
			const movieReviews = await tx
				.select({
					rating: reviews.rating,
				})
				.from(reviews)
				.where(
					and(
						eq(reviews.movieId, data.movieId),
						eq(reviews.isApproved, true)
					)
				)

			const totalReviews = movieReviews.length
			let averageRating = 0
			if (totalReviews > 0) {
				const sum = movieReviews.reduce((acc, r) => acc + r.rating, 0)
				averageRating = sum / totalReviews
			}

			await tx
				.update(movies)
				.set({
					averageRating: averageRating.toFixed(2),
					totalReviews,
				})
				.where(eq(movies.id, data.movieId))

			// get user name
			const [user] = await tx
				.select({ name: usersTable.name })
				.from(usersTable)
				.where(eq(usersTable.id, userId))
				.limit(1)

			return {
				id: newReview.id,
				userId: newReview.userId,
				userName: user ? user.name : 'Unknown User',
				movieId: newReview.movieId,
				rating: newReview.rating,
				title: newReview.title,
				comment: newReview.comment,
				isVerifiedPurchase: newReview.isVerifiedPurchase ?? false,
				likesCount: newReview.likesCount ?? 0,
				isApproved: newReview.isApproved ?? true,
				createdAt: newReview.createdAt,
			}
		})
	}

	static async listReviewsByMovie(movieId: string) {
		const results = await db
			.select({
				id: reviews.id,
				userId: reviews.userId,
				userName: usersTable.name,
				movieId: reviews.movieId,
				rating: reviews.rating,
				title: reviews.title,
				comment: reviews.comment,
				isVerifiedPurchase: reviews.isVerifiedPurchase,
				likesCount: reviews.likesCount,
				isApproved: reviews.isApproved,
				createdAt: reviews.createdAt,
			})
			.from(reviews)
			.innerJoin(usersTable, eq(reviews.userId, usersTable.id))
			.where(
				and(
					eq(reviews.movieId, movieId),
					eq(reviews.isApproved, true)
				)
			)
			.orderBy(desc(reviews.createdAt))

		return results.map(r => ({
			...r,
			isVerifiedPurchase: r.isVerifiedPurchase ?? false,
			likesCount: r.likesCount ?? 0,
			isApproved: r.isApproved ?? true,
		}))
	}
}
