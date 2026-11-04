import { db, schema } from 'hub:db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  if (!session.user || !session.user.id) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized. Please log in first.'
    })
  }

  const now = new Date()

  await db.update(schema.users).set({
    consentGiven: true,
    consentGivenAt: now
  }).where(eq(schema.users.id, session.user.id))

  await setUserSession(event, {
    user: {
      ...session.user,
      consentGiven: true,
      consentGivenAt: now.toISOString()
    }
  })

  return {
    success: true,
    consentGiven: true,
    consentGivenAt: now.toISOString()
  }
})
