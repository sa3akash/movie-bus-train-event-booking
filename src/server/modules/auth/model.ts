import { t, type UnwrapSchema } from 'elysia'

export const AuthModel = {
	signUpBody: t.Object({
		name: t.String({ minLength: 1 }),
		email: t.String({ format: 'email' }),
		password: t.String({ minLength: 6 }),
	}),
	signInBody: t.Object({
		email: t.String({ format: 'email' }),
		password: t.String(),
	}),
	authResponse: t.Object({
		token: t.String(),
		user: t.Object({
			id: t.String(),
			name: t.String(),
			email: t.String(),
		}),
	}),
	userResponse: t.Object({
		id: t.String(),
		name: t.String(),
		email: t.String(),
		isEmailVerified: t.Nullable(t.Boolean()),
	}),
	errorResponse: t.Object({
		message: t.String(),
	}),
} as const

export type AuthModel = {
	[k in keyof typeof AuthModel]: UnwrapSchema<typeof AuthModel[k]>
}
