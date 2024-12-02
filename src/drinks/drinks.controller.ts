import { Controller, Get, Post, Body, Patch, Param, Delete, Res, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { DrinksService } from './drinks.service';
import { CreateDrinkDto } from './dto/create-drink.dto';
import { UpdateDrinkDto } from './dto/update-drink.dto';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter, fileNamer } from 'src/helpers';
import { diskStorage } from 'multer';
 
@Controller('drinks')
export class DrinksController {
  constructor(
    private readonly drinksService: DrinksService,
    private readonly configService: ConfigService
  ) {}

  @Get('file/:imageName')
  findProductImage(
    @Res() res: Response,
    @Param('imageName')
    imageName: string
  ) {
    const path = this.drinksService.getStaticProductImage(imageName);
    res.sendFile(path);
  }

  @Post()
  @UseInterceptors(FileInterceptor('img', {
    fileFilter: fileFilter,
    storage: diskStorage({
      destination: './static/drink',
      filename: fileNamer
    })
  }))
  async create(
    @Body() createDrinkDto: CreateDrinkDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('Make sure that the file is an image');
    }

    const secureUrl = `${this.configService.get('HOST_API')}/drink/file/${file.filename}`;

    return this.drinksService.create({
      ...createDrinkDto,
      img: secureUrl
    });
  }

  @Get()
  findAll() {
    return this.drinksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.drinksService.findOnePlain(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('img', {
    fileFilter: fileFilter,
    storage: diskStorage({
      destination: './static/drink',
      filename: fileNamer
    })
  }))
  async update(
    @Param('id') id: string,
    @Body() updatedrinkDto: UpdateDrinkDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (file) {
      const secureUrl = `${this.configService.get('HOST_API')}/drink/file/${file.filename}`;
      updatedrinkDto.img = secureUrl;
    }

    return this.drinksService.update(id, updatedrinkDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.drinksService.remove(id);
  }
}
