import { db } from '@/server/db'
import { movies, shows, cinemaScreens, seats, showSeats, theatersTable } from '@/server/db/schemas'
import { eq, and, ilike, or, desc, sql } from 'drizzle-orm'
import { status } from 'elysia'
import type { MovieModel } from './model'

export abstract class MovieService {
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
				posterUrl: movies.posterUrl,
			})
			.from(movies)

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

		if (conditions.length > 0) {
			query.where(and(...conditions))
		}

		return await query
	}

	static async findBySlug(slug: string) {
		const [movie] = await db
			.select()
			.from(movies)
			.where(eq(movies.slug, slug))
			.limit(1)

		if (!movie) {
			throw status(404, { message: 'Movie not found' })
		}

		return movie
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
				posterUrl: data.posterUrl ?? null,
				trailerUrl: data.trailerUrl ?? null,
				cast: data.cast ?? null,
				crew: data.crew ?? null,
				isNowShowing: data.isNowShowing ?? false,
				isComingSoon: data.isComingSoon ?? false,
			})
			.returning()

		return newMovie
	}

	static async createShow(data: MovieModel['createShowBody']) {
		const [screen] = await db
			.select()
			.from(cinemaScreens)
			.where(eq(cinemaScreens.id, data.screenId))
			.limit(1)

		if (!screen) {
			throw status(400, { message: 'Screen not found' })
		}

		// Check if movie exists
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

		// Get all seats defined for this screen
		const screenSeats = await db
			.select()
			.from(seats)
			.where(eq(seats.screenId, data.screenId))

		// Populate show_seats dynamically
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
		const page = Number(params.page) || 1;
		const limit = Number(params.limit) || 10;
		const offset = (page - 1) * limit;

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
			.innerJoin(theatersTable, eq(cinemaScreens.theatreId, theatersTable.id));

		const conditions = [];
		if (params.search) {
			conditions.push(ilike(movies.title, `%${params.search}%`));
		}

		if (conditions.length > 0) {
			query.where(and(...conditions));
		}

		const results = await query.limit(limit).offset(offset).orderBy(desc(shows.startTime));
		
		const totalQuery = db.select({ count: sql`count(*)`.mapWith(Number) }).from(shows);
		if (conditions.length > 0) {
			totalQuery.innerJoin(movies, eq(shows.movieId, movies.id)).where(and(...conditions));
		}
		
		const [{ count }] = await totalQuery;

		return {
			items: results,
			total: count,
			page,
			limit,
			pages: Math.ceil(count / limit),
		};
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
			.limit(1);

		if (!show) {
			throw status(404, { message: 'Show not found' });
		}
		return show;
	}

	static async updateShow(id: string, data: MovieModel['updateShowBody']) {
		const [existing] = await db.select().from(shows).where(eq(shows.id, id)).limit(1);
		if (!existing) {
			throw status(404, { message: 'Show not found' });
		}

		const updateData: any = {};
		if (data.startTime) updateData.startTime = new Date(data.startTime);
		if (data.endTime) updateData.endTime = new Date(data.endTime);
		if (data.basePrice !== undefined) updateData.basePrice = data.basePrice;
		if (data.status) updateData.status = data.status;
		if (data.availableSeats !== undefined) updateData.availableSeats = data.availableSeats;

		if (Object.keys(updateData).length > 0) {
			await db.update(shows).set(updateData).where(eq(shows.id, id));
		}

		return { success: true, message: 'Show updated successfully' };
	}

	static async deleteShow(id: string) {
		const [existing] = await db.select().from(shows).where(eq(shows.id, id)).limit(1);
		if (!existing) {
			throw status(404, { message: 'Show not found' });
		}

		// Also delete associated show_seats (cascade takes care of it if configured, but let's be explicit or rely on cascade)
		await db.delete(showSeats).where(eq(showSeats.showId, id));
		await db.delete(shows).where(eq(shows.id, id));

		return { success: true, message: 'Show deleted successfully' };
	}
}
