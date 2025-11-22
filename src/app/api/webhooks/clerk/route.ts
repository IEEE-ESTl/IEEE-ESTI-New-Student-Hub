import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { supabase } from '@/config/supabaseClient'
import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(req: Request) {
  // 1. Obtener el secreto del dashboard de Clerk
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Por favor agrega CLERK_WEBHOOK_SECRET a .env.local')
  }

  // 2. Obtener los headers para verificación
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Faltan headers svix', { status: 400 })
  }

  // 3. Obtener el cuerpo (body)
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // 4. Verificar la firma
  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verificando webhook:', err)
    return new Response('Error occured', { status: 400 })
  }

  // 5. Manejar el evento
  const eventType = evt.type

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, unsafe_metadata } = evt.data

    const email = email_addresses[0]?.email_address
    const fullName = `${first_name || ''} ${last_name || ''}`.trim()

    // Insertar en Supabase
    const { error } = await supabase
      .from('user')
      .upsert({
        email: email, // Clave de busqueda
        clerk_id: id, // Actualizamos el ID real de Clerk
        fullname: fullName,
        role_id: 3,
        updated_at: new Date().toISOString()
      }, { onConflict: 'email' })

    if (error) {
        console.error('Error insertando usuario en Supabase:', error)
        return NextResponse.json({ error: 'Error en DB' }, { status: 500 })
    }
    
    console.log(`Usuario ${id} creado exitosamente en Supabase`)
  }
  
  // Aquí puedes agregar lógica para 'user.updated' y 'user.deleted'

  return NextResponse.json({ success: true, message: 'Webhook recibido' }, { status: 200 })
}