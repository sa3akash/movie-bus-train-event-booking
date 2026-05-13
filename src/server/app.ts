import { Elysia, t } from 'elysia'

export const app = new Elysia({ prefix: '/api' })
    .get('/', 'Hello Nextjs from elysiajs!')
    .post('/', ({ body }) => body, {
        body: t.Object({
            name: t.String()
        })
    })
