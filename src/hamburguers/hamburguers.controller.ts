import { Controller, Get, Post, Body, Patch, Param, Delete, Res, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { HamburguersService } from './hamburguers.service';
import { CreateHamburguerDto } from './dto/create-hamburguer.dto';
import { UpdateHamburguerDto } from './dto/update-hamburguer.dto';
import { ConfigService } from "@nestjs/config";
import { Response } from 'express';
import { FileInterceptor } from "@nestjs/platform-express";
import { fileFilter, fileNamer } from 'src/helpers';
import { diskStorage } from 'multer';

 
@Controller('hamburguers')
export class HamburguersController {
  constructor(
    private readonly hamburguersService: HamburguersService,
    private readonly configService: ConfigService
  ) { }

  @Get('file/:imageName')
  findProductImage(
    @Res() res: Response,
    @Param('imageName')
    imageName: string
  ) {
    const path = this.hamburguersService.getStaticProductImage(imageName);
    res.sendFile(path);
  }

  @Post()
  @UseInterceptors(FileInterceptor('img', {
    fileFilter: fileFilter,
    storage: diskStorage({
      destination: './static/hamburguer',
      filename: fileNamer
    })
  }))
  async create(
    @Body() createHamburguerDto: CreateHamburguerDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('Make sure that the file is an image');
    }

    const secureUrl = `${this.configService.get('HOST_API')}/hamburguer/file/${file.filename}`;

    return this.hamburguersService.create({
      ...createHamburguerDto,
      img: secureUrl
    });
  }

  @Get()
  findAll() {
    return this.hamburguersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hamburguersService.findOnePlain(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('img', {
    fileFilter: fileFilter,
    storage: diskStorage({
      destination: './static/hamburguer',
      filename: fileNamer
    })
  }))
  async update(
    @Param('id') id: string,
    @Body() updateHamburguerDto: UpdateHamburguerDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (file) {
      const secureUrl = `${this.configService.get('HOST_API')}/hamburguer/file/${file.filename}`;
      updateHamburguerDto.img = secureUrl;
    }

    return this.hamburguersService.update(id, updateHamburguerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hamburguersService.remove(id);
  }
}
