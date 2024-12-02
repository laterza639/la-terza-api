import { Controller, Get, Post, Body, Patch, Param, Delete, Res, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { SnacksService } from './snacks.service';
import { CreateSnackDto } from './dto/create-snack.dto';
import { UpdateSnackDto } from './dto/update-snack.dto';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter, fileNamer } from 'src/helpers';
import { diskStorage } from 'multer';

@Controller('snacks')
export class SnacksController {
  constructor(
    private readonly snacksService: SnacksService,
    private readonly configService: ConfigService
  ) { }

  @Get('file/:imageName')
  findProductImage(
    @Res() res: Response,
    @Param('imageName')
    imageName: string
  ) {
    const path = this.snacksService.getStaticProductImage(imageName);
    res.sendFile(path);
  }

  @Post()
  @UseInterceptors(FileInterceptor('img', {
    fileFilter: fileFilter,
    storage: diskStorage({
      destination: './static/snacks',
      filename: fileNamer
    })
  }))
  async create(
    @Body() createSnackDto: CreateSnackDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('Make sure that the file is an image');
    }

    const secureUrl = `${this.configService.get('HOST_API')}/snack/file/${file.filename}`;

    return this.snacksService.create({
      ...createSnackDto,
      img: secureUrl
    });
  }

  @Get()
  findAll() {
    return this.snacksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.snacksService.findOnePlain(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('img', {
    fileFilter: fileFilter,
    storage: diskStorage({
      destination: './static/snack',
      filename: fileNamer
    })
  }))
  async update(
    @Param('id') id: string,
    @Body() updateSnackDto: UpdateSnackDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (file) {
      const secureUrl = `${this.configService.get('HOST_API')}/snack/file/${file.filename}`;
      updateSnackDto.img = secureUrl;
    }

    return this.snacksService.update(id, updateSnackDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.snacksService.remove(id);
  }
}
