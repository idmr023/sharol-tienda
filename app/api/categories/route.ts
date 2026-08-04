import { NextResponse } from 'next/server'
import { categoryRepository } from '@backend/repositories/categoryRepository'
import { ValidationError } from '@backend/validation/errors'
import { authErrorResponse, requireAdmin } from '@backend/services/authSession'

export async function GET() {
  try {
    const categories = await categoryRepository.findAll()
    return NextResponse.json(categories)
  } catch (error) {
    console.error('GET /api/categories:', error)
    return NextResponse.json({ error: 'Error al obtener categorías' }, { status: 500 })
  }
}

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const body = await request.json().catch(() => ({}))
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    if (!name || name.length > 60) {
      throw new ValidationError('El nombre de la categoría es obligatorio (máx. 60 caracteres)')
    }
    const slug = slugify(name)
    if (!slug) {
      throw new ValidationError('El nombre de la categoría no es válido')
    }
    const category = await categoryRepository.create(name, slug)
    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    const auth = authErrorResponse(error)
    if (auth) return auth
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('POST /api/categories:', error)
    return NextResponse.json({ error: 'Error al crear categoría' }, { status: 500 })
  }
}
