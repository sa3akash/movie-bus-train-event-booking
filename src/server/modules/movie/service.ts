import { db } from '@/server/db'
import { movies, shows, cinemaScreens, seats, showSeats, theatersTable, genres, reviews, usersTable, bookings, images } from '@/server/db/schemas'
import { eq, and, ilike, or, desc, sql, count, isNull } from 'drizzle-orm'
import { status } from 'elysia'
import type { MovieModel } from './model'

export abstract class MovieService {
	// ── Public Movie Listing ────────────────────────────────────────────────
	static async list(params: { status?: 'NOW_SHOWING' | 'COMING_SOON'; search?: string }) {
		const query = db
			.select({
				id: movies.id,
				title: movies.title,
				slug: movies.slug,
				language: movies.language,
				releaseDate: movies.releaseDate,
				duration: movies.duration,
				rating: movies.rating,
				price: movies.price,
				posterUrl: images.url,
			})
			.from(movies)
			.leftJoin(images, eq(movies.posterId, images.id))

		const conditions = []

		if (params.status) {
			if (params.status === 'NOW_SHOWING') {
				conditions.push(eq(movies.isNowShowing, true))
			} else if (params.status === 'COMING_SOON') {
				conditions.push(eq(movies.isComingSoon, true))
			}
		}

		if (params.search) {
			conditions.push(
				or(
					ilike(movies.title, `%${params.search}%`),
					ilike(movies.slug, `%${params.search}%`)
				)
			)
		}

		// Exclude soft-deleted
		conditions.push(isNull(movies.deletedAt))

		if (conditions.length > 0) {
			query.where(and(...conditions))
		}

		return await query
	}

	static async findBySlug(slug: string) {
		const [movie] = await db
			.select()
			.from(movies)
			.where(and(eq(movies.slug, slug), isNull(movies.deletedAt)))
			.limit(1)

		if (!movie) {
			throw status(404, { message: 'Movie not found' })
		}

		return movie
	}

	// ── Admin Movie List (paginated) ────────────────────────────────────────
	static async listAdminMovies(params: { search?: string; status?: string; page?: number; limit?: number }) {
		const page = Number(params.page) || 1
		const limit = Number(params.limit) || 10
		const offset = (page - 1) * limit

		const conditions: any[] = [isNull(movies.deletedAt)]

		if (params.search) {
			conditions.push(
				or(
					ilike(movies.title, `%${params.search}%`),
					ilike(movies.slug, `%${params.search}%`)
				)
			)
		}

		if (params.status) {
			conditions.push(eq(movies.status, params.status as any))
		}

		const results = await db
			.select({
				id: movies.id,
				title: movies.title,
				slug: movies.slug,
				status: movies.status,
				language: movies.language,
				releaseDate: movies.releaseDate,
				duration: movies.duration,
				rating: movies.rating,
				price: movies.price,
				posterId: movies.posterId,
				posterUrl: images.url,
				isNowShowing: movies.isNowShowing,
				isComingSoon: movies.isComingSoon,
				totalReviews: movies.totalReviews,
				averageRating: movies.averageRating,
			})
			.from(movies)
			.leftJoin(images, eq(movies.posterId, images.id))
			.where(and(...conditions))
			.orderBy(desc(movies.createdAt))
			.limit(limit)
			.offset(offset)

		const [{ total }] = await db
			.select({ total: count() })
			.from(movies)
			.where(and(...conditions))

		return {
			items: results,
			total,
			page,
			limit,
			pages: Math.ceil(total / limit),
		}
	}

	static async getShows(movieId: string) {
		const results = await db
			.select({
				id: shows.id,
				movieId: shows.movieId,
				screenId: shows.screenId,
				screenName: cinemaScreens.name,
				startTime: shows.startTime,
				endTime: shows.endTime,
				basePrice: shows.basePrice,
				status: shows.status,
				availableSeats: shows.availableSeats,
			})
			.from(shows)
			.innerJoin(cinemaScreens, eq(shows.screenId, cinemaScreens.id))
			.where(eq(shows.movieId, movieId))

		return results
	}

	// ── Movie CRUD ──────────────────────────────────────────────────────────
	static async createMovie(data: MovieModel['createMovieBody']) {
		const existing = await db
			.select()
			.from(movies)
			.where(eq(movies.slug, data.slug))
			.limit(1)

		if (existing.length > 0) {
			throw status(400, { message: 'Movie slug already exists' })
		}

		const [newMovie] = await db
			.insert(movies)
			.values({
				title: data.title,
				slug: data.slug,
				description: data.description ?? null,
				language: data.language ?? null,
				releaseDate: new Date(data.releaseDate),
				duration: data.duration,
				rating: data.rating,
				price: data.price,
				posterId: data.posterId ?? null,
				trailerUrl: data.trailerUrl ?? null,
				cast: data.cast ?? null,
				crew: data.crew ?? null,
				isNowShowing: data.isNowShowing ?? false,
				isComingSoon: data.isComingSoon ?? false,
				status: (data.status as any) ?? 'COMING_SOON',
			})
			.returning()

		return newMovie
	}

	static async updateMovie(id: string, data: MovieModel['updateMovieBody']) {
		const [existing] = await db
			.select()
			.from(movies)
			.where(and(eq(movies.id, id), isNull(movies.deletedAt)))
			.limit(1)

		if (!existing) {
			throw status(404, { message: 'Movie not found' })
		}

		// Check slug uniqueness if being changed
		if (data.slug && data.slug !== existing.slug) {
			const slugConflict = await db
				.select({ id: movies.id })
				.from(movies)
				.where(eq(movies.slug, data.slug))
				.limit(1)
			if (slugConflict.length > 0) {
				throw status(400, { message: 'Slug already in use by another movie' })
			}
		}

		const updateData: Record<string, any> = {}
		if (data.title !== undefined) updateData.title = data.title
		if (data.slug !== undefined) updateData.slug = data.slug
		if (data.description !== undefined) updateData.description = data.description
		if (data.language !== undefined) updateData.language = data.language
		if (data.releaseDate !== undefined) updateData.releaseDate = new Date(data.releaseDate)
		if (data.duration !== undefined) updateData.duration = data.duration
		if (data.rating !== undefined) updateData.rating = data.rating
		if (data.price !== undefined) updateData.price = data.price
		if (data.posterId !== undefined) updateData.posterId = data.posterId
		if (data.trailerUrl !== undefined) updateData.trailerUrl = data.trailerUrl
		if (data.cast !== undefined) updateData.cast = data.cast
		if (data.crew !== undefined) updateData.crew = data.crew
		if (data.isNowShowing !== undefined) updateData.isNowShowing = data.isNowShowing
		if (data.isComingSoon !== undefined) updateData.isComingSoon = data.isComingSoon
		if (data.status !== undefined) updateData.status = data.status

		if (Object.keys(updateData).length > 0) {
			await db.update(movies).set(updateData).where(eq(movies.id, id))
		}

		return { success: true, message: 'Movie updated successfully' }
	}

	static async deleteMovie(id: string) {
		const [existing] = await db
			.select()
			.from(movies)
			.where(and(eq(movies.id, id), isNull(movies.deletedAt)))
			.limit(1)

		if (!existing) {
			throw status(404, { message: 'Movie not found' })
		}

		// Soft delete
		await db.update(movies).set({ deletedAt: new Date() }).where(eq(movies.id, id))

		return { success: true, message: 'Movie deleted successfully' }
	}

	// ── Show CRUD ────────────────────────────────────────────────────────────
	static async createShow(data: MovieModel['createShowBody']) {
		const [screen] = await db
			.select()
			.from(cinemaScreens)
			.where(eq(cinemaScreens.id, data.screenId))
			.limit(1)

		if (!screen) {
			throw status(400, { message: 'Screen not found' })
		}

		const [movie] = await db
			.select()
			.from(movies)
			.where(eq(movies.id, data.movieId))
			.limit(1)

		if (!movie) {
			throw status(400, { message: 'Movie not found' })
		}

		const [newShow] = await db
			.insert(shows)
			.values({
				movieId: data.movieId,
				screenId: data.screenId,
				startTime: new Date(data.startTime),
				endTime: new Date(data.endTime),
				basePrice: data.basePrice,
				availableSeats: data.availableSeats,
				status: 'SCHEDULED',
			})
			.returning()

		const screenSeats = await db
			.select()
			.from(seats)
			.where(eq(seats.screenId, data.screenId))

		if (screenSeats.length > 0) {
			await db.insert(showSeats).values(
				screenSeats.map((seat) => ({
					showId: newShow.id,
					seatId: seat.id,
					status: 'AVAILABLE' as const,
				}))
			)
		}

		return newShow
	}

	static async getAdminShows(params: { search?: string; page?: number; limit?: number }) {
		const page = Number(params.page) || 1
		const limit = Number(params.limit) || 10
		const offset = (page - 1) * limit

		const query = db
			.select({
				id: shows.id,
				movieId: shows.movieId,
				movieTitle: movies.title,
				screenId: shows.screenId,
				screenName: cinemaScreens.name,
				theaterName: theatersTable.name,
				startTime: shows.startTime,
				endTime: shows.endTime,
				basePrice: shows.basePrice,
				status: shows.status,
				availableSeats: shows.availableSeats,
			})
			.from(shows)
			.innerJoin(movies, eq(shows.movieId, movies.id))
			.innerJoin(cinemaScreens, eq(shows.screenId, cinemaScreens.id))
			.innerJoin(theatersTable, eq(cinemaScreens.theatreId, theatersTable.id))

		const conditions = []
		if (params.search) {
			conditions.push(ilike(movies.title, `%${params.search}%`))
		}

		if (conditions.length > 0) {
			query.where(and(...conditions))
		}

		const results = await query.limit(limit).offset(offset).orderBy(desc(shows.startTime))

		const totalQuery = db.select({ count: sql`count(*)`.mapWith(Number) }).from(shows)
		if (conditions.length > 0) {
			totalQuery.innerJoin(movies, eq(shows.movieId, movies.id)).where(and(...conditions))
		}

		const [{ count: total }] = await totalQuery

		return {
			items: results,
			total,
			page,
			limit,
			pages: Math.ceil(total / limit),
		}
	}

	static async getShowById(id: string) {
		const [show] = await db
			.select({
				id: shows.id,
				movieId: shows.movieId,
				screenId: shows.screenId,
				startTime: shows.startTime,
				endTime: shows.endTime,
				basePrice: shows.basePrice,
				status: shows.status,
				availableSeats: shows.availableSeats,
			})
			.from(shows)
			.where(eq(shows.id, id))
			.limit(1)

		if (!show) {
			throw status(404, { message: 'Show not found' })
		}
		return show
	}

	static async updateShow(id: string, data: MovieModel['updateShowBody']) {
		const [existing] = await db.select().from(shows).where(eq(shows.id, id)).limit(1)
		if (!existing) {
			throw status(404, { message: 'Show not found' })
		}

		const updateData: any = {}
		if (data.startTime) updateData.startTime = new Date(data.startTime)
		if (data.endTime) updateData.endTime = new Date(data.endTime)
		if (data.basePrice !== undefined) updateData.basePrice = data.basePrice
		if (data.status) updateData.status = data.status
		if (data.availableSeats !== undefined) updateData.availableSeats = data.availableSeats

		if (Object.keys(updateData).length > 0) {
			await db.update(shows).set(updateData).where(eq(shows.id, id))
		}

		return { success: true, message: 'Show updated successfully' }
	}

	static async deleteShow(id: string) {
		const [existing] = await db.select().from(shows).where(eq(shows.id, id)).limit(1)
		if (!existing) {
			throw status(404, { message: 'Show not found' })
		}

		await db.delete(showSeats).where(eq(showSeats.showId, id))
		await db.delete(shows).where(eq(shows.id, id))

		return { success: true, message: 'Show deleted successfully' }
	}

	// ── Genre CRUD ───────────────────────────────────────────────────────────
	static async listGenres() {
		return await db
			.select({
				id: genres.id,
				name: genres.name,
				slug: genres.slug,
				createdAt: genres.createdAt,
			})
			.from(genres)
			.orderBy(genres.name)
	}

	static async createGenre(data: MovieModel['createGenreBody']) {
		const existing = await db
			.select()
			.from(genres)
			.where(or(eq(genres.name, data.name), eq(genres.slug, data.slug)))
			.limit(1)

		if (existing.length > 0) {
			throw status(400, { message: 'Genre name or slug already exists' })
		}

		const [genre] = await db
			.insert(genres)
			.values({ name: data.name, slug: data.slug })
			.returning()

		return genre
	}

	static async updateGenre(id: string, data: MovieModel['updateGenreBody']) {
		const [existing] = await db.select().from(genres).where(eq(genres.id, id)).limit(1)
		if (!existing) {
			throw status(404, { message: 'Genre not found' })
		}

		const updateData: any = {}
		if (data.name !== undefined) updateData.name = data.name
		if (data.slug !== undefined) updateData.slug = data.slug

		if (Object.keys(updateData).length > 0) {
			await db.update(genres).set(updateData).where(eq(genres.id, id))
		}

		return { success: true, message: 'Genre updated successfully' }
	}

	static async deleteGenre(id: string) {
		const [existing] = await db.select().from(genres).where(eq(genres.id, id)).limit(1)
		if (!existing) {
			throw status(404, { message: 'Genre not found' })
		}

		await db.delete(genres).where(eq(genres.id, id))
		return { success: true, message: 'Genre deleted successfully' }
	}

	// ── Admin Reviews ────────────────────────────────────────────────────────
	static async listAdminReviews(params: { search?: string; page?: number; limit?: number }) {
		const page = Number(params.page) || 1
		const limit = Number(params.limit) || 10
		const offset = (page - 1) * limit

		const conditions: any[] = []
		if (params.search) {
			conditions.push(ilike(movies.title, `%${params.search}%`))
		}

		const results = await db
			.select({
				id: reviews.id,
				userId: reviews.userId,
				userName: usersTable.name,
				movieId: reviews.movieId,
				movieTitle: movies.title,
				rating: reviews.rating,
				title: reviews.title,
				comment: reviews.comment,
				isVerifiedPurchase: reviews.isVerifiedPurchase,
				isApproved: reviews.isApproved,
				likesCount: reviews.likesCount,
				createdAt: reviews.createdAt,
			})
			.from(reviews)
			.innerJoin(usersTable, eq(reviews.userId, usersTable.id))
			.innerJoin(movies, eq(reviews.movieId, movies.id))
			.where(conditions.length > 0 ? and(...conditions) : undefined)
			.orderBy(desc(reviews.createdAt))
			.limit(limit)
			.offset(offset)

		const [{ total }] = await db
			.select({ total: count() })
			.from(reviews)
			.innerJoin(movies, eq(reviews.movieId, movies.id))
			.where(conditions.length > 0 ? and(...conditions) : undefined)

		return {
			items: results.map(r => ({
				...r,
				isVerifiedPurchase: r.isVerifiedPurchase ?? false,
				isApproved: r.isApproved ?? true,
				likesCount: r.likesCount ?? 0,
			})),
			total,
			page,
			limit,
			pages: Math.ceil(total / limit),
		}
	}

	static async updateReviewApproval(id: string, isApproved: boolean) {
		const [existing] = await db.select().from(reviews).where(eq(reviews.id, id)).limit(1)
		if (!existing) {
			throw status(404, { message: 'Review not found' })
		}

		await db.update(reviews).set({ isApproved }).where(eq(reviews.id, id))
		return { success: true, message: `Review ${isApproved ? 'approved' : 'rejected'} successfully` }
	}

	static async deleteReview(id: string) {
		const [existing] = await db.select().from(reviews).where(eq(reviews.id, id)).limit(1)
		if (!existing) {
			throw status(404, { message: 'Review not found' })
		}

		await db.delete(reviews).where(eq(reviews.id, id))
		return { success: true, message: 'Review deleted successfully' }
	}

	// ── Analytics ────────────────────────────────────────────────────────────
	static async getAnalytics() {
		const [totalMoviesRow] = await db
			.select({ count: count() })
			.from(movies)
			.where(isNull(movies.deletedAt))

		const [nowShowingRow] = await db
			.select({ count: count() })
			.from(movies)
			.where(and(eq(movies.isNowShowing, true), isNull(movies.deletedAt)))

		const [comingSoonRow] = await db
			.select({ count: count() })
			.from(movies)
			.where(and(eq(movies.isComingSoon, true), isNull(movies.deletedAt)))

		const [totalReviewsRow] = await db
			.select({ count: count() })
			.from(reviews)

		const [avgRatingRow] = await db
			.select({ avg: sql<string>`COALESCE(AVG(${reviews.rating})::numeric(3,2)::text, '0.00')` })
			.from(reviews)
			.where(eq(reviews.isApproved, true))

		const [revenueRow] = await db
			.select({ revenue: sql<string>`COALESCE(SUM(${bookings.totalAmount})::text, '0.00')` })
			.from(bookings)
			.innerJoin(shows, eq(bookings.showId, shows.id))
			.where(eq(bookings.status, 'CONFIRMED'))

		// Top 5 movies by booking count
		const topMovies = await db
			.select({
				id: movies.id,
				title: movies.title,
				posterUrl: images.url,
				totalBookings: sql<number>`COUNT(${bookings.id})`.mapWith(Number),
				revenue: sql<string>`COALESCE(SUM(${bookings.totalAmount})::text, '0.00')`,
				averageRating: movies.averageRating,
			})
			.from(movies)
			.leftJoin(images, eq(movies.posterId, images.id))
			.leftJoin(shows, eq(shows.movieId, movies.id))
			.leftJoin(bookings, and(eq(bookings.showId, shows.id), eq(bookings.status, 'CONFIRMED')))
			.where(isNull(movies.deletedAt))
			.groupBy(movies.id)
			.orderBy(desc(sql`COUNT(${bookings.id})`))
			.limit(5)

		return {
			totalMovies: totalMoviesRow.count,
			nowShowing: nowShowingRow.count,
			comingSoon: comingSoonRow.count,
			totalReviews: totalReviewsRow.count,
			avgRating: avgRatingRow.avg || '0.00',
			totalRevenue: revenueRow.revenue || '0.00',
			topMovies: topMovies.map(m => ({
				id: m.id,
				title: m.title,
				posterUrl: m.posterUrl,
				totalBookings: m.totalBookings,
				revenue: m.revenue,
				averageRating: m.averageRating,
			})),
		}
	}
}
