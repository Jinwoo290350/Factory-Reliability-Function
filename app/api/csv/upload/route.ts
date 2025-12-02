import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import Papa from 'papaparse'

interface CSVRow {
  Machine: string
  Component: string
  SupComponent?: string
  'Failure mode'?: string
  'Failure hours'?: string
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Read file content
    const content = await file.text()

    // Parse CSV
    const parseResult = Papa.parse<CSVRow>(content, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
    })

    if (parseResult.errors.length > 0) {
      return NextResponse.json(
        { error: 'CSV parsing error', details: parseResult.errors },
        { status: 400 }
      )
    }

    const csvData = parseResult.data

    // Create CSV upload record
    const csvUpload = await prisma.csvUpload.create({
      data: {
        userId: user.userId,
        filename: file.name,
        fileSize: file.size,
        recordsCount: csvData.length,
        status: 'processing',
      },
    })

    try {
      // Process each row and create components
      const components = await Promise.all(
        csvData.map(async (row) => {
          // Find or create machine
          let machine = await prisma.machine.findFirst({
            where: {
              userId: user.userId,
              name: row.Machine,
            },
          })

          if (!machine) {
            const maxSequence = await prisma.machine.findFirst({
              where: { userId: user.userId },
              orderBy: { sequence: 'desc' },
              select: { sequence: true },
            })

            machine = await prisma.machine.create({
              data: {
                userId: user.userId,
                name: row.Machine,
                sequence: (maxSequence?.sequence || 0) + 1,
              },
            })
          }

          // Create component
          return prisma.component.create({
            data: {
              userId: user.userId,
              machineId: machine.id,
              machineName: row.Machine,
              componentName: row.Component,
              subComponent: row.SupComponent,
              failureMode: row['Failure mode'],
              failureHours: row['Failure hours'] ? parseFloat(row['Failure hours']) : null,
            },
          })
        })
      )

      // Update CSV upload status
      await prisma.csvUpload.update({
        where: { id: csvUpload.id },
        data: {
          status: 'completed',
          processedAt: new Date(),
        },
      })

      return NextResponse.json({
        message: 'CSV uploaded and processed successfully',
        recordsProcessed: components.length,
        csvUploadId: csvUpload.id,
      })
    } catch (processingError) {
      // Update CSV upload status to failed
      await prisma.csvUpload.update({
        where: { id: csvUpload.id },
        data: {
          status: 'failed',
          errorMessage: processingError instanceof Error ? processingError.message : 'Unknown error',
          processedAt: new Date(),
        },
      })

      throw processingError
    }
  } catch (error) {
    console.error('CSV upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
