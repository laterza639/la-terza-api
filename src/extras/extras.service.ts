import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateExtraDto } from './dto/create-extra.dto';
import { UpdateExtraDto } from './dto/update-extra.dto';
import { Extra } from './entities/extra.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class ExtrasService {
  private readonly logger = new Logger('ExtrasService');

  constructor(
    @InjectRepository(Extra)
    private extraRepository: Repository<Extra>,

    private readonly dataSource: DataSource
  ) { }

  async create(createExtraDto: CreateExtraDto) {
    const { ...extraDetails } = createExtraDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const extra = this.extraRepository.create(extraDetails);

      await queryRunner.manager.save(extra);

      await queryRunner.commitTransaction();
      return { ...extra };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleDBExceptions(error);
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    const extras = await this.extraRepository.find();

    return extras.map(extra => {
      const { ...rest } = extra;
      return { ...rest };
    });
  }

  findOne(id: string) {
    const extra = this.extraRepository.findOneBy({ id });
    return extra;
  }

  async findOnePlain(id: string) {
    const extra = await this.findOne(id);

    if (!extra) {
      throw new NotFoundException(`Extra with id ${id} not found`);
    }

    const { ...rest } = extra;

    return { ...rest };
  }

  async update(id: string, updateExtraDto: UpdateExtraDto) {
    const { ...toUpdate } = updateExtraDto;
    const extra = await this.extraRepository.findOne({ where: { id } });

    if (!extra) throw new NotFoundException(`Extra with id ${id} not found`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update extra fields
      Object.assign(extra, toUpdate);

      await queryRunner.manager.save(extra);
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
    await this.extraRepository.delete(id);
  }

  private handleDBExceptions(error: any) {
    this.logger.error(error);
    if (error.code === '23505')
      throw new BadRequestException(error.detail);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
