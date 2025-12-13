import { Module } from '@nestjs/common';
import { DiaryModule } from './diary/diary.module';
import { UploadController } from './upload.controller';
import { GeocodeController } from './geocode.controller';

@Module({
  imports: [DiaryModule],
  controllers: [UploadController, GeocodeController]
})
export class AppModule {}
