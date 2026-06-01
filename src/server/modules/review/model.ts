import { t, type UnwrapSchema } from 'elysia'

export const ReviewModel = {
	createReviewBody: t.Object({
		movieId: t.String(),
		rating: t.Integer({ minimum: 1, maximum: 5 }),
		title: t.Optional(t.String()),
		comment: t.Optional(t.String()),
	}),
	reviewResponse: t.Object({
		id: t.String(),
		userId: t.String(),
		userName: t.String(),
		movieId: t.String(),
		rating: t.Integer(),
		title: t.Nullable(t.String()),
		comment: t.Nullable(t.String()),
		isVerifiedPurchase: t.Boolean(),
		likesCount: t.Integer(),
		isApproved: t.Boolean(),
		createdAt: t.Any(), // Can be Date or String representation
	}),
	listReviewsResponse: t.Array(
		t.Object({
			id: t.String(),
			userId: t.String(),
			userName: t.String(),
			movieId: t.String(),
			rating: t.Integer(),
			title: t.Nullable(t.String()),
			comment: t.Nullable(t.String()),
			isVerifiedPurchase: t.Boolean(),
			likesCount: t.Integer(),
			isApproved: t.Boolean(),
			createdAt: t.Any(),
		})
	),
	errorResponse: t.Object({
		message: t.String(),
	}),
} as const

export type ReviewModel = {
	[k in keyof typeof ReviewModel]: UnwrapSchema<typeof ReviewModel[k]>
}
