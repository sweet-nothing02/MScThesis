import { db, schema } from 'hub:db'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

const neptunSchema = z.object({
  neptunCode: z.string().trim().length(6, 'Neptun code must be exactly 6 characters').regex(/^[A-Za-z0-9]{6}$/, 'Neptun code must contain only letters and numbers')
})

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const body = await readValidatedBody(event, neptunSchema.parse)
  const code = body.neptunCode.toUpperCase()

  let user = await db.query.users.findFirst({
    where: () => and(
      eq(schema.users.provider, 'neptun'),
      eq(schema.users.providerId, code)
    )
  })

  if (!user) {
    const [newUser] = await db.insert(schema.users).values({
      id: crypto.randomUUID(),
      name: `Student (${code})`,
      username: code,
      email: `${code.toLowerCase()}@stud.uni.hu`,
      avatar: '',
      provider: 'neptun',
      providerId: code,
      role: 'student',
      neptunCode: code,
      consentGiven: false
    }).returning()
    user = newUser
  }

  if (!user) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to authenticate user.'
    })
  }

  // If there were anonymous chats associated with current session ID, reassign to this user
  if (session.id) {
    await db.update(schema.chats).set({
      userId: user.id
    }).where(eq(schema.chats.userId, session.id))
  }

  await setUserSession(event, {
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      provider: 'neptun',
      providerId: code,
      role: 'student',
      neptunCode: code,
      consentGiven: Boolean(user.consentGiven),
      consentGivenAt: user.consentGivenAt ? new Date(user.consentGivenAt).toISOString() : null
    }
  })

  return {
    success: true,
    consentGiven: Boolean(user.consentGiven)
  }
})
