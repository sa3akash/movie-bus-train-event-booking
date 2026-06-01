import { t, type UnwrapSchema } from 'elysia'

export const MovieModel = {
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
	createMovieBody: t.Object({
		title: t.String(),
		slug: t.String(),
		description: t.Optional(t.String()),
		language: t.Optional(t.String()),
		releaseDate: t.String(),
		duration: t.Number(),
		rating: t.String(),
		price: t.String(),
		posterUrl: t.Optional(t.String()),
		trailerUrl: t.Optional(t.String()),
		cast: t.Optional(t.Any()),
		crew: t.Optional(t.Any()),
		isNowShowing: t.Optional(t.Boolean()),
		isComingSoon: t.Optional(t.Boolean()),
	}),
	createShowBody: t.Object({
		movieId: t.String(),
		screenId: t.String(),
		startTime: t.String(),
		endTime: t.String(),
		basePrice: t.String(),
		availableSeats: t.Number(),
	}),
	errorResponse: t.Object({
		message: t.String(),
	}),
} as const

export type MovieModel = {
	[k in keyof typeof MovieModel]: UnwrapSchema<typeof MovieModel[k]>
}
