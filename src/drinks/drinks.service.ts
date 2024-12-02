import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateDrinkDto } from './dto/create-drink.dto';
import { UpdateDrinkDto } from './dto/update-drink.dto';
import { Drink, DrinkImage } from './entities';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { join } from 'path';
import { existsSync } from 'fs';
import { unlink } from 'fs/promises';

@Injectable()
export class DrinksService {
  private readonly logger = new Logger('DrinksService');

  constructor(
    @InjectRepository(Drink)
    private drinkRepository: Repository<Drink>,

    @InjectRepository(DrinkImage)
    private drinkImageRepository: Repository<DrinkImage>,

    private readonly dataSource: DataSource
  ) { }

  async create(createDrinktDto: CreateDrinkDto) {
    const { img, ...drinkDetails } = createDrinktDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const drink = this.drinkRepository.create(drinkDetails);

      if (img) {
        const drinkImage = this.drinkImageRepository.create({ url: img });
        await queryRunner.manager.save(drinkImage);
        drink.img = drinkImage;
      }

      await queryRunner.manager.save(drink);

      await queryRunner.commitTransaction();
      return { ...drink, img: img };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleDBExceptions(error);
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    const drinks = await this.drinkRepository.find({
      relations: ['img']
    });

    return drinks.map(drink => {
      const { img, ...rest } = drink;
      return {
        ...rest,
        img: img?.url || ''
      };
    });
  }

  findOne(id: string) {
    const drink = this.drinkRepository.findOneBy({ id });
    return drink;
  }

  async findOnePlain(id: string) {
    const drink = await this.findOne(id);

    if (!drink) {
      throw new NotFoundException(`Drink with id ${id} not found`);
    }

    const { img, ...rest } = drink;

    return {
      ...rest,
      img: img?.url || ''
    };
  }

  async update(id: string, updateDrinkDto: UpdateDrinkDto) {
    const { img, ...toUpdate } = updateDrinkDto;
    const drink = await this.drinkRepository.findOne({
      where: { id },
      relations: ['img']
    });

    if (!drink) throw new NotFoundException(`Drink with id ${id} not found`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update drink fields
      Object.assign(drink, toUpdate);

      if (img) {
        if (drink.img) {
          // Update existing image
          drink.img.url = img;
          await queryRunner.manager.save(drink.img);
        } else {
          // Create new image
          const newImage = this.drinkImageRepository.create({ url: img });
          await queryRunner.manager.save(newImage);
          drink.img = newImage;
        }

        // Delete old image file if it exists
        if (drink.img && drink.img.url !== img) {
          await this.deleteImageFile(drink.img.url);
        }
      }

      await queryRunner.manager.save(drink);
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
    await this.drinkRepository.delete(id);
  }

  getStaticProductImage(imageName: string) {
    const path = join(__dirname, '../../static/drink', imageName);
    if (!existsSync(path)) throw new BadRequestException(`No product found with name ${imageName}`);
    return path;
  }

  private async deleteImageFile(imageUrl: string) {
    try {
      const fileName = imageUrl.split('/').pop();
      const filePath = join(__dirname, '../../static/drink', fileName);
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
