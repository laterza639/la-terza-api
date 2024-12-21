import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateSnackDto } from './dto/create-snack.dto';
import { UpdateSnackDto } from './dto/update-snack.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Snack, SnackImage } from './entities';
import { DataSource, Repository } from 'typeorm';
import { join } from 'path';
import { existsSync } from 'fs';
import { unlink } from 'fs/promises';

@Injectable()
export class SnacksService {
  private readonly logger = new Logger('SnacksService');

  constructor(
    @InjectRepository(Snack)
    private snackRepository: Repository<Snack>,

    @InjectRepository(SnackImage)
    private snackImageRepository: Repository<SnackImage>,

    private readonly dataSource: DataSource
  ) { }

  async create(createSnackDto: CreateSnackDto) {
    const { img, ...snackDetails } = createSnackDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const snack = this.snackRepository.create(snackDetails);

      if (img) {
        const snackImage = this.snackImageRepository.create({ url: img });
        await queryRunner.manager.save(snackImage);
        snack.img = snackImage;
      }

      await queryRunner.manager.save(snack);

      await queryRunner.commitTransaction();
      return { ...snack, img: img };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleDBExceptions(error);
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    const snacks = await this.snackRepository.find({
      relations: ['img']
    });

    return snacks.map(snack => {
      const { img, ...rest } = snack;
      return {
        ...rest,
        img: img?.url || ''
      };
    });
  }

  findOne(id: string) {
    const snack = this.snackRepository.findOneBy({ id });
    return snack;
  }

  async findOnePlain(id: string) {
    const snack = await this.findOne(id);

    if (!snack) {
      throw new NotFoundException(`Snack with id ${id} not found`);
    }

    const { img, ...rest } = snack;

    return {
      ...rest,
      img: img?.url || ''
    };
  }

  async update(id: string, updateSnackDto: UpdateSnackDto) {
    const { img, available, ...toUpdate } = updateSnackDto;
    const snack = await this.snackRepository.findOne({
      where: { id },
      relations: ['img']
    });

    if (!snack) throw new NotFoundException(`Snack with id ${id} not found`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (available !== undefined) {
        // Convert to string first then check for 'false'
        snack.available = String(available).toLowerCase() !== 'false';
      }

      // Update other fields
      if (toUpdate.name) snack.name = toUpdate.name;
      if (toUpdate.price) snack.price = toUpdate.price;
      if (toUpdate.branch) snack.branch = toUpdate.branch;

      if (img) {
        if (snack.img) {
          snack.img.url = img;
          await queryRunner.manager.save(snack.img);
        } else {
          const newImage = this.snackImageRepository.create({ url: img });
          await queryRunner.manager.save(newImage);
          snack.img = newImage;
        }
      }

      await queryRunner.manager.save(Snack, snack);
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
    await this.snackRepository.delete(id);
  }

  getStaticProductImage(imageName: string) {
    const path = join(__dirname, '../../static/snack', imageName);
    if (!existsSync(path)) throw new BadRequestException(`No product found with name ${imageName}`);
    return path;
  }

  private async deleteImageFile(imageUrl: string) {
    try {
      const fileName = imageUrl.split('/').pop();
      const filePath = join(__dirname, '../../static/snack', fileName);
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
