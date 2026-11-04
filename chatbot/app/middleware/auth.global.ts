export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn, user } = useUserSession()

  // Allow login page when not logged in
  if (!loggedIn.value) {
    if (to.path !== '/login') {
      return navigateTo('/login')
    }
    return
  }

  // User is logged in
  const role = user.value?.role || 'student'

  // Instructor flow
  if (role === 'instructor') {
    if (to.path === '/login') {
      return navigateTo('/instructor')
    }
    return
  }

  // Student flow
  const consentGiven = Boolean(user.value?.consentGiven)

  if (!consentGiven) {
    if (to.path !== '/consent') {
      return navigateTo('/consent')
    }
    return
  }

  // Student has given consent
  if (to.path === '/login' || to.path === '/consent') {
    return navigateTo('/instructions')
  }

  if (to.path === '/instructor') {
    return navigateTo('/')
  }
})
