// Service handles business logic, decoupled from Elysia controller
import { status } from 'elysia'

import type { AuthModel } from './model'

// If a class doesn't need to store a property,
// you can use an `abstract class` to avoid class allocation
export abstract class Auth {
	static async signIn({ username, password }: AuthModel['signInBody']) {
		if (username !== 'admin' || password !== 'admin')
			throw status(
				400,
				'Invalid username or password' satisfies AuthModel['signInInvalid']
			)

		return {
			username,
			token: 'mock-token'
		}
	}
}