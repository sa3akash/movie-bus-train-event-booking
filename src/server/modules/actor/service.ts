import { db } from '@/server/db'
import { actors } from '@/server/db/schemas'
import { eq, ilike, or } from 'drizzle-orm'
import { status } from 'elysia'
import type { ActorModel } from './model'

export abstract class ActorService {
	static async create(data: ActorModel['createBody']) {
		// Check if slug is unique
		const existing = await db
			.select()
			.from(actors)
			.where(eq(actors.slug, data.slug))
			.limit(1)

		if (existing.length > 0) {
			throw status(400, { message: 'Slug already exists' } as ActorModel['errorResponse'])
		}

		const [actor] = await db
			.insert(actors)
			.values({
				name: data.name,
				slug: data.slug,
				bio: data.bio ?? null,
				imageUrl: data.imageUrl ?? null,
				birthDate: data.birthDate ? new Date(data.birthDate) : null,
				birthPlace: data.birthPlace ?? null,
			})
			.returning()

		return actor
	}

	static async list(search?: string) {
		const query = db
			.select({
				id: actors.id,
				name: actors.name,
				slug: actors.slug,
				imageUrl: actors.imageUrl,
			})
			.from(actors)

		if (search) {
			query.where(
				or(
					ilike(actors.name, `%${search}%`),
					ilike(actors.slug, `%${search}%`)
				)
			)
		}

		return await query
	}

	static async findById(id: string) {
		const [actor] = await db
			.select()
			.from(actors)
			.where(eq(actors.id, id))
			.limit(1)

		if (!actor) {
			throw status(404, { message: 'Actor not found' } as ActorModel['errorResponse'])
		}

		return actor
	}

	static async findBySlug(slug: string) {
		const [actor] = await db
			.select()
			.from(actors)
			.where(eq(actors.slug, slug))
			.limit(1)

		if (!actor) {
			throw status(404, { message: 'Actor not found' } as ActorModel['errorResponse'])
		}

		return actor
	}

	static async update(id: string, data: ActorModel['updateBody']) {
		// Check if actor exists
		await this.findById(id)

		// Check if slug is taken by another actor
		if (data.slug) {
			const existing = await db
				.select()
				.from(actors)
				.where(eq(actors.slug, data.slug))
				.limit(1)

			if (existing.length > 0 && existing[0].id !== id) {
				throw status(400, { message: 'Slug already exists' } as ActorModel['errorResponse'])
			}
		}

		const [updated] = await db
			.update(actors)
			.set({
				...data,
				birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
			})
			.where(eq(actors.id, id))
			.returning()

		return updated
	}

	static async delete(id: string) {
		await this.findById(id)

		const [deleted] = await db
			.delete(actors)
			.where(eq(actors.id, id))
			.returning()

		return deleted
	}
}
