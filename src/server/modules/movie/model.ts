import { t, type UnwrapSchema } from 'elysia'

export const MovieModel = {
	// ── Movie responses ──────────────────────────────────────────────────────
	movieResponse: t.Object({
		id: t.String(),
		title: t.String(),
		slug: t.String(),
		description: t.Nullable(t.String()),
		genre: t.Nullable(t.Any()),
		language: t.Nullable(t.String()),
		releaseDate: t.Any(),
		duration: t.Number(),
		rating: t.String(),
		price: t.String(),
		status: t.String(),
		posterUrl: t.Nullable(t.String()),
		trailerUrl: t.Nullable(t.String()),
		cast: t.Nullable(t.Any()),
		crew: t.Nullable(t.Any()),
		averageRating: t.Nullable(t.String()),
		totalReviews: t.Nullable(t.Number()),
		isNowShowing: t.Nullable(t.Boolean()),
		isComingSoon: t.Nullable(t.Boolean()),
	}),
	listResponse: t.Array(
		t.Object({
			id: t.String(),
			title: t.String(),
			slug: t.String(),
			language: t.Nullable(t.String()),
			releaseDate: t.Any(),
			duration: t.Number(),
			rating: t.String(),
			price: t.String(),
			posterUrl: t.Nullable(t.String()),
		})
	),
	// Paginated admin movie list
	adminMovieListResponse: t.Object({
		items: t.Array(
			t.Object({
				id: t.String(),
				title: t.String(),
				slug: t.String(),
				status: t.String(),
				language: t.Nullable(t.String()),
				releaseDate: t.Any(),
				duration: t.Number(),
				rating: t.String(),
				price: t.String(),
				posterId: t.Nullable(t.String()),
				posterUrl: t.Nullable(t.String()),
				isNowShowing: t.Nullable(t.Boolean()),
				isComingSoon: t.Nullable(t.Boolean()),
				totalReviews: t.Nullable(t.Number()),
				averageRating: t.Nullable(t.String()),
			})
		),
		total: t.Number(),
		page: t.Number(),
		limit: t.Number(),
		pages: t.Number(),
	}),

	// ── Show responses ────────────────────────────────────────────────────────
	showResponse: t.Object({
		id: t.String(),
		movieId: t.String(),
		screenId: t.String(),
		startTime: t.Any(),
		endTime: t.Any(),
		basePrice: t.String(),
		status: t.String(),
		availableSeats: t.Number(),
	}),
	showsListResponse: t.Array(
		t.Object({
			id: t.String(),
			movieId: t.String(),
			screenId: t.String(),
			screenName: t.String(),
			startTime: t.Any(),
			endTime: t.Any(),
			basePrice: t.String(),
			status: t.String(),
			availableSeats: t.Number(),
		})
	),
	adminShowsResponse: t.Object({
		items: t.Array(
			t.Object({
				id: t.String(),
				movieId: t.String(),
				movieTitle: t.String(),
				screenId: t.String(),
				screenName: t.String(),
				theaterName: t.String(),
				startTime: t.Any(),
				endTime: t.Any(),
				basePrice: t.String(),
				status: t.String(),
				availableSeats: t.Number(),
			})
		),
		total: t.Number(),
		page: t.Number(),
		limit: t.Number(),
		pages: t.Number(),
	}),

	// ── Genre responses ───────────────────────────────────────────────────────
	genreResponse: t.Object({
		id: t.String(),
		name: t.String(),
		slug: t.String(),
		createdAt: t.Any(),
	}),
	genreListResponse: t.Array(
		t.Object({
			id: t.String(),
			name: t.String(),
			slug: t.String(),
			createdAt: t.Any(),
		})
	),

	// ── Review admin responses ────────────────────────────────────────────────
	adminReviewListResponse: t.Object({
		items: t.Array(
			t.Object({
				id: t.String(),
				userId: t.String(),
				userName: t.Nullable(t.String()),
				movieId: t.String(),
				movieTitle: t.String(),
				rating: t.Number(),
				title: t.Nullable(t.String()),
				comment: t.Nullable(t.String()),
				isVerifiedPurchase: t.Boolean(),
				isApproved: t.Boolean(),
				likesCount: t.Number(),
				createdAt: t.Any(),
			})
		),
		total: t.Number(),
		page: t.Number(),
		limit: t.Number(),
		pages: t.Number(),
	}),

	// ── Analytics response ────────────────────────────────────────────────────
	analyticsResponse: t.Object({
		totalMovies: t.Number(),
		nowShowing: t.Number(),
		comingSoon: t.Number(),
		totalReviews: t.Number(),
		avgRating: t.String(),
		totalRevenue: t.String(),
		topMovies: t.Array(
			t.Object({
				id: t.String(),
				title: t.String(),
				posterUrl: t.Nullable(t.String()),
				totalBookings: t.Number(),
				revenue: t.String(),
				averageRating: t.Nullable(t.String()),
			})
		),
	}),

	// ── Request bodies ────────────────────────────────────────────────────────
	createMovieBody: t.Object({
		title: t.String(),
		slug: t.String(),
		description: t.Optional(t.String()),
		language: t.Optional(t.String()),
		releaseDate: t.String(),
		duration: t.Number(),
		rating: t.String(),
		price: t.String(),
		posterId: t.Optional(t.String()),
		trailerUrl: t.Optional(t.String()),
		cast: t.Optional(t.Any()),
		crew: t.Optional(t.Any()),
		isNowShowing: t.Optional(t.Boolean()),
		isComingSoon: t.Optional(t.Boolean()),
		status: t.Optional(t.String()),
	}),
	updateMovieBody: t.Object({
		title: t.Optional(t.String()),
		slug: t.Optional(t.String()),
		description: t.Optional(t.Nullable(t.String())),
		language: t.Optional(t.Nullable(t.String())),
		releaseDate: t.Optional(t.String()),
		duration: t.Optional(t.Number()),
		rating: t.Optional(t.String()),
		price: t.Optional(t.String()),
		posterId: t.Optional(t.Nullable(t.String())),
		trailerUrl: t.Optional(t.Nullable(t.String())),
		cast: t.Optional(t.Any()),
		crew: t.Optional(t.Any()),
		isNowShowing: t.Optional(t.Boolean()),
		isComingSoon: t.Optional(t.Boolean()),
		status: t.Optional(t.String()),
	}),
	createGenreBody: t.Object({
		name: t.String(),
		slug: t.String(),
	}),
	updateGenreBody: t.Object({
		name: t.Optional(t.String()),
		slug: t.Optional(t.String()),
	}),
	createShowBody: t.Object({
		movieId: t.String(),
		screenId: t.String(),
		startTime: t.String(),
		endTime: t.String(),
		basePrice: t.String(),
		availableSeats: t.Number(),
	}),
	updateShowBody: t.Object({
		startTime: t.Optional(t.String()),
		endTime: t.Optional(t.String()),
		basePrice: t.Optional(t.String()),
		status: t.Optional(t.String()),
		availableSeats: t.Optional(t.Number()),
	}),
	updateReviewApprovalBody: t.Object({
		isApproved: t.Boolean(),
	}),
	errorResponse: t.Object({
		message: t.String(),
	}),
	successResponse: t.Object({
		success: t.Boolean(),
		message: t.String(),
	}),
} as const

export type MovieModel = {
	[k in keyof typeof MovieModel]: UnwrapSchema<typeof MovieModel[k]>
}
