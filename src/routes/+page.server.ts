import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load = (async ({ url, locals: { getSession } }) => {
  const session = await getSession()

  // if the user is already logged in return them to the account page
  if (session) {
    throw redirect(303, '/home')
  }

  return { url: url.origin }
}) satisfies PageServerLoad

export const actions = {
  login: async ({request, locals: {supabase}}) => {
    const formData = await request.formData();
    const email: FormDataEntryValue | null = formData.get('username')
    const password: FormDataEntryValue | null = formData.get('password')

    if(email !== null && password !== null){
      const {error} = await supabase.auth.signInWithPassword({email: email.toString(), password: password.toString()})

        if(error){
          return fail(400, {error, success: false})
      }
    }
  },
  signup: async ({request, locals: {supabase}}) => {
    const formData = await request.formData();
    const email: FormDataEntryValue | null = formData.get('username')
    const password: FormDataEntryValue | null = formData.get('password')

    if(email !== null && password !== null){
      const {error} = await supabase.auth.signUp({
        email: email.toString(), password: password.toString(), options: {emailRedirectTo: '/auth/callback'}
      })
      if(error){
        console.log(error)
      }
    }

  }
} satisfies Actions
