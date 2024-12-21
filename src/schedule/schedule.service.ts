import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule } from './entities/schedule.entity';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
  ) {}

  async create(createScheduleDto: CreateScheduleDto) {
    // Validate that if one time of a shift is provided, both are provided
    if (this.isInvalidShiftTime(createScheduleDto.morningOpenTime, createScheduleDto.morningCloseTime)) {
      throw new BadRequestException('Both morning open and close times must be provided if one is set');
    }
    if (this.isInvalidShiftTime(createScheduleDto.eveningOpenTime, createScheduleDto.eveningCloseTime)) {
      throw new BadRequestException('Both evening open and close times must be provided if one is set');
    }

    // Check if at least one shift is provided
    if (!this.hasValidShift(createScheduleDto)) {
      throw new BadRequestException('At least one shift (morning or evening) must be provided');
    }

    const existing = await this.scheduleRepository.findOneBy({
      branch: createScheduleDto.branch
    });

    if (existing) {
      Object.assign(existing, createScheduleDto);
      return this.scheduleRepository.save(existing);
    }

    const schedule = this.scheduleRepository.create(createScheduleDto);
    return this.scheduleRepository.save(schedule);
  }

  findAll() {
    return this.scheduleRepository.find();
  }

  findByBranch(branch: string) {
    return this.scheduleRepository.findOneBy({ branch });
  }

  async update(id: string, updateScheduleDto: UpdateScheduleDto) {
    const schedule = await this.scheduleRepository.findOneBy({ id });
    if (!schedule) throw new NotFoundException(`Schedule with ID ${id} not found`);

    // Validate shift times if they are being updated
    if (updateScheduleDto.morningOpenTime !== undefined || updateScheduleDto.morningCloseTime !== undefined) {
      const morningOpenTime = updateScheduleDto.morningOpenTime ?? schedule.morningOpenTime;
      const morningCloseTime = updateScheduleDto.morningCloseTime ?? schedule.morningCloseTime;
      if (this.isInvalidShiftTime(morningOpenTime, morningCloseTime)) {
        throw new BadRequestException('Both morning open and close times must be provided if one is set');
      }
    }

    if (updateScheduleDto.eveningOpenTime !== undefined || updateScheduleDto.eveningCloseTime !== undefined) {
      const eveningOpenTime = updateScheduleDto.eveningOpenTime ?? schedule.eveningOpenTime;
      const eveningCloseTime = updateScheduleDto.eveningCloseTime ?? schedule.eveningCloseTime;
      if (this.isInvalidShiftTime(eveningOpenTime, eveningCloseTime)) {
        throw new BadRequestException('Both evening open and close times must be provided if one is set');
      }
    }

    // Create updated schedule object
    const updatedSchedule = {
      ...schedule,
      ...updateScheduleDto
    };

    // Validate that at least one shift remains valid
    if (!this.hasValidShift(updatedSchedule)) {
      throw new BadRequestException('At least one shift (morning or evening) must be provided');
    }

    Object.assign(schedule, updateScheduleDto);
    return this.scheduleRepository.save(schedule);
  }

  async isCurrentlyOpen(branch: string) {
    const schedule = await this.scheduleRepository.findOneBy({
      branch,
      isOpen: true
    });

    if (!schedule) return false;

    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });

    const isMorningShift = Boolean(
      schedule.morningOpenTime &&
      schedule.morningCloseTime &&
      currentTime >= schedule.morningOpenTime &&
      currentTime <= schedule.morningCloseTime
    );

    const isEveningShift = Boolean(
      schedule.eveningOpenTime &&
      schedule.eveningCloseTime &&
      currentTime >= schedule.eveningOpenTime &&
      currentTime <= schedule.eveningCloseTime
    );

    return isMorningShift || isEveningShift;
  }

  private isInvalidShiftTime(openTime?: string | null, closeTime?: string | null): boolean {
    return Boolean((openTime && !closeTime) || (!openTime && closeTime));
  }

  private hasValidShift(schedule: Partial<Schedule>): boolean {
    const hasMorningShift = Boolean(schedule.morningOpenTime && schedule.morningCloseTime);
    const hasEveningShift = Boolean(schedule.eveningOpenTime && schedule.eveningCloseTime);
    return Boolean(hasMorningShift || hasEveningShift);
  }
}