// Model defines the data structure and validation for the request and response
import { t, type UnwrapSchema } from 'elysia'

export const ActorModel = {
	createBody: t.Object({
		name: t.String({ minLength: 1 }),
		slug: t.String({ minLength: 1 }),
		bio: t.Optional(t.String()),
		imageUrl: t.Optional(t.String()),
		birthDate: t.Optional(t.String()), // ISO format string
		birthPlace: t.Optional(t.String()),
	}),
	updateBody: t.Object({
		name: t.Optional(t.String({ minLength: 1 })),
		slug: t.Optional(t.String({ minLength: 1 })),
		bio: t.Optional(t.String()),
		imageUrl: t.Optional(t.String()),
		birthDate: t.Optional(t.String()),
		birthPlace: t.Optional(t.String()),
	}),
	actorResponse: t.Object({
		id: t.String(),
		name: t.String(),
		slug: t.String(),
		bio: t.Nullable(t.String()),
		imageUrl: t.Nullable(t.String()),
		birthDate: t.Nullable(t.Any()),
		birthPlace: t.Nullable(t.String()),
		createdAt: t.Any(),
		updatedAt: t.Any(),
	}),
	listResponse: t.Array(
		t.Object({
			id: t.String(),
			name: t.String(),
			slug: t.String(),
			imageUrl: t.Nullable(t.String()),
		})
	),
	errorResponse: t.Object({
		message: t.String(),
	}),
} as const

// Cast all models to TypeScript types
export type ActorModel = {
	[k in keyof typeof ActorModel]: UnwrapSchema<typeof ActorModel[k]>
}
