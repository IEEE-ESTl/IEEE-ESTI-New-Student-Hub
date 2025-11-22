// api/send/route.ts
import { Resend } from "resend"
import { NextRequest, NextResponse } from "next/server"

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
    try {

        const body = await request.json();
        const { nombreCompleto, email, telefono, razonUnirse, tipoParticipacion, rolStaff } = body;
    
        // Validar que tenemos los datos necesarios
        if (!nombreCompleto || !email || !telefono || !razonUnirse || !tipoParticipacion) {
          return NextResponse.json(
            { error: 'Faltan campos requeridos' },
            { status: 400 }
          );
        }

        const data = await resend.emails.send({
            from: 'IEEE Student Branch - ESTl <noreply@ieee-estl.com>',
            to: ['paulo.mantilla@ieee.org', 'mariolozano@ieee.org', 'lgmalkih@gmail.com'],
            subject: 'Nueva solicitud de unión a la IEEE Student Branch - ESTl',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #0371a4;">Nueva Solicitud de Unión - IEEE Student Branch ESTl</h2>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3>Información del Solicitante:</h3>
                        <p><strong>Nombre completo:</strong> ${nombreCompleto}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Teléfono:</strong> ${telefono}</p>
                        <p><strong>Tipo de participación:</strong> ${tipoParticipacion === 'member' ? 'Miembro' : 'Miembro del staff'}</p>
                        ${rolStaff ? `<p><strong>Rol de staff:</strong> ${rolStaff}</p>` : ''}
                    </div>
                    
                    <div style="background-color: #ffffff; padding: 20px; border-left: 4px solid #0371a4; margin: 20px 0;">
                        <h3>Razón para unirse:</h3>
                        <p style="line-height: 1.6;">${razonUnirse}</p>
                    </div>
                    
                    <p style="color: #666; font-size: 12px; margin-top: 30px;">
                        Este correo fue enviado automáticamente desde el formulario de solicitud de unión.
                    </p>
                </div>
            `
            });

        console.log(data);

        return NextResponse.json(
            { message: 'Email sent successfully' },
            { status: 200 },
        );
    } catch (error) {
        return NextResponse.json(
            { error: 'Error sending email' },
            { status: 500 },
        );
    }
}