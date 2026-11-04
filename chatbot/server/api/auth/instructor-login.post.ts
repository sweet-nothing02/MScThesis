import { db, schema } from 'hub:db'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

const instructorSchema = z.object({
  name: z.string().trim().optional()
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, (b) => instructorSchema.parse(b || {})).catch(() => ({ name: 'Course Instructor' }))
  const instructorName = body.name || 'Course Instructor'

  let user = await db.query.users.findFirst({
    where: () => and(
      eq(schema.users.provider, 'instructor'),
      eq(schema.users.providerId, 'instructor')
    )
  })

  if (!user) {
    const [newUser] = await db.insert(schema.users).values({
      id: crypto.randomUUID(),
      name: instructorName,
      username: 'instructor',
      email: 'instructor@uni.hu',
      avatar: '',
      provider: 'instructor',
      providerId: 'instructor',
      role: 'instructor',
      consentGiven: true
    }).returning()
    user = newUser
  }

  if (!user) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to authenticate instructor.'
    })
  }

  await setUserSession(event, {
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      provider: 'instructor',
      providerId: 'instructor',
      role: 'instructor',
      consentGiven: true
    }
  })

  return {
    success: true
  }
})
