import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CreateDiaryDto, DiaryEntry } from './diary.dto';
import { DiaryService } from './diary.service';

@Controller('diary')
export class DiaryController {
  constructor(private readonly diaryService: DiaryService) {}

  @Get()
  getAll(): Promise<DiaryEntry[]> {
    return this.diaryService.findAll();
  }

  @Post()
  create(@Body() body: CreateDiaryDto): Promise<DiaryEntry> {
    return this.diaryService.create(body);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<DiaryEntry> {
    return this.diaryService.remove(id);
  }
}
