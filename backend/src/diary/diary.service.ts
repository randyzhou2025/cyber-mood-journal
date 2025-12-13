import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDiaryDto, DiaryEntry } from './diary.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DiaryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<DiaryEntry[]> {
    const list = await this.prisma.diaryEntry.findMany({
      orderBy: [{ happenedAt: 'desc' }, { createdAt: 'desc' }]
    });
    return list.map((item) => ({
      id: item.id,
      title: item.title,
      content: item.content,
      location: item.location || undefined,
      tags: item.tags || [],
      images: item.images || [],
      happenedAt: item.happenedAt?.toISOString(),
      createdAt: item.createdAt?.toISOString()
    }));
  }

  async create(dto: CreateDiaryDto): Promise<DiaryEntry> {
    const created = await this.prisma.diaryEntry.create({
      data: {
        title: dto.title,
        content: dto.content,
        location: dto.location,
        tags: dto.tags || [],
        images: dto.images || [],
        happenedAt: dto.happenedAt ? new Date(dto.happenedAt) : new Date()
      }
    });
    return {
      ...created,
      happenedAt: created.happenedAt?.toISOString(),
      createdAt: created.createdAt?.toISOString()
    };
  }

  async remove(id: string): Promise<DiaryEntry> {
    try {
      const removed = await this.prisma.diaryEntry.delete({ where: { id } });
      return {
        ...removed,
        happenedAt: removed.happenedAt?.toISOString(),
        createdAt: removed.createdAt?.toISOString()
      };
    } catch (e) {
      throw new NotFoundException('Entry not found');
    }
  }
}
