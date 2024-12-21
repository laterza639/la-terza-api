import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateDessertDto } from './dto/create-dessert.dto';
import { UpdateDessertDto } from './dto/update-dessert.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Dessert, DessertImage } from './entities';
import { DataSource, Repository } from 'typeorm';
import { join } from 'path';
import { existsSync } from 'fs';
import { unlink } from 'fs/promises';

@Injectable()
export class DessertsService {
  private readonly logger = new Logger('DessertsService');

  constructor(
    @InjectRepository(Dessert)
    private dessertRepository: Repository<Dessert>,

    @InjectRepository(DessertImage)
    private dessertImageRepository: Repository<DessertImage>,

    private readonly dataSource: DataSource
  ) { }

  async create(createDessertDto: CreateDessertDto) {
    const { img, ...dessertDetails } = createDessertDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const dessert = this.dessertRepository.create(dessertDetails);

      if (img) {
        const dessertImage = this.dessertImageRepository.create({ url: img });
        await queryRunner.manager.save(dessertImage);
        dessert.img = dessertImage;
      }

      await queryRunner.manager.save(dessert);

      await queryRunner.commitTransaction();
      return { ...dessert, img: img };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleDBExceptions(error);
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    const desserts = await this.dessertRepository.find({
      relations: ['img']
    });

    return desserts.map(dessert => {
      const { img, ...rest } = dessert;
      return {
        ...rest,
        img: img?.url || ''
      };
    });
  }

  findOne(id: string) {
    const dessert = this.dessertRepository.findOneBy({ id });
    return dessert;
  }

  async findOnePlain(id: string) {
    const dessert = await this.findOne(id);

    if (!dessert) {
      throw new NotFoundException(`Dessert with id ${id} not found`);
    }

    const { img, ...rest } = dessert;

    return {
      ...rest,
      img: img?.url || ''
    };
  }

  async update(id: string, updateDessertDto: UpdateDessertDto) {
    const { img, available, ...toUpdate } = updateDessertDto;
    const dessert = await this.dessertRepository.findOne({
      where: { id },
      relations: ['img']
    });

    if (!dessert) throw new NotFoundException(`Dessert with id ${id} not found`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update dessert fields
      Object.assign(dessert, toUpdate);

      if (img) {
        if (dessert.img) {
          // Update existing image
          dessert.img.url = img;
          await queryRunner.manager.save(dessert.img);
        } else {
          // Create new image
          const newImage = this.dessertImageRepository.create({ url: img });
          await queryRunner.manager.save(newImage);
          dessert.img = newImage;
        }

        // Delete old image file if it exists
        if (dessert.img && dessert.img.url !== img) {
          await this.deleteImageFile(dessert.img.url);
        }
      }

      await queryRunner.manager.save(dessert);
      await queryRunner.commitTransaction();

      return this.findOnePlain(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleDBExceptions(error);
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string) {
    await this.dessertRepository.delete(id);
  }

  getStaticProductImage(imageName: string) {
    const path = join(__dirname, '../../static/dessert', imageName);
    if (!existsSync(path)) throw new BadRequestException(`No product found with name ${imageName}`);
    return path;
  }

  private async deleteImageFile(imageUrl: string) {
    try {
      const fileName = imageUrl.split('/').pop();
      const filePath = join(__dirname, '../../static/dessert', fileName);
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
