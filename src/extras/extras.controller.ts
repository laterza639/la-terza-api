import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ExtrasService } from './extras.service';
import { CreateExtraDto } from './dto/create-extra.dto';
import { UpdateExtraDto } from './dto/update-extra.dto';
import { ConfigService } from '@nestjs/config';

@Controller('extras')
export class ExtrasController {
  constructor(
    private readonly extrasService: ExtrasService,
    private readonly configService: ConfigService
  ) { }

  @Post()
  async create(
    @Body() createExtraDto: CreateExtraDto,
  ) {
    return this.extrasService.create(createExtraDto);
  }

  @Get()
  findAll() {
    return this.extrasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.extrasService.findOnePlain(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateExtraDto: UpdateExtraDto,
  ) {
    return this.extrasService.update(id, updateExtraDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.extrasService.remove(id);
  }
}
