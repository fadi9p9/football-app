import { Injectable, mixin, NestInterceptor, Type } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export function ImageUploadInterceptor(fieldName: string = 'image'): Type<NestInterceptor> {
  @Injectable()
  class MixinInterceptor implements NestInterceptor {
    fileInterceptor: NestInterceptor;
    
    constructor() {
      const options: MulterOptions = {
        storage: diskStorage({
          destination: './uploads/team-posts',
          filename: (req, file, cb) => {
            const safeName = file.originalname
              .replace(/\s+/g, '-')
              .replace(/[^\w.-]/g, '');
            const uniqueName = `${Date.now()}-${safeName}`;
            cb(null, uniqueName);
          },
        }),
        fileFilter: (req, file, cb) => {
          const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
          if (!allowedTypes.includes(file.mimetype)) {
            req.fileValidationError = 'Invalid file type';
            return cb(null, false);
          }
          cb(null, true);
        },
        limits: {
          fileSize: 10 * 1024 * 1024 // 10MB
        }
      };
      this.fileInterceptor = new (FileInterceptor(fieldName, options));
    }

    intercept(...args: Parameters<NestInterceptor['intercept']>) {
      return this.fileInterceptor.intercept(...args);
    }
  }
  return mixin(MixinInterceptor);
}