import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateHamburguerDto } from './dto/create-hamburguer.dto';
import { UpdateHamburguerDto } from './dto/update-hamburguer.dto';
import { Hamburguer, HamburguerImage } from './entities';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { join } from 'path';
import { existsSync } from 'fs';
import { unlink } from 'fs/promises';

@Injectable()
export class HamburguersService {
  private readonly logger = new Logger('HamburguersService');

  constructor(
    @InjectRepository(Hamburguer)
    private hamburguerRepository: Repository<Hamburguer>,

    @InjectRepository(HamburguerImage)
    private hamburguerImageRepository: Repository<HamburguerImage>,

    private readonly dataSource: DataSource
  ) { }

  async create(createHamburguerDto: CreateHamburguerDto) {
    const { img, ...hamburguerDetails } = createHamburguerDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const hamburguer = this.hamburguerRepository.create(hamburguerDetails);

      if (img) {
        const hamburguerImage = this.hamburguerImageRepository.create({ url: img });
        await queryRunner.manager.save(hamburguerImage);
        hamburguer.img = hamburguerImage;
      }

      await queryRunner.manager.save(hamburguer);

      await queryRunner.commitTransaction();
      return { ...hamburguer, img: img };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleDBExceptions(error);
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    const hamburguers = await this.hamburguerRepository.find({
      relations: ['img']
    });

    return hamburguers.map(hamburguer => {
      const { img, ...rest } = hamburguer;
      return {
        ...rest,
        img: img?.url || ''
      };
    });
  }

  findOne(id: string) {
    const hamburguer = this.hamburguerRepository.findOneBy({ id });
    return hamburguer;
  }

  async findOnePlain(id: string) {
    const hamburguer = await this.findOne(id);

    if (!hamburguer) {
      throw new NotFoundException(`Hamburguer with id ${id} not found`);
    }

    const { img, ...rest } = hamburguer;

    return {
      ...rest,
      img: img?.url || ''
    };
  }

  async update(id: string, updateHamburguerDto: UpdateHamburguerDto) {
    const { img, available, ...toUpdate } = updateHamburguerDto;
    const hamburguer = await this.hamburguerRepository.findOne({
      where: { id },
      relations: ['img']
    });

    if (!hamburguer) throw new NotFoundException(`Hamburguer with id ${id} not found`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (available !== undefined) {
        // Convert to string first then check for 'false'
        hamburguer.available = String(available).toLowerCase() !== 'false';
      }

      // Update other fields
      if (toUpdate.name) hamburguer.name = toUpdate.name;
      if (toUpdate.price) hamburguer.price = toUpdate.price;
      if (toUpdate.ingredients) hamburguer.ingredients = toUpdate.ingredients;
      if (toUpdate.branch) hamburguer.branch = toUpdate.branch;

      if (img) {
        if (hamburguer.img) {
          hamburguer.img.url = img;
          await queryRunner.manager.save(hamburguer.img);
        } else {
          const newImage = this.hamburguerImageRepository.create({ url: img });
          await queryRunner.manager.save(newImage);
          hamburguer.img = newImage;
        }
      }

      await queryRunner.manager.save(Hamburguer, hamburguer);
      await queryRunner.commitTransaction();

      const result = await this.findOnePlain(id);

      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleDBExceptions(error);
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string) {
    await this.hamburguerRepository.delete(id);
  }

  getStaticProductImage(imageName: string) {
    const path = join(__dirname, '../../static/hamburguer', imageName);
    if (!existsSync(path)) throw new BadRequestException(`No product found with name ${imageName}`);
    return path;
  }

  private async deleteImageFile(imageUrl: string) {
    try {
      const fileName = imageUrl.split('/').pop();
      const filePath = join(__dirname, '../../static/hamburguer', fileName);
      await unlink(filePath);
    } catch (error) {
      this.logger.error(`Failed to delete image file: ${error.message}`);
      // We don't throw here to allow the process to continue even if file deletion fails
    }
  }

  private handleDBExceptions(error: any) {
    this.logger.error(error);
    if (error.code === '23505')
      throw new BadRequestException(error.detail);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
