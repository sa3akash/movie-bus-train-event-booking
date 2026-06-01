import { Elysia, t } from 'elysia'
import { ActorService } from './service'
import { ActorModel } from './model'

export const actor = new Elysia({ prefix: '/actor' })
	.get(
		'/',
		async ({ query: { search } }) => {
			return await ActorService.list(search)
		},
		{
			query: t.Object({
				search: t.Optional(t.String()),
			}),
			response: {
				200: ActorModel.listResponse,
			},
		}
	)
	.post(
		'/',
		async ({ body }) => {
			return await ActorService.create(body)
		},
		{
			body: ActorModel.createBody,
			response: {
				200: ActorModel.actorResponse,
				400: ActorModel.errorResponse,
			},
		}
	)
	.get(
		'/:id',
		async ({ params: { id } }) => {
			return await ActorService.findById(id)
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			response: {
				200: ActorModel.actorResponse,
				404: ActorModel.errorResponse,
			},
		}
	)
	.get(
		'/slug/:slug',
		async ({ params: { slug } }) => {
			return await ActorService.findBySlug(slug)
		},
		{
			params: t.Object({
				slug: t.String(),
			}),
			response: {
				200: ActorModel.actorResponse,
				404: ActorModel.errorResponse,
			},
		}
	)
	.patch(
		'/:id',
		async ({ params: { id }, body }) => {
			return await ActorService.update(id, body)
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			body: ActorModel.updateBody,
			response: {
				200: ActorModel.actorResponse,
				400: ActorModel.errorResponse,
				404: ActorModel.errorResponse,
			},
		}
	)
	.delete(
		'/:id',
		async ({ params: { id } }) => {
			return await ActorService.delete(id)
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			response: {
				200: ActorModel.actorResponse,
				404: ActorModel.errorResponse,
			},
		}
	)
