import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import COS from 'cos-nodejs-sdk-v5';

@Controller('upload')
export class UploadController {
  private cos: COS | null;
  private cosBucket: string;
  private cosRegion: string;
  private cosBaseUrl: string | null;
  private cosPrefix: string;
  private useCos: boolean;

  constructor() {
    this.useCos = (process.env.UPLOAD_STRATEGY || '').toLowerCase() !== 'local';
    const secretId = process.env.COS_SECRET_ID;
    const secretKey = process.env.COS_SECRET_KEY;
    this.cosBucket = process.env.COS_BUCKET || '';
    this.cosRegion = process.env.COS_REGION || '';
    this.cosBaseUrl = process.env.COS_BASE_URL || null;
    this.cosPrefix = process.env.COS_PREFIX || 'uploads/';
    this.cos =
      this.useCos && secretId && secretKey && this.cosBucket && this.cosRegion
        ? new COS({ SecretId: secretId, SecretKey: secretKey })
        : null;
  }

  private async uploadToCOS(file: Express.Multer.File): Promise<string> {
    if (!this.cos) {
      throw new Error('COS not configured');
    }
    const filename = `${this.cosPrefix}${randomUUID()}${extname(file.originalname) || '.bin'}`;
    await this.cos.putObject({
      Bucket: this.cosBucket,
      Region: this.cosRegion,
      Key: filename,
      Body: file.buffer,
      ContentType: file.mimetype || undefined
    });
    if (this.cosBaseUrl) {
      return `${this.cosBaseUrl.replace(/\/$/, '')}/${filename}`;
    }
    return `https://${this.cosBucket}.cos.${this.cosRegion}.myqcloud.com/${filename}`;
  }

private async uploadToLocal(file: Express.Multer.File): Promise<string> {
  const uploadDir = process.env.UPLOAD_DIR || '/data/uploads';
  const publicPath = process.env.UPLOAD_PUBLIC_PATH || '/uploads';

  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
  }

  const ext = extname(file.originalname);
  const filename = `${randomUUID()}${ext || '.bin'}`;

  writeFileSync(join(uploadDir, filename), file.buffer);

  return `${publicPath}/${filename}`;
}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage()
    })
  )
  async upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { url: '', error: 'no file' };
    }
    try {
      if (this.useCos && this.cos) {
        const url = await this.uploadToCOS(file);
        return { url };
      }
    } catch (e: any) {
      // fallback to local
      console.error('COS upload failed, fallback to local', e?.message || e);
    }
    const localUrl = await this.uploadToLocal(file);
    return { url: localUrl };
  }
}
