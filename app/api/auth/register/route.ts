import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { ctfdCreateUser } from '@/lib/ctfd'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DIGITS_REGEX = /^\d+$/
const STUDY_LEVEL_OPTIONS = new Set(['Preparatoria', 'Licenciatura', 'Maestria', 'Doctorado'])
const SHIRT_SIZE_OPTIONS = new Set(['CH', 'M', 'G', 'XG', 'XXG'])

type RegisterProfilePayload = {
  firstName: string
  lastName: string
  age: number
  phone: string
  matricula?: number | null
  country: string
  career?: string
  studyLevel?: string
  ctfsAttended?: number | null
  shirtSize: string
  heardFrom: string
  emergencyName: string
  emergencyRelation: string
  emergencyPhone: string
  emergencyEmail: string
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, password, isTecCampus, profile } = body as {
      name: string
      email: string
      password: string
      isTecCampus?: boolean
      profile?: RegisterProfilePayload
    }

    // ── Validación básica en el servidor (nunca confíes solo en el cliente) ──
    if (!name || !email || !password || !profile) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 },
      )
    }
    if (name.length < 3 || name.length > 20 || /\s/.test(name)) {
      return NextResponse.json(
        { error: 'Username: 3-20 caracteres, sin espacios' },
        { status: 400 },
      )
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 },
      )
    }
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido', field: 'email' },
        { status: 400 },
      )
    }
    if (typeof isTecCampus !== 'boolean') {
      return NextResponse.json(
        { error: 'El campo de campus TEC es inválido', field: 'isTecCampus' },
        { status: 400 },
      )
    }

    if (!profile.firstName || profile.firstName.length < 2) {
      return NextResponse.json(
        { error: 'Nombre inválido', field: 'firstName' },
        { status: 400 },
      )
    }
    if (!profile.lastName || profile.lastName.length < 2) {
      return NextResponse.json(
        { error: 'Apellido inválido', field: 'lastName' },
        { status: 400 },
      )
    }
    if (!Number.isInteger(profile.age) || profile.age < 12 || profile.age > 99) {
      return NextResponse.json(
        { error: 'Edad inválida', field: 'age' },
        { status: 400 },
      )
    }
    if (!profile.phone || !DIGITS_REGEX.test(profile.phone) || profile.phone.length < 8 || profile.phone.length > 15) {
      return NextResponse.json(
        { error: 'Teléfono inválido', field: 'phone' },
        { status: 400 },
      )
    }
    if (profile.matricula != null && (!Number.isInteger(profile.matricula) || profile.matricula < 0)) {
      return NextResponse.json(
        { error: 'Matrícula inválida', field: 'matricula' },
        { status: 400 },
      )
    }
    if (!profile.country) {
      return NextResponse.json(
        { error: 'País de residencia es requerido', field: 'country' },
        { status: 400 },
      )
    }
    if (profile.studyLevel && !STUDY_LEVEL_OPTIONS.has(profile.studyLevel)) {
      return NextResponse.json(
        { error: 'Nivel de estudios inválido', field: 'studyLevel' },
        { status: 400 },
      )
    }
    if (profile.ctfsAttended != null && (!Number.isInteger(profile.ctfsAttended) || profile.ctfsAttended < 0)) {
      return NextResponse.json(
        { error: 'CTFs asistidos inválido', field: 'ctfsAttended' },
        { status: 400 },
      )
    }
    if (!profile.shirtSize || !SHIRT_SIZE_OPTIONS.has(profile.shirtSize)) {
      return NextResponse.json(
        { error: 'Talla de camisa inválida', field: 'shirtSize' },
        { status: 400 },
      )
    }
    if (!profile.heardFrom || profile.heardFrom.length < 3) {
      return NextResponse.json(
        { error: '¿Cómo te enteraste? es requerido', field: 'heardFrom' },
        { status: 400 },
      )
    }
    if (!profile.emergencyName || profile.emergencyName.length < 2) {
      return NextResponse.json(
        { error: 'Nombre de emergencia inválido', field: 'emergencyName' },
        { status: 400 },
      )
    }
    if (!profile.emergencyRelation || profile.emergencyRelation.length < 2) {
      return NextResponse.json(
        { error: 'Relación de emergencia inválida', field: 'emergencyRelation' },
        { status: 400 },
      )
    }
    if (
      !profile.emergencyPhone ||
      !DIGITS_REGEX.test(profile.emergencyPhone) ||
      profile.emergencyPhone.length < 8 ||
      profile.emergencyPhone.length > 15
    ) {
      return NextResponse.json(
        { error: 'Teléfono de emergencia inválido', field: 'emergencyPhone' },
        { status: 400 },
      )
    }
    if (!profile.emergencyEmail || !EMAIL_REGEX.test(profile.emergencyEmail)) {
      return NextResponse.json(
        { error: 'Correo de emergencia inválido', field: 'emergencyEmail' },
        { status: 400 },
      )
    }

    // ── Crear usuario en CTFd via admin token ───────────────────
    const result = await ctfdCreateUser({ name, email, password, isTecCampus, profile })

    if (!result.success || !result.data) {
      const ctfdErrors = result.errors ?? {}

      if (ctfdErrors.name)
        return NextResponse.json({ error: 'Ese username ya está en uso', field: 'name' }, { status: 409 })
      if (ctfdErrors.email)
        return NextResponse.json({ error: 'Ese email ya está registrado', field: 'email' }, { status: 409 })

      return NextResponse.json({ error: 'Error al crear la cuenta' }, { status: 502 })
    }

    const newUser = result.data

    // ── Crear sesión con iron-session ───────────────────────────
    const session = await getSession()
    session.userId = newUser.id
    session.username = newUser.name
    session.email = newUser.email
    session.isAdmin = newUser.type === 'admin'
    session.teamId   = null // Nuevo usuario no tiene equipo aún
    await session.save() // ← Firma, encripta y setea la cookie httpOnly

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    })
  } catch (err) {
    console.error('[register]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}