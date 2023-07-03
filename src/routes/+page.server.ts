import { redirect } from '@sveltejs/kit'

export const load = async ({ url, locals: { getSession } }) => {
  const session = await getSession()

  // if the user is already logged in return them to the account page
  if (session) {
    throw redirect(303, '/home')
  }

  return { url: url.origin }
}

export const actions = {
  login: async ({request, locals: {supabase}}) => {
    const formData = await request.formData();
    const email: string = formData.get('username')
    const password: string = formData.get('password')

    const {error} = await supabase.auth.signInWithPassword({email: email, password: password})

    if(error){
      //TODO: Replace with actual error handling
      console.log(error)
    }
  },
  signup: async ({request, locals: {supabase}}) => {
    const formData = await request.formData();
    const email: string = formData.get('username')
    const password: string = formData.get('password')

    const {error} = await supabase.auth.signUp({
      email: email, password: password, options: {emailRedirectTo: '/auth/callback'}
    })

    if(error){
      //TODO: Replace with actual error handling
      console.log(error)
    }
  }
}
