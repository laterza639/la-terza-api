import { Controller, Get, Post, Body, Patch, Param, Delete, Res, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { DessertsService } from './desserts.service';
import { CreateDessertDto } from './dto/create-dessert.dto';
import { UpdateDessertDto } from './dto/update-dessert.dto';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter, fileNamer } from 'src/helpers';
import { diskStorage } from 'multer';
import { Response } from 'express';

@Controller('desserts')
export class DessertsController {
  constructor(
    private readonly dessertsService: DessertsService,
    private readonly configService: ConfigService
  ) { }

  @Get('file/:imageName')
  findProductImage(
    @Res() res: Response,
    @Param('imageName')
    imageName: string
  ) {
    const path = this.dessertsService.getStaticProductImage(imageName);
    res.sendFile(path);
  }

  @Post()
  @UseInterceptors(FileInterceptor('img', {
    fileFilter: fileFilter,
    storage: diskStorage({
      destination: './static/dessert',
      filename: fileNamer
    })
  }))
  async create(
    @Body() createDessertDto: CreateDessertDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('Make sure that the file is an image');
    }

    const secureUrl = `${this.configService.get('HOST_API')}/dessert/file/${file.filename}`;

    return this.dessertsService.create({
      ...createDessertDto,
      img: secureUrl
    });
  }

  @Get()
  findAll() {
    return this.dessertsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dessertsService.findOnePlain(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('img', {
    fileFilter: fileFilter,
    storage: diskStorage({
      destination: './static/dessert',
      filename: fileNamer
    })
  }))
  async update(
    @Param('id') id: string,
    @Body() updatedessertDto: UpdateDessertDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (file) {
      const secureUrl = `${this.configService.get('HOST_API')}/dessert/file/${file.filename}`;
      updatedessertDto.img = secureUrl;
    }

    return this.dessertsService.update(id, updatedessertDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dessertsService.remove(id);
  }
}
